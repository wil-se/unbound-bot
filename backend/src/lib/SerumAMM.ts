import { Logger, ILogObject } from 'tslog'
import { appendFileSync } from 'fs'
import Config, { IConfig } from '../models/AMMConfig'
import Serum from './Serum'
import { getPairInfo } from '../utils'
import PairPrice, { IPairPrice } from '../models/PairPrice'
import { PublicKey, Account } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'
const FileSystem = require('fs')
import * as Colors from '../config/colors'

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
  width: 8, // make bids between width-price < price < price+width
  density: 0.09, // scale space between prices of the orders
  spread: 0.1, // price-width < -spread < price < spread < price+width
  decimals: 2,
  // there are no bids between spread
  // orders will be placed between (price-width and price-spread)
  // and between (price+spread and price width)
  a: 0.1, // parabola equation parameteres
  b: 10, // ax^2+bx+c used to get the sizes of orders
  c: 1, // the sum of the sizes of an ask or a bid list must be 1
  // so it can be proportioned with askPercentage and bidPercentage

  // run python3 charts/orders.py to display the amm config visually
} as IConfig

// log formatter
function logToTransport(logObject: ILogObject) {
  appendFileSync(
    'logs/SerumAMM.log',
    `[${logObject.date.toLocaleString()}] - ${logObject.logLevel.toUpperCase()} - function ${logObject.functionName
    }():\n${logObject.loggerName} ${logObject.argumentsArray}` + '\n',
  )
}

export default class SerumAMM {
  serum: Serum
  config: IConfig
  log: Logger = new Logger({ name: 'AMM', printLogMessageInNewLine: true })
  paper: boolean

