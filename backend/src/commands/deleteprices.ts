import dotenv from 'dotenv';
import SerumAMM from '../lib/SerumAMM';
dotenv.config();
import { PAIRNAME, RPCURL, PRIVATE_KEY, MARKETADDRESS, PROGRAMADDRESS } from '../config/env';
import PairPrice, { IPairPrice } from '../models/PairPrice';
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
  await amm.serum.init();
  await amm.serum.fetchOrderBook();

  const createConfig = async () => {
    await PairPrice.deleteMany();
    console.log('done');
    process.exit();
  };

  createConfig();
}

run();