import { Request, Response } from 'express';
import prisma from '../config/db';
import { $Enums } from '@prisma/client';
const TransactionType = $Enums.TransactionType;
import { Prisma } from '@prisma/client';

export const getDashboardSummary = async (req: Request, res: Response) => {
    const summary = await prisma.transaction.groupBy({
        by: ['type'],
        _sum: { amount: true },
    });

    const totalIncome = summary.find(s => s.type === TransactionType.INCOME)?._sum.amount || 0;
    const totalExpense = summary.find(s => s.type === TransactionType.EXPENSE)?._sum.amount || 0;

    const categoryWiseTotals = await prisma.transaction.groupBy({
        by: ['category', 'type'],
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
    });

    const netBalance = totalIncome - totalExpense;

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const recentTransactions = await prisma.transaction.findMany({
        where: { date: { gte: last7Days } },
        orderBy: { date: 'desc' },
    });

    res.json({
        totals: { totalIncome, totalExpense },
        netBalance,
        categoryWiseTotals,
        recentTransactions,
    });
};
