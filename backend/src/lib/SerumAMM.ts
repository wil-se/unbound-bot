import { Logger, ILogObject } from "tslog";
import { appendFileSync } from "fs";
import Config, { IConfig } from '../models/AMMConfig';
import Serum from './Serum';
import { getPairInfo } from '../utils'
import PairPrice, { IPairPrice } from '../models/PairPrice';
import { PublicKey, Account } from '@solana/web3.js';
import { getAssociatedTokenAddress } from "@solana/spl-token";
const FileSystem = require("fs");


const defaultConfig = {
    priceCheckInterval: 1000, // check price every priceCheckIntervalms 
    priceCheckIntervalDelta: 3600, // save a list of priceCheckIntervalDelta elements max
    /*
    the program checks the price every priceCheckInterval milliseconds. 
    if there are more than priceCheckIntervalDelta then
    delete the oldest PairPrice object and save a new PairPrice object
    else save a PairPrice object.
    the oldest object is of priceCheckIntervalDelta * priceCheckInterval milliseconds ago
    */
    maxPriceDivergence: 5, // close positions if divergence between
    // newest and oldest price is greater than maxPriceDivergence
    askPercentage: 50, // allocate askPercentage of the base token to asks
    bidPercentage: 50, // allocate askPercentage of the base token to bids
    width: 10.0, // make bids between width-price < price < price+width
    stretch: 1.1, // scale space between prices of the orders
    threshold: 0.1, // price-width < -threshold < price < threshold < price+width
    // there are no bids between threshold
    // orders will be placed between (price-width and price-threshold)
    // and between (price+threshold and price width) 
    a: 1.1, // parabola equation parameteres   
    b: 1.1, // ax^2+bx+c used to get the sizes of orders
    c: 1.1  // the sum of the sizes of an ask or a bid list must be 1
    // so it can be proportioned with askPercentage and bidPercentage

    // run python3 charts/orders.py to display the amm config visually
} as IConfig

// log formatter
function logToTransport(logObject: ILogObject) {
    appendFileSync("logs/SerumAMM.log", `[${logObject.date.toLocaleString()}] - ${logObject.logLevel.toUpperCase()} - function ${logObject.functionName}():\n${logObject.loggerName} ${logObject.argumentsArray}` + "\n");
}

export default class SerumAMM {
    serum: Serum;
    config: IConfig;
    log: Logger = new Logger({ name: "AMM", printLogMessageInNewLine: true });
    paper: boolean;

    constructor(dbName: string, rpc: string, secretKey?: number[], marketAddressPubKey?: string, programAddressPubKey?: string, paper = true) {
        this.serum = new Serum(dbName, rpc, secretKey, marketAddressPubKey, programAddressPubKey);
        this.config = defaultConfig;
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
        this.paper = paper;
    }

    async setConfig(id: string, priceCheckInterval: number, priceCheckIntervalDelta: number, width: number, stretch: number, threshold: number, a: number, b: number, c: number) {
        try {
            let conf: IConfig | null = await Config.findById(id);
            if (conf !== null) {
                conf.priceCheckInterval = priceCheckInterval
                conf.priceCheckIntervalDelta = priceCheckIntervalDelta
                conf.width = width
                conf.stretch = stretch
                conf.threshold = threshold
                conf.a = a
                conf.b = b
                conf.c = c
                conf.save();
            }
        } catch (e) {
            this.log.info((e as Error).message);
        }
    }

    async getConfig(id?: string) {
        try {
            if (id !== undefined) {
                return await Config.findById(id) as IConfig;
            } else {
                let conf = await Config.find({ name: this.serum.dbName });
                let c;
                if (conf === undefined || conf == null || conf.length === 0) {
                    c = new Config(defaultConfig);
                    c.name = this.serum.dbName;
                    c.save();
                }
                return conf !== undefined ? conf[0] : c;
            }
        } catch (e) {
            this.log.info((e as Error).message);
        }
    }

