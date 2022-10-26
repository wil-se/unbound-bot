import { Connection, PublicKey, Account, Keypair } from '@solana/web3.js';
import { Market } from '@project-serum/serum';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import { Logger, ILogObject } from "tslog";
import { appendFileSync } from "fs";
import OrderBook,  { IOrderBook } from '../models/OrderBook';
import Order,  { IOrder } from '../models/Order';
import { connect, disconnect } from 'mongoose';
import { DB_CONN_STRING } from '../config/env';

function logToTransport(logObject: ILogObject) {
  appendFileSync("logs/SerumAMM.log", `[${logObject.date.toLocaleString()}] - ${logObject.logLevel.toUpperCase()} - function ${logObject.functionName}():\n${logObject.loggerName} ${logObject.argumentsArray}` + "\n");
}

class Serum {
  log: Logger = new Logger({ name: "SERUM", printLogMessageInNewLine: true });
  rpc: string;
  connection: Connection;
  marketAddressPubKey: string;
  programAddressPubKey: string;
  secretKey: number[];
  baseMintAddress?: string;
  quoteMintAddress?: string;
  // import bn and replace orderId: any; with orderId: BN;
  asks?: { orderId: any; price: number; size: number; side: "buy" | "sell"; }[];
  bids?: { orderId: any; price: number; size: number; side: "buy" | "sell"; }[];
  dbConnection?: any;
  dbName: string;

  constructor(dbName: string, rpc: string, secretKey?: number[], marketAddressPubKey?: string, programAddressPubKey?: string) {
    this.rpc = rpc;
    this.connection = new Connection(this.rpc);
    this.marketAddressPubKey = marketAddressPubKey ? marketAddressPubKey : '';
    this.programAddressPubKey = programAddressPubKey ? programAddressPubKey : '';
    this.secretKey = secretKey ? secretKey : [];
    this.dbName = dbName;
    this.log.attachTransport(
      {
        silly: logToTransport,
        debug: logToTransport,
        trace: logToTransport,
        info: logToTransport,
        warn: logToTransport,
        error: logToTransport,
        fatal: logToTransport,
      },
      "debug"
    );
    this.log.info('Initialized')
  }

  async init() {
    this.dbConnection = await connect(DB_CONN_STRING + this.dbName);
  }

  async terminate() {
    await this.dbConnection.disconnect();
  }

  async getMarket() {
    this.log.info(`Fetching market ${this.marketAddressPubKey} for program ${this.programAddressPubKey}`)
    return await Market.load(this.connection, new PublicKey(this.marketAddressPubKey), {}, new PublicKey(this.programAddressPubKey));
  }

  async fetchOrderBook() {
    try {
      let market = await this.getMarket();
      let asks = await market.loadAsks(this.connection);
      let bids = await market.loadBids(this.connection);
      let asks_result = [];
      for (let order of asks) {
        asks_result.push({
          'orderId': order.orderId.toString(),
          'price': order.price,
          'size': order.size,
          'side': order.side
        });
      }
      let bids_result = [];
      for (let order of bids) {
        bids_result.push({
          'orderId': order.orderId.toString(),
          'price': order.price,
          'size': order.size,
          'side': order.side
        });
      }
      this.baseMintAddress = market.baseMintAddress.toString();
      this.quoteMintAddress = market.quoteMintAddress.toString();
      this.asks = asks_result;
      this.bids = bids_result;
      this.log.info('Fetching orderbook');

      const orderBook: IOrderBook = new OrderBook({
        asks: asks_result,
        bids: bids_result,
      });
      await orderBook.save();
      
      return [
        asks_result,
        bids_result,
        market.baseMintAddress.toString(),
        market.quoteMintAddress.toString()
      ];
    } catch (e) {
      this.log.error((e as Error).message);
      return [[], [], '', '']
    }
  }

