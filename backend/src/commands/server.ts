import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { getPairInfo, packReturn } from '../utils';
dotenv.config();
var cors = require('cors');
import { PORT } from '../config/env';
import { PRIVATE_KEY, RPCURL, MARKETADDRESS, PROGRAMADDRESS, PAIRNAME, MAKEMARKETINTERVAL } from '../config/env';
import pkg from 'bs58';
const { decode } = pkg;

import SerumAMM from "../lib/SerumAMM";

const dev_private_key = [112, 193, 211, 167, 13, 176, 191, 66, 106, 194, 144, 11, 154, 156, 158, 19, 165, 174, 53, 193, 146, 74, 147, 205, 153, 126, 160, 148, 4, 244, 176, 57, 234, 182, 221, 93, 0, 55, 59, 175, 156, 207, 42, 244, 82, 142, 187, 96, 1, 154, 223, 223, 107, 21, 103, 121, 116, 181, 110, 167, 158, 128, 251, 74]
const rpcUrl = 'https://solana-api.projectserum.com';
const app: Express = express();
app.use(cors());
const port = PORT;

let privateKey: number[] = [];

if (typeof PRIVATE_KEY === 'string') {
    const decoded = decode(PRIVATE_KEY);
    privateKey = Array.from(decoded);
} else {
    privateKey = PRIVATE_KEY;
}

let amm = new SerumAMM(PAIRNAME, RPCURL, privateKey, MARKETADDRESS, PROGRAMADDRESS);
amm.serum.init();
amm.serum.fetchOrderBook();



app.get('/orderbook', async (req: Request, res: Response) => {
    try {
        console.log("getting orderbook");
        let [asks_result, bids_result, baseMintAddress, quoteMintAddress] = await amm.serum.fetchOrderBook();
        res.send(packReturn({
            asks: asks_result,
            bids: bids_result,
            baseMintAddress: baseMintAddress,
            quoteMintAddress: quoteMintAddress
        }, '', true));
    } catch (e) {
        console.log(e);
        res.send([]);
    }
});

app.get('/info', async (req: Request, res: Response) => {
    try {
        let baseAddress: string = req.query.baseAddress as string;
        let quoteAddress: string = req.query.quoteAddress as string;
        let result = await getPairInfo(baseAddress, quoteAddress, true);
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send([]);
    }
});

app.get('/placeorder', async (req: Request, res: Response) => {
    try {
        let side: 'buy' | 'sell' = req.query.side as 'buy' | 'sell';
        let price: number = parseFloat(req.query.price as string);
        let size: number = parseFloat(req.query.size as string);
        let orderType: 'limit' | 'ioc' | 'postOnly' = req.query.orderType as 'limit' | 'ioc' | 'postOnly';
        let result = await amm.serum.placeOrder(side, price, size, orderType);
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send([]);
    }
});

app.get('/orders', async (req: Request, res: Response) => {
    try {
        let result = await amm.serum.getOrders();
        res.send(packReturn(result, '', true));
    } catch (e) {
        console.log(e);
        res.send([]);
    }
});

app.get('/cancelallorders', async (req: Request, res: Response) => {
    try {
        let result = await amm.serum.cancelAllOrders();
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send(false);
    }
});

app.get('/cancelorder', async (req: Request, res: Response) => {
    try {
        let orderId: string = req.query.orderId as string;
        let result = await amm.serum.cancelOrder(orderId);
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send(false);
    }
});

app.get('/fills', async (req: Request, res: Response) => {
    try {
        let result = await amm.serum.getFilledOrders();
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send(false);
    }
});

app.get('/settlefunds', async (req: Request, res: Response) => {
    try {
        let result = await amm.serum.settleFunds();
        console.log(result);
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send(false);
    }
});


app.listen(port, () => {
    console.log(`[server]: Server is running at https://localhost:${port}`);
});