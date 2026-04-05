import { Request, Response, NextFunction } from 'express';
import { Role } from '../models/User';

const authorize = (...roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user && roles.includes(req.user.role as Role)) {
            next();
        } else {
            res.status(403).json({ message: `Access denied. Role ${req.user?.role} does not have required permissions.` });
        }
    };
};

export default authorize;
