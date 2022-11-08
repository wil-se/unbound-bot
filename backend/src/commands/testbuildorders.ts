import dotenv from 'dotenv';
import SerumAMM from '../lib/SerumAMM';
dotenv.config();
import { PAIRNAME, RPCURL, PRIVATE_KEY, MARKETADDRESS, PROGRAMADDRESS } from '../config/env';
import Config, { IConfig } from '../models/AMMConfig';
import pkg from 'bs58';
const { decode } = pkg;


const run = async () => {
  let privateKey: number[] = [];

  if (typeof PRIVATE_KEY === 'string') {
    const decoded = decode(PRIVATE_KEY);
    privateKey = Array.from(decoded);
  } else {
    privateKey = PRIVATE_KEY;
  }

  let amm = new SerumAMM(
    PAIRNAME, RPCURL, privateKey, MARKETADDRESS, PROGRAMADDRESS);
  

  const testBuild = async () => {
    console.log('testing');
    await amm.serum.init();
    await amm.serum.fetchOrderBook();
    await amm.buildOrdersV2();
    console.log('done');
    process.exit();
  };

  testBuild();
}

run();