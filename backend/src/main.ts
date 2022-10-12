import SerumBot from "./lib/SerumBot";
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
var cors = require('cors');


const bot: SerumBot = new SerumBot('https://solana-api.projectserum.com');
const app: Express = express();
app.use(cors());
const port = process.env.PORT;


app.get('/bids', async (req: Request, res: Response) => {
    try {
        let market: string = req.query.marketAddress as string;
        let program: string = req.query.programAddress as string;
        let result = await bot.getBids(market, program);
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send([]);
    }
});

app.get('/asks', async (req: Request, res: Response) => {
    try {
        let market: string = req.query.marketAddress as string;
        let program: string = req.query.programAddress as string;
        let result = await bot.getAsks(market, program);
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send([]);
    }
});

app.get('/orderbook', async (req: Request, res: Response) => {
    try {
        let market: string = req.query.marketAddress as string;
        let program: string = req.query.programAddress as string;
        let result = await bot.getOrderBook(market, program);
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
        let result = await bot.getPairInfo(baseAddress, quoteAddress);
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send([]);
    }
});

app.get('/placeorder', async (req: Request, res: Response) => {
    try {
        let market: string = req.query.marketAddress as string;
        let program: string = req.query.programAddress as string;
        let side: 'buy' | 'sell' = req.query.side as 'buy' | 'sell';
        let price: number = parseFloat(req.query.price as string);
        let size: number = parseFloat(req.query.size as string);
        let orderType: 'limit' | 'ioc' | 'postOnly' = req.query.orderType as 'limit' | 'ioc' | 'postOnly';
        let result = await bot.placeOrder(market, program, side, price, size, orderType);
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send([]);
    }
});

app.get('/orders', async (req: Request, res: Response) => {
    try {
        let market: string = req.query.marketAddress as string;
        let program: string = req.query.programAddress as string;
        let result = await bot.getOrders(market, program);
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send([]);
    }
});

app.get('/cancelallorders', async (req: Request, res: Response) => {
    try {
        let market: string = req.query.marketAddress as string;
        let program: string = req.query.programAddress as string;
        let result = await bot.cancelAllOrders(market, program);
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send(false);
    }
});

app.get('/cancelorder', async (req: Request, res: Response) => {
    try {
        let market: string = req.query.marketAddress as string;
        let program: string = req.query.programAddress as string;
        let orderId: string = req.query.orderId as string;
        let result = await bot.cancelOrder(market, program, orderId);
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send(false);
    }
});

app.get('/fills', async (req: Request, res: Response) => {
    try {
        let market: string = req.query.marketAddress as string;
        let program: string = req.query.programAddress as string;
        let result = await bot.getFilledOrders(market, program);
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send(false);
    }
});

app.get('/settlefunds', async (req: Request, res: Response) => {
    try {
        let market: string = req.query.marketAddress as string;
        let program: string = req.query.programAddress as string;
        let result = await bot.settleFunds(market, program);
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send(false);
    }
});


app.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});