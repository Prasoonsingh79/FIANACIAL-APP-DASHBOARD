import { Request, Response } from 'express';
import { createTransaction, getTransactions, updateTransaction, deleteTransaction, findTransactionById, TransactionType } from '../models/Transaction';

export const createTransactionHandler = async (req: Request, res: Response) => {
    const { amount, type, category, date, notes } = req.body;

    if (!amount || !type || !category) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const transaction = await createTransaction({
        amount,
        type: type.toUpperCase() as TransactionType,
        category,
        date: date ? new Date(date) : new Date(),
        notes,
        userId: req.user?.id as string,
    });

    res.status(201).json(transaction);
};

export const getTransactionsHandler = async (req: Request, res: Response) => {
    const { startDate, endDate, category, type } = req.query;

    const transactions = await getTransactions({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        category: category as string,
        type: type ? type.toString().toUpperCase() as TransactionType : undefined,
    });

    res.json(transactions);
};

export const updateTransactionHandler = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { amount, type, category, date, notes } = req.body;

    const existing = await findTransactionById(id);

    if (!existing) {
        return res.status(404).json({ message: 'Transaction not found' });
    }

    const transaction = await updateTransaction(id, {
        amount: amount ?? existing.amount,
        type: type ? type.toUpperCase() as TransactionType : existing.type,
        category: category ?? existing.category,
        date: date ? new Date(date) : existing.date,
        notes: notes ?? existing.notes,
    });

    res.json(transaction);
};

export const deleteTransactionHandler = async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const existing = await findTransactionById(id);

    if (!existing) {
        return res.status(404).json({ message: 'Transaction not found' });
    }

    await deleteTransaction(id);
    res.json({ message: 'Transaction deleted' });
};
