import mongoose from 'mongoose';
import User, { UserRole } from '../models/User';
import Transaction, { TransactionType } from '../models/Transaction';
import dotenv from 'dotenv';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/finance_dashboard');
    console.log('Connected to MongoDB for seeding...');

    await User.deleteMany({});
    await Transaction.deleteMany({});

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@finance.com',
      password: 'password123',
      role: UserRole.ADMIN,
    });

    const analyst = await User.create({
      name: 'Analyst User',
      email: 'analyst@finance.com',
      password: 'password123',
      role: UserRole.ANALYST,
    });

    const viewer = await User.create({
      name: 'Viewer User',
      email: 'viewer@finance.com',
      password: 'password123',
      role: UserRole.VIEWER,
    });

    console.log('Users seeded!');

    const categories = ['Salary', 'Food', 'Rent', 'Investment', 'Utilities', 'Entertainment'];
    const transactions = [];

    for (let i = 0; i < 20; i++) {
        const type = Math.random() > 0.4 ? TransactionType.EXPENSE : TransactionType.INCOME;
        transactions.push({
            amount: Math.floor(Math.random() * 1000) + 10,
            type,
            category: categories[Math.floor(Math.random() * categories.length)],
            date: new Date(Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)),
            notes: `Auto-generated ${type} record`,
            user: admin._id,
        });
    }

    await Transaction.insertMany(transactions);
    console.log('Transactions seeded!');

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
