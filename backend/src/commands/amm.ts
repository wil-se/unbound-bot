import dotenv from 'dotenv';
import SerumAMM from '../lib/SerumAMM';
dotenv.config();
import { PRIVATE_KEY, RPCURL, MARKETADDRESS, PROGRAMADDRESS, PAIRNAME, MAKEMARKETINTERVAL } from '../config/env';
import Config, { IConfig } from '../models/AMMConfig';
import pkg from 'bs58';
const { decode } = pkg;

const main = async () => {
  let paper = process.argv[2] === 'paper';
  let privateKey: number[] = [];

  if ( typeof PRIVATE_KEY === 'string' ) {
    const decoded = decode(PRIVATE_KEY);
    privateKey = Array.from(decoded);
  } else {
    privateKey = PRIVATE_KEY;
  }

  let amm = new SerumAMM(
    PAIRNAME, RPCURL, privateKey, MARKETADDRESS, PROGRAMADDRESS, paper=paper);
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