import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { findUserById } from '../models/User';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                name: string;
                email: string;
                role: string;
                status: string;
            };
        }
    }
}

const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

            const user = await findUserById(decoded.id);
            if (user) {
                req.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                };
            }
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export default protect;
