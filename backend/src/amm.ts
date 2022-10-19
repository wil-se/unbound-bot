import dotenv from 'dotenv';
import { connect, disconnect } from 'mongoose';
import SerumAMM from './lib/SerumAMM';
import OrderBook,  { IOrderBook } from './models/OrderBook';

dotenv.config();


const dev_private_key = [112, 193, 211, 167, 13, 176, 191, 66, 106, 194, 144, 11, 154, 156, 158, 19, 165, 174, 53, 193, 146, 74, 147, 205, 153, 126, 160, 148, 4, 244, 176, 57, 234, 182, 221, 93, 0, 55, 59, 175, 156, 207, 42, 244, 82, 142, 187, 96, 1, 154, 223, 223, 107, 21, 103, 121, 116, 181, 110, 167, 158, 128, 251, 74]
const rpcUrl = 'https://solana-api.projectserum.com';
const marketAddress = '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT';
const programAddress = '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin';

const main = async () => {
  let amm = new SerumAMM('SOLUSDC' ,rpcUrl, dev_private_key, marketAddress, programAddress);
  amm.init();
  
  
  amm.terminate();
}

main();