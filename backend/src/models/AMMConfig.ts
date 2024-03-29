import mongoose, { Schema, Document } from 'mongoose';

export interface IConfig extends Document {
  name: string,
  priceCheckInterval: number,
  priceCheckIntervalDelta: number,
  maxPriceDivergence: number,
  askPercentage: number,
  bidPercentage: number,
  width: number,
  density: number,
  spread: number,
  decimals: number,
  a: number,
  b: number,
  c: number
}

const Config: Schema = new Schema({
  name: {type: String, required: true},
  priceCheckInterval: {type: Number, required: true},
  priceCheckIntervalDelta: {type: Number, required: true},
  maxPriceDivergence: {type: Number, required: true},
  askPercentage: {type: Number, required: true},
  bidPercentage: {type: Number, required: true},
  width: {type: Number, required: true},
  density: {type: Number, required: true},
  spread: {type: Number, required: true},
  decimals: {type: Number, required: true},
  a: {type: Number, required: true},
  b: {type: Number, required: true},
  c: {type: Number, required: true}
});

export default mongoose.model<IConfig>('Config', Config);