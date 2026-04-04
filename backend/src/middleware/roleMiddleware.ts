import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';

const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user && roles.includes(req.user.role as UserRole)) {
      next();
    } else {
      res.status(403).json({ message: `Access denied. Role ${req.user?.role} does not have required permissions.` });
    }
  };
};

export default authorize;
