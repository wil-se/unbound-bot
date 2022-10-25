import mongoose, { Schema, Document } from 'mongoose';

export interface IPairPrice extends Document {
    pair: string,
    price: number;
    timestamp: Date;
}

const PairPrice: Schema = new Schema({
    pair: { type: String, required: true },
    price: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model<IPairPrice>('PairPrice', PairPrice);