  constructor(
    dbName: string,
    rpc: string,
    secretKey?: number[],
    marketAddressPubKey?: string,
    programAddressPubKey?: string,
    paper = true,
  ) {
    this.serum = new Serum(
      dbName,
      rpc,
      secretKey,
      marketAddressPubKey,
      programAddressPubKey,
    )
    this.config = defaultConfig
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
      'debug',
    )
    this.paper = paper
  }

  async setConfig(
    id: string,
    priceCheckInterval: number,
    priceCheckIntervalDelta: number,
    width: number,
    density: number,
    spread: number,
    a: number,
    b: number,
    c: number,
  ) {
    try {
      let conf: IConfig | null = await Config.findById(id)
      if (conf !== null) {
        conf.priceCheckInterval = priceCheckInterval
        conf.priceCheckIntervalDelta = priceCheckIntervalDelta
        conf.width = width
        conf.density = density
        conf.spread = spread
        conf.a = a
        conf.b = b
        conf.c = c
        conf.save()
      }
    } catch (e) {
      this.log.info((e as Error).message)
    }
  }

  async getConfig(id?: string) {
    try {
      if (id !== undefined) {
        return (await Config.findById(id)) as IConfig
      } else {
        let conf = await Config.find({ name: this.serum.dbName });
        let c;
        if (conf === undefined || conf == null || conf.length === 0) {
          c = new Config(defaultConfig)
          c.name = this.serum.dbName
          c.save()
          return c;
        }
        return conf[0];
      }
    } catch (e) {
      this.log.info((e as Error).message)
    }
  }

  async updateConfig(id?: string) {
    try {
      let conf: IConfig | undefined = await this.getConfig(id);
      if (conf !== undefined) {
        this.config.priceCheckInterval = conf.priceCheckInterval
        this.config.priceCheckIntervalDelta = conf.priceCheckIntervalDelta
        this.config.width = conf.width
        this.config.density = conf.density
        this.config.spread = conf.spread
        this.config.decimals = conf.decimals
        this.config.a = conf.a
        this.config.b = conf.b
        this.config.c = conf.c
      }
    } catch (e) {
      this.log.info((e as Error).message)
    }
  }

  async updatePrice(reversed = true) {
    try {
      let prices: IPairPrice[] = await PairPrice.find().sort('timestamp')
      if (prices.length > this.config.priceCheckIntervalDelta)
        for (
          let i = 0;
          i < prices.length - this.config.priceCheckIntervalDelta + 1;
          i++
        )
          await prices[i].delete()
      let p = await getPairInfo(
        this.serum.baseMintAddress as string,
        this.serum.quoteMintAddress as string,
      )
      if (p.success) {
        let price: IPairPrice = new PairPrice({
          pair: this.serum.dbName,
          price: reversed ? p.result.reversedPrice : p.result.price,
        })
        await price.save()
        // this.log.info(`price: ${reversed ? p.result.reversedPrice.toFixed(6) : p.result.price.toFixed(6)}`);
        return p.result.price
      }
    } catch (e) {
      this.log.info((e as Error).message)
      return -1
    }
  }

  async priceDivergence() {
    try {
      let prices: IPairPrice[] = await PairPrice.find().sort('timestamp')
      let older = prices[0].price
      let newer = prices[prices.length - 1].price
      let percentage = 100 * (Math.abs(older - newer) / ((older + newer) / 2))
      return percentage
    } catch (e) {
      this.log.info((e as Error).message)
      return 0
    }
  }

  async buildOrders() {
    try {
      let prices: IPairPrice[] = await PairPrice.find().sort('timestamp')
      let price = prices[prices.length - 1].price
      let density = this.config.density
      let width = this.config.width
      let order = 0
      while (width <= 1) {
        width *= 10
        order++
      }
      let spread = this.config.spread
      let a = this.config.a
      let b = this.config.b
      let c = this.config.c

      let price_bids = []
      let size_bids = []
      let k = 0
      while (Math.pow(density, k) / width < width) {
        let step = Math.pow(density, k) / width;
        if (step > spread) {
          price_bids.push(price - step / Math.pow(10, order))
          size_bids.push(0)
        }
        k++
      }
      for (let y = 0; y < price_bids.length; y++)
        size_bids[y] = a * Math.pow(y + 1, 2) + b * y + c
      let size_bids_sum = size_bids.reduce((total, current) => {
        return total + current
      })
      for (let y = 0; y < price_bids.length; y++)
        size_bids[y] = size_bids[y] / size_bids_sum

      let price_asks = []
      let size_asks = []
      k = 0
      while (Math.pow(density, k) / width < width) {
        let step = Math.pow(density, k) / width;
        if (step > spread) {
          price_asks.push(price + step / Math.pow(10, order))
          size_asks.push(0)
        }
        k++
      }
      for (let y = 0; y < price_asks.length; y++)
        size_asks[y] = a * Math.pow(y + 1, 2) + b * y + c
      let size_asks_sum = size_asks.reduce((total, current) => {
        return total + current
      })
      for (let y = 0; y < price_asks.length; y++)
        size_asks[y] = size_asks[y] / size_asks_sum

      let data = {
        price_bids: price_bids,
        size_bids: size_bids,
        price_asks: price_asks,
        size_asks: size_asks,
        price: price,
      }
      FileSystem.writeFile(
        'src/temp/orders.json',
        JSON.stringify(data),
        (err: any) => {
          if (err) throw err
        },
      )
      return [price_bids, size_bids, price_asks, size_asks, price]
    } catch (e) {
      this.log.info((e as Error).message)
      return [[], [], [], []]
    }
  }

  fibo(density: number, current: number, previous: number, mx: number, result: number[]): number[] {
    let next = current + (previous * density);
    if (next > mx)
      return result;
    result.push(next);
    return this.fibo(density, next, current, mx, result);
  }

  async buildOrdersV2() {
    try {
      await this.updateConfig();
      let density = this.config.density;
      let width = this.config.width;
      let decimals = this.config.decimals;
      let a = this.config.a;
      let b = this.config.b;
      let c = this.config.c;
      let prices: IPairPrice[] = await PairPrice.find().sort('timestamp');
      let price = parseFloat(prices[0].price.toFixed(decimals));
      let unit = 1;
      let tPrice = price;
      while (tPrice < 1) {
        tPrice *= 10
        unit *= 0.1;
      }
      console.log(`unit: ${unit}`)
      let serie: number[] = this.fibo(density, unit, unit, price+width, []);

      let bid_prices: number[] = [];
      let bid_sizes: number[] = [];
      let ask_prices: number[] = [];
      let ask_sizes: number[] = [];

      serie.map(x => {
        let ask = parseFloat((price + x - unit).toFixed(decimals));
        let bid = parseFloat((price - x + unit).toFixed(decimals));
        if (!bid_prices.includes(bid)
          && !ask_prices.includes(ask)
          && ask !== price
          && bid !== price
          && ask > 0 && bid > 0
          && ask - price > this.config.spread) {
          ask_sizes.push((Math.pow(x, 2) * a) + (x * b) + c);
          ask_prices.push(ask);
          bid_sizes.push((Math.pow(x, 2) * a) + (x * b) + c);
          bid_prices.push(bid);
        }
      });


      let bids_size_sum = bid_sizes.reduce((total, current) => { return total + current });
      let asks_size_sum = ask_sizes.reduce((total, current) => { return total + current });

      bid_sizes = bid_sizes.map(s => (s / bids_size_sum));
      ask_sizes = ask_sizes.map(s => (s / asks_size_sum));
      // bid_sizes[bid_sizes.length - 1] = bid_sizes[bid_sizes.length - 1] + 100 - bid_sizes.reduce((total, current) => { return total + current })
      // ask_sizes[ask_sizes.length - 1] = ask_sizes[ask_sizes.length - 1] + 100 - ask_sizes.reduce((total, current) => { return total + current })
      console.log(bid_sizes);      
      console.log(ask_sizes);
      console.log(`bid_sizes: ${bid_sizes.reduce((total, current) => { return total + current })}`);
      console.log(`ask_sizes: ${ask_sizes.reduce((total, current) => { return total + current })}`);
      

      let data = {
        price_bids: bid_prices,
        size_bids: bid_sizes,
        price_asks: ask_prices,
        size_asks: ask_sizes,
        price: price,
      }

      FileSystem.writeFileSync(
        'src/temp/orders.json',
        JSON.stringify(data),
        (err: any) => {
          if (err) throw err
        },
      );
      return [bid_prices, bid_sizes, ask_prices, ask_sizes, price];
    } catch (e) {
      this.log.info((e as Error).message)
      return [[], [], [], []]
    }
  }

  buildHeightBar(index: number, len: number) {
    let s = '['
    for (let i = 0; i < index; i++) {
      s += '*'
    }
    for (let i = index; i < len; i++) {
      s += ' '
    }
    s += ']'
    return s
  }

  async sendOrders(paper = false) {
    let sent = 0
    try {
      let askPercentage = this.config.askPercentage
      let bidPercentage = this.config.bidPercentage
      if (askPercentage + bidPercentage !== 100) return
      let associatedBaseTokenAddress = await getAssociatedTokenAddress(
        new PublicKey(this.serum.baseMintAddress as string),
        new Account(this.serum.secretKey).publicKey,
      )
      let associatedBaseTokenBalance = await this.serum.connection.getTokenAccountBalance(
        associatedBaseTokenAddress,
      )
      let amount = parseInt(
        associatedBaseTokenBalance.value.uiAmount?.toFixed(0) as string,
      )
      let askAmount = (askPercentage * amount) / 100;
      let bidAmount = (bidPercentage * amount) / 100;

      this.log.info('sending orders');
      this.log.info(`total ${this.serum.baseMintAddress} amount: ${amount}`);
      this.log.info(`allocated ask amount: ${askAmount}`);
      this.log.info(`allocated bid amount: ${bidAmount}`);

      let [
        price_bids,
        size_bids,
        price_asks,
        size_asks,
        price,
      ] = await this.buildOrdersV2();

      let bids_sizes = [];
      for (let bid = (price_bids as number[]).length - 1; bid >= 0; bid--) {
        let price = parseFloat((price_bids as number[])[bid].toFixed(8))
        let size = Math.floor((size_bids as number[])[bid] * bidAmount)
          this.log.info(
            `${Colors.FgGreen
            }buy price: ${price} size: ${size} ${(amount * price).toFixed(
              4,
            )} limit\n${this.buildHeightBar(size, bidAmount)}${Colors.Reset}`,
          )

        bids_sizes.push(size)
        await new Promise((resolve) => setTimeout(resolve, 300))
        !paper &&
          this.serum.placeOrder(
            'buy',
            price,
            size,
            'limit',
          )
        sent++
      }
      let bids_total = bids_sizes.reduce((total, current) => {
        return total + current
      })
      this.log.info(`price ${price}`)
      let asks_sizes = []
      for (let ask = 0; ask < (price_asks as number[]).length; ask++) {
        let price = parseFloat((price_asks as number[])[ask].toFixed(8))
        let size = Math.floor((size_asks as number[])[ask] * askAmount);
        this.log.info(
          `${Colors.FgRed
          }sell price: ${price} size: ${size} ${(price * amount).toFixed(
            4,
          )} limit\n${this.buildHeightBar(size, askAmount)}${Colors.Reset}`,
        )

        asks_sizes.push(size)
        await new Promise((resolve) => setTimeout(resolve, 300))
        !paper &&
          this.serum.placeOrder(
            'sell',
            price,
            size,
            'limit',
          )
        sent++
      }
      let asks_total = asks_sizes.reduce((total, current) => {
        return total + current
      })
      this.log.info(`sum of all bids sizes: ${bids_total}`)
      this.log.info(`sum of all ask sizes: ${asks_total}`)
      return sent
    } catch (e) {
      this.log.info((e as Error).message)
      return sent
    }
  }

  async makeMarket() {
    try {
      let orders = await this.serum.getOrders();
      this.log.info(`number of orders opened: ${orders.length}\norders:\n${orders.map(o => JSON.stringify(o) + '\n')}`);
      let priceDivergence = await this.priceDivergence();
      let ordersExpected = await this.buildOrdersV2();
      let ordersExpectedNumber = (ordersExpected[0] as number[]).length + (ordersExpected[2] as number[]).length;
      this.log.info(`number of orders expected: ${ordersExpectedNumber}`);

      this.log.info(`price divergence: ${priceDivergence}`)
      if (
        Math.abs(priceDivergence) > this.config.maxPriceDivergence &&
        orders.length !== 0
      ) {
        this.log.info('price divergenge exceeded, closing positions');
        await this.serum.cancelAllOrders();
        await this.serum.settleFunds();
      }
      if (ordersExpectedNumber !== orders.length && priceDivergence <= this.config.maxPriceDivergence) {
        this.log.info('rebalancing positions');
        await this.serum.cancelAllOrders();
        await this.serum.settleFunds();
        await this.sendOrders(this.paper);
      } else {
        this.log.info(`skipping iteration`);
      }
    } catch (e) {
      this.log.info((e as Error).message)
    }
  }
}