import dotenv from 'dotenv';
import SerumAMM from './lib/SerumAMM';
dotenv.config();
import { PRIVATE_KEY, RPCURL, MARKETADDRESS, PROGRAMADDRESS, PAIRNAME, MAKEMARKETINTERVAL } from './config/env';
import Config, { IConfig } from './models/AMMConfig';


const main = async () => {
  let amm = new SerumAMM(
    PAIRNAME, RPCURL, PRIVATE_KEY, MARKETADDRESS, PROGRAMADDRESS);
  await amm.serum.init();
  await amm.serum.fetchOrderBook();

  const updateConfig = async () => {
    while (true) {
        await amm.updateConfig();
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };
  const updatePrice = async () => {
    while (true) {
        await amm.updatePrice();
        await new Promise(resolve => setTimeout(resolve, amm.config.priceCheckInterval));
    }
  };
  const makeMarket = async () => {
    while (true) {
        await amm.makeMarket();
        await new Promise(resolve => setTimeout(resolve, MAKEMARKETINTERVAL));
    }
  };

  updateConfig();
  updatePrice();
  makeMarket();
}

main();