import { $Enums } from '@prisma/client';
type TransactionType = $Enums.TransactionType;
const TransactionType = $Enums.TransactionType;
import prisma from '../config/db';

export { TransactionType };

export const createTransaction = async (data: {
    amount: number;
    type: TransactionType;
    category: string;
    date?: Date;
    notes?: string;
    userId: string;
}) => {
    return prisma.transaction.create({
        data: {
            amount: data.amount,
            type: data.type,
            category: data.category,
            date: data.date || new Date(),
            notes: data.notes,
            userId: data.userId,
        },
    });
};

export const getTransactions = async (filters?: {
    startDate?: Date;
    endDate?: Date;
    category?: string;
    type?: TransactionType;
}) => {
    const where: any = {};
    
    if (filters?.startDate && filters?.endDate) {
        where.date = { gte: filters.startDate, lte: filters.endDate };
    } else if (filters?.startDate) {
        where.date = { gte: filters.startDate };
    } else if (filters?.endDate) {
        where.date = { lte: filters.endDate };
    }
    
    if (filters?.category) where.category = filters.category;
    if (filters?.type) where.type = filters.type;

    return prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
    });
};

export const updateTransaction = async (id: string, data: {
    amount?: number;
    type?: TransactionType;
    category?: string;
    date?: Date;
    notes?: string;
}) => {
    return prisma.transaction.update({ where: { id }, data });
};

export const deleteTransaction = async (id: string) => {
    return prisma.transaction.delete({ where: { id } });
};

export const findTransactionById = async (id: string) => {
    return prisma.transaction.findUnique({ where: { id } });
};
