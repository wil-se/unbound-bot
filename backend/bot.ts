import { parse } from 'ts-command-line-args';
import SerumAMM from './src/lib/SerumAMM';
import pkg from 'bs58';
const { decode } = pkg;


interface ICopyFilesArguments {
    pairName: string,
    rpc?: string,
    privateKey: string,
    marketAddress: string,
    programAddress?: string,
    paper?: boolean
}

export const args = parse<ICopyFilesArguments>({
    pairName: String,
    rpc: { type: String, optional: true },
    privateKey: { type: String },
    marketAddress: { type: String },
    programAddress: { type: String, optional: true },
    paper: { type: Boolean, optional: true },
});

if (typeof args.paper === 'undefined') { args.paper = false }
if (typeof args.rpc === 'undefined') { args.rpc = `https://weathered-burned-gas.solana-mainnet.quiknode.pro/42794a2bf8e0e4befb00e9d3fc769a7c8d186778/` }
let rpc = args.rpc
const decoded = decode(args.privateKey);
let privateKey = Array.from(decoded);

const main = async () => {
    console.log(args);
    let amm = new SerumAMM(args.pairName, rpc, privateKey, args.marketAddress, args.programAddress, args.paper);
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
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
      };
    
      updateConfig();
      updatePrice();
      makeMarket();
}

main();