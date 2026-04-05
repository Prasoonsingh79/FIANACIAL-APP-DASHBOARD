import { Role, Status } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';

export { Role, Status };

export const createUser = async (data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
}) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role || Role.VIEWER,
        },
    });
};

export const findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({ where: { email } });
};

export const findUserById = async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
};

export const matchPassword = async (password: string, hashedPassword: string) => {
    return bcrypt.compare(password, hashedPassword);
};

export const getAllUsers = async () => {
    return prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, status: true, createdAt: true, updatedAt: true } });
};

export const updateUser = async (id: string, data: { status?: Status; role?: Role }) => {
    return prisma.user.update({ where: { id }, data });
};
