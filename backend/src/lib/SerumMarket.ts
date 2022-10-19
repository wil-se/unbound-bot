import { Connection, PublicKey, Account, Keypair } from '@solana/web3.js';
import { Market } from '@project-serum/serum';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import ISerumMarket from '../types';


class SerumMarket implements ISerumMarket {
    rpc: string;
    connection: Connection;
    marketAddressPubKey: string;
    programAddressPubKey: string;
    secretKey: number[];
    
    constructor(rpc: string, secretKey?: number[], marketAddressPubKey?: string, programAddressPubKey?: string) {
        this.rpc = rpc;
        this.connection = new Connection(this.rpc);
        this.marketAddressPubKey = marketAddressPubKey ? marketAddressPubKey : '';
        this.programAddressPubKey = programAddressPubKey ? programAddressPubKey : '';
        this.secretKey = secretKey ? secretKey : [];
    }

    packReturn(result: any, message: string = '', success: boolean = false, txs: string[] = []) {
        return {
            result: result,
            message: message,
            success: success,
            txs: txs
        };
    }

    async getMarket() {
        return await Market.load(this.connection, new PublicKey(this.marketAddressPubKey), {}, new PublicKey(this.programAddressPubKey));
    }

    async getBids() {
        try {
            let market = await this.getMarket();
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

    async getAsks() {
        try {
            let market = await this.getMarket();
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

    async getOrderBook() {
        try {
            let market = await this.getMarket();
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
            return this.packReturn(true, '', true, [tx]);
        } catch (e) {
            return this.packReturn(false, (e as Error).message);
        }
    }

    async getOrders() {
        try {
            let market = await this.getMarket();
            let orders = await market.loadOrdersForOwner(this.connection, new Account(this.secretKey).publicKey);
            return this.packReturn(orders, '', true);
        } catch (e) {
            return this.packReturn([], (e as Error).message);
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
            return this.packReturn(true, '', true, txs);
        } catch (e) {
            return this.packReturn(false, (e as Error).message)
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
            }
            return this.packReturn(success, '', true, [tx]);
        } catch (e) {
            return this.packReturn(false, (e as Error).message);
        }
    }

    async getFilledOrders() {
        try {
            let market = await this.getMarket();
            let fills = await market.loadFills(this.connection);
            return this.packReturn(fills, '', true);
        } catch (e) {
            return this.packReturn([], (e as Error).message);
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
            return this.packReturn(true, '', true, txs);
        } catch (e) {
            return this.packReturn(false, (e as Error).message);
        }
    }
}

export default SerumMarket;