    async updateConfig(id?: string) {
        try {
            let conf: IConfig | undefined = await this.getConfig(id === undefined ? undefined : id);
            if (conf !== undefined) {
                this.config.priceCheckInterval = conf.priceCheckInterval
                this.config.priceCheckIntervalDelta = conf.priceCheckIntervalDelta
                this.config.width = conf.width
                this.config.stretch = conf.stretch
                this.config.threshold = conf.threshold
                this.config.a = conf.a
                this.config.b = conf.b
                this.config.c = conf.c
            }
        } catch (e) {
            this.log.info((e as Error).message);
        }
    }

    async updatePrice(reversed = true) {
        try {
            let prices: IPairPrice[] = await PairPrice.find().sort('timestamp');
            if (prices.length > this.config.priceCheckIntervalDelta)
                for (let i = 0; i < prices.length - this.config.priceCheckIntervalDelta + 1; i++)
                    await prices[i].delete();
            let p = await getPairInfo(this.serum.baseMintAddress as string, this.serum.quoteMintAddress as string);
            if (p.success) {
                let price: IPairPrice = new PairPrice({
                    pair: this.serum.dbName,
                    price: reversed ? p.result.reversedPrice : p.result.price
                })
                await price.save();
                this.log.info(`price updated: ${reversed ? p.result.reversedPrice : p.result.price}`);
                return p.result.price;
            }
        } catch (e) {
            this.log.info((e as Error).message);
            return -1;
        }
    }

    async priceDivergence() {
        try {
            let prices: IPairPrice[] = await PairPrice.find().sort('timestamp');
            let older = prices[0].price;
            let newer = prices[prices.length - 1].price;
            let percentage = 100 * (Math.abs(older - newer) / ((older + newer) / 2));
            return percentage;
        } catch (e) {
            this.log.info((e as Error).message);
            return 0;
        }
    }

    async buildOrders() {
        try {
            let prices: IPairPrice[] = await PairPrice.find().sort('timestamp');
            let price = prices[prices.length - 1].price;
            let stretch = this.config.stretch;
            let width = this.config.width;
            let order = 0;
            while (width <= 1) {
                width *= 10;
                order++;
            }
            let threshold = this.config.threshold;
            let a = this.config.a;
            let b = this.config.b;
            let c = this.config.c;

            let price_bids = [];
            let size_bids = [];
            let k = 0;
            while (Math.pow(stretch, k) / width < width) {
                let step = Math.pow(stretch, k) / width;
                if (step > threshold) {
                    price_bids.push((price - (step / Math.pow(10, order))));
                    size_bids.push(0);
                }
                k++;
            }
            for (let y = 0; y < price_bids.length; y++)
                size_bids[y] = (a * Math.pow(y + 1, 2) + (b * y) + c);
            let size_bids_sum = size_bids.reduce((total, current) => { return total + current });
            for (let y = 0; y < price_bids.length; y++)
                size_bids[y] = size_bids[y] / size_bids_sum;


            let price_asks = [];
            let size_asks = [];
            k = 0;
            while (Math.pow(stretch, k) / width < width) {
                let step = Math.pow(stretch, k) / width;
                if (step > threshold) {
                    price_asks.push(price + (step / Math.pow(10, order)));
                    size_asks.push(0);
                }
                k++;
            }
            for (let y = 0; y < price_asks.length; y++)
                size_asks[y] = (a * Math.pow(y + 1, 2) + (b * y) + c);
            let size_asks_sum = size_asks.reduce((total, current) => { return total + current });
            for (let y = 0; y < price_asks.length; y++)
                size_asks[y] = size_asks[y] / size_asks_sum;


            let data = {
                "price_bids": price_bids,
                "size_bids": size_bids,
                "price_asks": price_asks,
                "size_asks": size_asks,
                "price": price
            }
            FileSystem.writeFile('src/temp/orders.json', JSON.stringify(data), (err: any) => { if (err) throw err });
            return [price_bids, size_bids, price_asks, size_asks, price]
        } catch (e) {
            this.log.info((e as Error).message);
            return [[], [], [], []]
        }
    }

