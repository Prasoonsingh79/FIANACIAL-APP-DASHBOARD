import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { Role, TransactionType } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const seed = async () => {
    try {
        await prisma.$connect();
        console.log('Connected to PostgreSQL for seeding...');

        await prisma.transaction.deleteMany({});
        await prisma.user.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);

        const admin = await prisma.user.create({
            data: {
                name: 'Admin User',
                email: 'admin@finance.com',
                password: hashedPassword,
                role: Role.ADMIN,
            },
        });

        const analyst = await prisma.user.create({
            data: {
                name: 'Analyst User',
                email: 'analyst@finance.com',
                password: hashedPassword,
                role: Role.ANALYST,
            },
        });

        const viewer = await prisma.user.create({
            data: {
                name: 'Viewer User',
                email: 'viewer@finance.com',
                password: hashedPassword,
                role: Role.VIEWER,
            },
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
                date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                notes: `Auto-generated ${type} record`,
                userId: admin.id,
            });
        }

        await prisma.transaction.createMany({ data: transactions });
        console.log('Transactions seeded!');

        await prisma.$disconnect();
        process.exit();
    } catch (err) {
        console.error(err);
        await prisma.$disconnect();
        process.exit(1);
    }
};

seed();
