import dotenv from 'dotenv';
import SerumAMM from './lib/SerumAMM';
dotenv.config();
import { PAIRNAME, RPCURL, PRIVATE_KEY, MARKETADDRESS, PROGRAMADDRESS } from './config/env';
import Config, { IConfig } from './models/AMMConfig';
import pkg from 'bs58';
const { decode } = pkg;


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
  width: 10, // make bids between width-price < price < price+width
  stretch: 1.1, // scale space between prices of the orders
  threshold: 0.0, // price-width < -threshold < price < threshold < price+width
  // there are no bids between threshold
  // orders will be placed between (price-width and price-threshold)
  // and between (price+threshold and price width) 
  a: 1, // parabola equation parameteres   
  b: 1, // ax^2+bx+c used to get the sizes of orders
  c: 1  // the sum of the sizes of an ask or a bid list must be 1
  // so it can be proportioned with askPercentage and bidPercentage

  // run python3 charts/orders.py to display the amm config visually
} as IConfig;

const run = async () => {
  let privateKey: number[] = [];

  if ( typeof PRIVATE_KEY === 'string' ) {
    const decoded = decode(PRIVATE_KEY);
    privateKey = Array.from(decoded);
  } else {
    privateKey = PRIVATE_KEY;
  }
 
  let amm = new SerumAMM(
    PAIRNAME, RPCURL, privateKey, MARKETADDRESS, PROGRAMADDRESS);
 
    await amm.serum.init();
  await amm.serum.fetchOrderBook();
  
  const createConfig = async () => {
    let conf = new Config(defaultConfig);
    conf.name = PAIRNAME;
    conf.save();
  };

  createConfig();
}

run();