import SerumMarket from "./lib/SerumMarket";
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { getPairInfo } from './utils';
dotenv.config();
var cors = require('cors');
import { PORT } from './config/env';

const dev_private_key = [112, 193, 211, 167, 13, 176, 191, 66, 106, 194, 144, 11, 154, 156, 158, 19, 165, 174, 53, 193, 146, 74, 147, 205, 153, 126, 160, 148, 4, 244, 176, 57, 234, 182, 221, 93, 0, 55, 59, 175, 156, 207, 42, 244, 82, 142, 187, 96, 1, 154, 223, 223, 107, 21, 103, 121, 116, 181, 110, 167, 158, 128, 251, 74]
const rpcUrl = 'https://solana-api.projectserum.com';
const app: Express = express();
app.use(cors());
const port = PORT;

app.get('/bids', async (req: Request, res: Response) => {
    try {
        const bot: SerumMarket = new SerumMarket(rpcUrl, dev_private_key,  req.query.marketAddress as string, req.query.programAddress as string);
        let result = await bot.getBids();
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send([]);
    }
});

app.get('/asks', async (req: Request, res: Response) => {
    try {
        const bot: SerumMarket = new SerumMarket(rpcUrl, dev_private_key,  req.query.marketAddress as string, req.query.programAddress as string);
        let result = await bot.getAsks();
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send([]);
    }
});

app.get('/orderbook', async (req: Request, res: Response) => {
    try {
        const bot: SerumMarket = new SerumMarket(rpcUrl, dev_private_key,  req.query.marketAddress as string, req.query.programAddress as string);
        let result = await bot.getOrderBook();
        res.send(result);
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
        const bot: SerumMarket = new SerumMarket(rpcUrl, dev_private_key,  req.query.marketAddress as string, req.query.programAddress as string);
        let side: 'buy' | 'sell' = req.query.side as 'buy' | 'sell';
        let price: number = parseFloat(req.query.price as string);
        let size: number = parseFloat(req.query.size as string);
        let orderType: 'limit' | 'ioc' | 'postOnly' = req.query.orderType as 'limit' | 'ioc' | 'postOnly';
        let result = await bot.placeOrder(side, price, size, orderType);
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send([]);
    }
});

app.get('/orders', async (req: Request, res: Response) => {
    try {
        const bot: SerumMarket = new SerumMarket(rpcUrl, dev_private_key,  req.query.marketAddress as string, req.query.programAddress as string);
        let result = await bot.getOrders();
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send([]);
    }
});

app.get('/cancelallorders', async (req: Request, res: Response) => {
    try {
        const bot: SerumMarket = new SerumMarket(rpcUrl, dev_private_key,  req.query.marketAddress as string, req.query.programAddress as string);
        let result = await bot.cancelAllOrders();
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send(false);
    }
});

app.get('/cancelorder', async (req: Request, res: Response) => {
    try {
        const bot: SerumMarket = new SerumMarket(rpcUrl, dev_private_key,  req.query.marketAddress as string, req.query.programAddress as string);
        let orderId: string = req.query.orderId as string;
        let result = await bot.cancelOrder(orderId);
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send(false);
    }
});

app.get('/fills', async (req: Request, res: Response) => {
    try {
        const bot: SerumMarket = new SerumMarket(rpcUrl, dev_private_key,  req.query.marketAddress as string, req.query.programAddress as string);
        let result = await bot.getFilledOrders();
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send(false);
    }
});

app.get('/settlefunds', async (req: Request, res: Response) => {
    try {
        const bot: SerumMarket = new SerumMarket(rpcUrl, dev_private_key,  req.query.marketAddress as string, req.query.programAddress as string);
        let result = await bot.settleFunds();
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