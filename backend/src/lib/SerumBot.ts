import { Connection, PublicKey, Account, Keypair } from '@solana/web3.js';
import { Market } from '@project-serum/serum';
import ISerumBot from '../types';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
const axios = require('axios');


const dev_private_key = [112, 193, 211, 167, 13, 176, 191, 66, 106, 194, 144, 11, 154, 156, 158, 19, 165, 174, 53, 193, 146, 74, 147, 205, 153, 126, 160, 148, 4, 244, 176, 57, 234, 182, 221, 93, 0, 55, 59, 175, 156, 207, 42, 244, 82, 142, 187, 96, 1, 154, 223, 223, 107, 21, 103, 121, 116, 181, 110, 167, 158, 128, 251, 74]


class SerumBot implements ISerumBot {
    rpc: string;
    connection: Connection;

    constructor(rpc: string) {
        this.rpc = rpc;
        this.connection = new Connection(this.rpc);
    }

    packReturn(result: any, message: string = '', success: boolean = false, txs: string[] = []) {
        return {
            result: result,
            message: message,
            success: success,
            txs: txs
        };
    }

    async getBids(marketAddressPubKey: string, programAddressPubKey: string) {
        try {
            let programAddress = new PublicKey(programAddressPubKey);
            let marketAddress = new PublicKey(marketAddressPubKey);
            let market = await Market.load(this.connection, marketAddress, {}, programAddress);
            let bids = await market.loadBids(this.connection);
            let result = [];
            for (let order of bids) {
                result.push({
                    'orderId': order.orderId,
                    'price': order.price,
                    'size': order.size,
                    'side': order.side
                });
            }
            return this.packReturn(result, '', true, []);
        } catch (e) {
            return this.packReturn([], (e as Error).message);
        }
    }

    async getAsks(marketAddressPubKey: string, programAddressPubKey: string) {
        try {
            let programAddress = new PublicKey(programAddressPubKey);
            let marketAddress = new PublicKey(marketAddressPubKey);
            let market = await Market.load(this.connection, marketAddress, {}, programAddress);
            let asks = await market.loadAsks(this.connection);
            let result = [];
            for (let order of asks) {
                result.push({
                    'orderId': order.orderId,
                    'price': order.price,
                    'size': order.size,
                    'side': order.side
                });
            }
            return this.packReturn(result, '', true, []);
        } catch (e) {
            return this.packReturn([], (e as Error).message);
        }
    }

    async getOrderBook(marketAddressPubKey: string, programAddressPubKey: string) {
        try {
            let programAddress = new PublicKey(programAddressPubKey);
            let marketAddress = new PublicKey(marketAddressPubKey);
            let market = await Market.load(this.connection, marketAddress, {}, programAddress);
            let asks = await market.loadAsks(this.connection);
            let bids = await market.loadBids(this.connection);
            let asks_result = [];
            for (let order of asks) {
                asks_result.push({
                    'orderId': order.orderId,
                    'price': order.price,
                    'size': order.size,
                    'side': order.side
                });
            }
            let bids_result = [];
            for (let order of bids) {
                bids_result.push({
                    'orderId': order.orderId,
                    'price': order.price,
                    'size': order.size,
                    'side': order.side
                });
            }
            return this.packReturn({
                asks: asks_result,
                bids: bids_result.reverse(),
                baseMintAddress: market.baseMintAddress,
                quoteMintAddress: market.quoteMintAddress
            }, '', true);
        } catch (e) {
            return this.packReturn({}, (e as Error).message);
        }
    }

    async getPairInfo(baseAddress: string, quoteAddress: string) {
        try {
            let info = await axios.get(`https://price.jup.ag/v1/price?id=${baseAddress}&vsToken=${quoteAddress}`);
            return this.packReturn({
                baseSymbol: info.data.data.mintSymbol,
                quoteSymbol: info.data.data.vsTokenSymbol,
                price: info.data.data.price
            }, '', true);
        } catch (e) {
            return this.packReturn(-1, (e as Error).message);
        }
    }

