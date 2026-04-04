import { Request, Response } from 'express';
import Transaction, { TransactionType } from '../models/Transaction';

export const createTransaction = async (req: Request, res: Response) => {
  const { amount, type, category, date, notes } = req.body;

  if (!amount || !type || !category) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const transaction = await Transaction.create({
    amount,
    type,
    category,
    date: date || Date.now(),
    notes,
    user: req.user?._id,
  });

  res.status(201).json(transaction);
};

export const getTransactions = async (req: Request, res: Response) => {
  const { startDate, endDate, category, type } = req.query;

  const whereClause: any = {};
  if (startDate && endDate) {
    whereClause.date = { $gte: new Date(startDate.toString()), $lte: new Date(endDate.toString()) };
  } else if (startDate) {
    whereClause.date = { $gte: new Date(startDate.toString()) };
  } else if (endDate) {
    whereClause.date = { $lte: new Date(endDate.toString()) };
  }

  if (category) whereClause.category = category;
  if (type) whereClause.type = type;

  const transactions = await Transaction.find(whereClause).sort({ date: -1 });
  res.json(transactions);
};

export const updateTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, type, category, date, notes } = req.body;

  const transaction = await Transaction.findById(id);

  if (transaction) {
    transaction.amount = amount ?? transaction.amount;
    transaction.type = type ?? transaction.type;
    transaction.category = category ?? transaction.category;
    transaction.date = date ?? transaction.date;
    transaction.notes = notes ?? transaction.notes;

    const updated = await transaction.save();
    res.json(updated);
  } else {
    res.status(404).json({ message: 'Transaction not found' });
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const transaction = await Transaction.findById(id);

  if (transaction) {
    await Transaction.deleteOne({ _id: id });
    res.json({ message: 'Transaction deleted' });
  } else {
    res.status(404).json({ message: 'Transaction not found' });
  }
};
