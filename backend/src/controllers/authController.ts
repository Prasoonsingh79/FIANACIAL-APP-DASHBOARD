import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { createUser, findUserByEmail, matchPassword, getAllUsers, updateUser, Role, Status } from '../models/User';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    const userExists = await findUserByEmail(email);

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await createUser({
        name,
        email,
        password,
        role: role?.toUpperCase() || Role.VIEWER,
    });

    res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
    });
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (user && await matchPassword(password, user.password)) {
        if (user.status === Status.INACTIVE) {
            return res.status(403).json({ message: 'User account is inactive. Please contact support.' });
        }
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    const users = await getAllUsers();
    res.json(users);
};

export const updateUserStatus = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { status, role } = req.body;

    try {
        const updatedUser = await updateUser(id, {
            status: status?.toUpperCase(),
            role: role?.toUpperCase(),
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(404).json({ message: 'User not found' });
    }
};
