import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  owner: string;
  payer: string;
  size: number;
  side: 'ask' | 'sell';
  price: number;
  orderType: 'limit' | 'ioc' | 'postOnly';
  tx: string,
}

const Order: Schema = new Schema({
  owner: { type: String, required: true },
  payer: { type: String, required: true },
  size: { type: Number, required: true },
  side: { type: String, required: true },
  price: { type: Number, required: true },
  orderType: { type: String, required: true },
  tx: { type: String, required: true }
});

export default mongoose.model<IOrder>('Order', Order);