    async sendOrders() {
        try {
            let askPercentage = this.config.askPercentage;
            let bidPercentage = this.config.bidPercentage;
            if (askPercentage + bidPercentage !== 100)
                return
            let associatedBaseTokenAddress = await getAssociatedTokenAddress(new PublicKey(this.serum.baseMintAddress as string), new Account(this.serum.secretKey).publicKey);
            let associatedBaseTokenBalance = await this.serum.connection.getTokenAccountBalance(associatedBaseTokenAddress);
            let amount = associatedBaseTokenBalance.value.uiAmount as number;
            let askAmount = (askPercentage * amount) / 100;
            let bidAmount = (bidPercentage * amount) / 100;

            this.log.info('sending orders')
            this.log.info(`total ${this.serum.baseMintAddress} amount: ${amount}`);
            this.log.info(`allocated ask amount: ${askAmount}`);
            this.log.info(`allocated bid amount: ${bidAmount}`);

            let [price_bids, size_bids, price_asks, size_asks, price] = await this.buildOrders();
            let bids_sizes = [];
            this.log.info('bids:');
            for (let bid = 0; bid < (price_bids as number[]).length; bid++) {
                let price = parseFloat(((price_bids as number[])[bid]).toFixed(8));
                let amount = parseFloat(((size_bids as number[])[bid] * bidAmount).toFixed(0));
                let bids_total = bids_sizes.length === 0 ? 0 : bids_sizes.reduce((total, current) => { return total + current });
                let size = parseFloat(((size_bids as number[])[bid] * bidAmount).toFixed(0));
                if (bids_total + size > bidAmount) {
                    size = bidAmount - bids_total
                }
                bids_sizes.push(size);
                this.log.info(`buy ${price} ${amount}=${(size_bids as number[])[bid]}% ${amount * price} limit`);
                !this.paper && this.serum.placeOrder('buy', (price_bids as number[])[bid], (size_bids as number[])[bid] * bidAmount, 'limit');
            }
            let bids_total = bids_sizes.reduce((total, current) => { return total + current });
            this.log.info(`sum of all bids sizes: ${bids_total}`);

            let asks_sizes = [];
            this.log.info('asks:');
            for (let ask = 0; ask < (price_asks as number[]).length; ask++) {
                let price = ((price_asks as number[])[ask]).toFixed(8);
                let amount = ((size_asks as number[])[ask] * askAmount).toFixed(0);
                let asks_total = asks_sizes.length === 0 ? 0 : asks_sizes.reduce((total, current) => { return total + current });
                let size = parseFloat(((size_asks as number[])[ask] * askAmount).toFixed(0))
                if (asks_total + size > askAmount) {
                    size = askAmount - asks_total
                }
                asks_sizes.push(size);
                this.log.info(`sell ${price} ${amount}=${(size_asks as number[])[ask]}% ${parseFloat(price) * parseFloat(amount)} limit`);
                !this.paper && this.serum.placeOrder('sell', (price_asks as number[])[ask], (size_asks as number[])[ask] * askAmount, 'limit');
            }
            let asks_total = asks_sizes.reduce((total, current) => { return total + current });
            this.log.info(`sum of all ask sizes: ${asks_total}`);
        } catch (e) {
            this.log.info((e as Error).message);
        }
    }

    async makeMarket() {
        try {
            let orders = await this.serum.getOrders();
            this.log.info(`number of orders: ${orders.length}\norders:\n${orders}`);
            let priceDivergence = await this.priceDivergence();
            this.log.info(`price divergence: ${priceDivergence}`);
            if (Math.abs(priceDivergence) > this.config.maxPriceDivergence && orders.length !== 0) {
                await this.serum.cancelAllOrders();
                await this.serum.settleFunds();
            }
            if (priceDivergence <= this.config.maxPriceDivergence) {
                let [price_bids, size_bids, price_asks, size_asks, price] = await this.buildOrders();
                this.log.info(`number of orders built: ${(price_bids as number[]).length + (price_asks as number[]).length}`)
                if (orders.length === 0) {
                    await this.sendOrders();
                } else if ((price_bids as number[]).length + (price_asks as number[]).length !== orders.length) {
                    await this.serum.cancelAllOrders();
                    await this.serum.settleFunds();
                    await this.sendOrders();
                }
            }
        } catch (e) {
            this.log.info((e as Error).message);
        }
    }
}
