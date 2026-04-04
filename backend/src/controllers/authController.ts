import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import User, { UserRole, UserStatus } from '../models/User';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || UserRole.VIEWER,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (user.status === UserStatus.INACTIVE) {
        return res.status(403).json({ message: 'User account is inactive. Please contact support.' });
    }
    res.json({
      _id: user.id,
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
    const users = await User.find({}).select('-password');
    res.json(users);
};

export const updateUserStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, role } = req.body;
    const user = await User.findById(id);

    if (user) {
        user.status = status || user.status;
        user.role = role || user.role;
        const updatedUser = await user.save();
        res.json(updatedUser);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
}
