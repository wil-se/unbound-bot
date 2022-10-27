import dotenv from 'dotenv';
import SerumAMM from './lib/SerumAMM';
dotenv.config();
import { PAIRNAME, RPCURL, PRIVATE_KEY, MARKETADDRESS, PROGRAMADDRESS } from './config/env';
import Config, { IConfig } from './models/AMMConfig';


const run = async () => {
  let amm = new SerumAMM(
    PAIRNAME, RPCURL, PRIVATE_KEY, MARKETADDRESS, PROGRAMADDRESS);
  await amm.serum.init();
  await amm.serum.fetchOrderBook();
  
  const createConfig = async () => {
    await Config.deleteMany();
  };

  createConfig();
}

run();