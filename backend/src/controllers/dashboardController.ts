import { Request, Response } from 'express';
import Transaction, { TransactionType } from '../models/Transaction';
import mongoose from 'mongoose';

export const getDashboardSummary = async (req: Request, res: Response) => {
  const summary = await Transaction.aggregate([
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ['$type', TransactionType.INCOME] }, '$amount', 0],
          },
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ['$type', TransactionType.EXPENSE] }, '$amount', 0],
          },
        },
      },
    },
  ]);

  const categoryWiseTotals = await Transaction.aggregate([
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const netBalance = summary.length > 0 ? summary[0].totalIncome - summary[0].totalExpense : 0;

  const weeklyTrend = await Transaction.aggregate([
    {
      $group: {
        _id: {
          week: { $week: '$date' },
          year: { $year: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
  ]);

  res.json({
    totals: summary[0] || { totalIncome: 0, totalExpense: 0 },
    netBalance,
    categoryWiseTotals,
    weeklyTrend,
  });
};
