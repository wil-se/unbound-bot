import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderBook extends Document {
  asks: {orderId: string, price: number, size: number, side: 'buy'|'sell'}[];
  bids: {orderId: string, price: number, size: number, side: string}[];
  timestamp: Date;
}

const OrderBook: Schema = new Schema({
  asks: { type: Array, required: true },
  bids: { type: Array, required: true },
  timestamp: { type : Date, default: Date.now }
});

export default mongoose.model<IOrderBook>('OrderBook', OrderBook);