  async placeOrder(side: 'buy' | 'sell', price: number, size: number, orderType: 'limit' | 'ioc' | 'postOnly') {
    try {
      let market = await this.getMarket();
      let owner = new Account(this.secretKey);
      let payer: PublicKey;
      if (side === 'sell') {
        payer = new PublicKey(owner.publicKey);
      } else {
        let associatedToken = await getOrCreateAssociatedTokenAccount(this.connection, owner, market.quoteMintAddress, owner.publicKey);
        payer = new PublicKey(associatedToken.address);
      }
      let tx = await market.placeOrder(this.connection, {
        owner,
        payer,
        side: side,
        price: price,
        size: size,
        orderType: orderType,
      });

      let order: IOrder = new Order({
        owner: owner.publicKey.toString(),
        payer: payer.toString(),
        side: side,
        price: price,
        size: size,
        orderType: orderType,
        tx: tx
      });
      order.save();

      this.log.info(`Order sent, tx: ${tx}`)
      return [true, tx];
    } catch (e) {
      this.log.error((e as Error).message);
      return [false, ''];
    }
  }

  async getOrders() {
    try {
      let market = await this.getMarket();
      let orders = await market.loadOrdersForOwner(this.connection, new Account(this.secretKey).publicKey);
      this.log.info(`Fetching orders`);
      return orders;
    } catch (e) {
      this.log.error((e as Error).message);
      return [];
    }
  }

  async cancelAllOrders() {
    try {
      let market = await this.getMarket();
      let orders = await market.loadOrdersForOwner(this.connection, new Account(this.secretKey).publicKey);
      let owner = new Account(this.secretKey);
      let txs: string[] = [];
      for (let order of orders) {
        txs.push(await market.cancelOrder(this.connection, owner, order));
      }
      this.log.info(`Cancelling all orders, txs: ${txs}`);
      return [true, txs];
    } catch (e) {
      this.log.error((e as Error).message);
      return [false, []];
    }
  }

  async cancelOrder(orderId: string) {
    try {
      let market = await this.getMarket();
      let orders = await market.loadOrdersForOwner(this.connection, new Account(this.secretKey).publicKey);
      let owner = new Account(this.secretKey);
      let tx: string = '';
      let success: boolean = false;
      for (let i = 0; i < 5; i++) {
        for (let order of orders) {
          if (orderId === `0${order.orderId.toString(16)}`) {
            tx = await market.cancelOrder(this.connection, owner, order);
            success = true;
          }
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        orders = await market.loadOrdersForOwner(this.connection, new Account(this.secretKey).publicKey);
        this.log.info('Cancelling all orders');
      }
      this.log.info(`Cancelling order, tx: ${tx}`);
      return [success, tx];
    } catch (e) {
      this.log.error((e as Error).message);
      return [false, ''];
    }
  }

  async getFilledOrders() {
    try {
      let market = await this.getMarket();
      let fills = await market.loadFills(this.connection);
      this.log.info(`Getting filled orders`);
      return [fills];
    } catch (e) {
      this.log.error((e as Error).message);
      return [];
    }
  }

  async settleFunds() {
    try {
      let market = await this.getMarket();
      let owner = new Account(this.secretKey);
      let txs: string[] = [];
      for (let openOrders of await market.findOpenOrdersAccountsForOwner(this.connection, owner.publicKey,)) {
        if (openOrders.baseTokenFree > 0 || openOrders.quoteTokenFree > 0) {
          let baseTokenAccount = new PublicKey(await (await getOrCreateAssociatedTokenAccount(this.connection, owner, market.baseMintAddress, owner.publicKey)).address);
          let quoteTokenAccount = new PublicKey(await (await getOrCreateAssociatedTokenAccount(this.connection, owner, market.quoteMintAddress, owner.publicKey)).address);
          txs.push(await market.settleFunds(this.connection, owner, openOrders, baseTokenAccount, quoteTokenAccount));
        }
      }
      this.log.info(`Settling funds, txs: ${txs}`);
      return [true, txs];
    } catch (e) {
      this.log.error((e as Error).message);
      return [false, []];
    }
  }
}

export default Serum;