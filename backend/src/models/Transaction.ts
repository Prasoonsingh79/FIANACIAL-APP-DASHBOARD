import mongoose, { Schema, Document } from 'mongoose';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface ITransaction extends Document {
  amount: number;
  type: TransactionType;
  category: string;
  date: Date;
  notes?: string;
  user: mongoose.Types.ObjectId;
}

const transactionSchema: Schema = new Schema(
  {
    amount: { type: Number, required: true },
    type: { type: String, enum: Object.values(TransactionType), required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    notes: { type: String },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>('Transaction', transactionSchema);