    async placeOrder(marketAddressPubKey: string, programAddressPubKey: string, side: 'buy' | 'sell', price: number, size: number, orderType: 'limit' | 'ioc' | 'postOnly') {
        try {
            let programAddress = new PublicKey(programAddressPubKey);
            let marketAddress = new PublicKey(marketAddressPubKey);
            let market = await Market.load(this.connection, marketAddress, {}, programAddress);
            let owner = new Account(dev_private_key);
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
            return this.packReturn(true, '', true, [tx]);
        } catch (e) {
            return this.packReturn(false, (e as Error).message);
        }
    }

    async getOrders(marketAddressPubKey: string, programAddressPubKey: string) {
        try {
            let programAddress = new PublicKey(programAddressPubKey);
            let marketAddress = new PublicKey(marketAddressPubKey);
            let market = await Market.load(this.connection, marketAddress, {}, programAddress);
            let orders = await market.loadOrdersForOwner(this.connection, new Account(dev_private_key).publicKey);
            return this.packReturn(orders, '', true);
        } catch (e) {
            return this.packReturn([], (e as Error).message);
        }
    }

    async cancelAllOrders(marketAddressPubKey: string, programAddressPubKey: string) {
        try {
            let programAddress = new PublicKey(programAddressPubKey);
            let marketAddress = new PublicKey(marketAddressPubKey);
            let market = await Market.load(this.connection, marketAddress, {}, programAddress);
            let orders = await market.loadOrdersForOwner(this.connection, new Account(dev_private_key).publicKey);
            let owner = new Account(dev_private_key);
            let txs: string[] = [];
            for (let order of orders) {
                txs.push(await market.cancelOrder(this.connection, owner, order));
            }
            return this.packReturn(true, '', true, txs);
        } catch (e) {
            return this.packReturn(false, (e as Error).message)
        }
    }

    async cancelOrder(marketAddressPubKey: string, programAddressPubKey: string, orderId: string) {
        try {
            let programAddress = new PublicKey(programAddressPubKey);
            let marketAddress = new PublicKey(marketAddressPubKey);
            let market = await Market.load(this.connection, marketAddress, {}, programAddress);
            let orders = await market.loadOrdersForOwner(this.connection, new Account(dev_private_key).publicKey);
            let owner = new Account(dev_private_key);
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
                orders = await market.loadOrdersForOwner(this.connection, new Account(dev_private_key).publicKey);
            }
            return this.packReturn(success, '', true, [tx]);
        } catch (e) {
            return this.packReturn(false, (e as Error).message);
        }
    }

    async getFilledOrders(marketAddressPubKey: string, programAddressPubKey: string) {
        try {
            let programAddress = new PublicKey(programAddressPubKey);
            let marketAddress = new PublicKey(marketAddressPubKey);
            let market = await Market.load(this.connection, marketAddress, {}, programAddress);
            let fills = await market.loadFills(this.connection);
            return this.packReturn(fills, '', true);
        } catch (e) {
            return this.packReturn([], (e as Error).message);
        }
    }

    async settleFunds(marketAddressPubKey: string, programAddressPubKey: string) {
        try {
            let programAddress = new PublicKey(programAddressPubKey);
            let marketAddress = new PublicKey(marketAddressPubKey);
            let market = await Market.load(this.connection, marketAddress, {}, programAddress);
            let owner = new Account(dev_private_key);
            let txs: string[] = [];
            for (let openOrders of await market.findOpenOrdersAccountsForOwner(this.connection, owner.publicKey,)) {
                if (openOrders.baseTokenFree > 0 || openOrders.quoteTokenFree > 0) {
                    let baseTokenAccount = new PublicKey(await (await getOrCreateAssociatedTokenAccount(this.connection, owner, market.baseMintAddress, owner.publicKey)).address);
                    let quoteTokenAccount = new PublicKey(await (await getOrCreateAssociatedTokenAccount(this.connection, owner, market.quoteMintAddress, owner.publicKey)).address);
                    txs.push(await market.settleFunds(this.connection, owner, openOrders, baseTokenAccount, quoteTokenAccount));
                }
            }
            return this.packReturn(true, '', true, txs);
        } catch (e) {
            return this.packReturn(false, (e as Error).message);
        }
    }
}

export default SerumBot;