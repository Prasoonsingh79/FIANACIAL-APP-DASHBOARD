import express from 'express';
import { loginUser, registerUser, getUsers, updateUserStatus } from '../controllers/authController';
import protect from '../middleware/authMiddleware';
import authorize from '../middleware/roleMiddleware';
import { Role } from '../models/User';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', protect, authorize(Role.ADMIN), getUsers);
router.put('/:id', protect, authorize(Role.ADMIN), updateUserStatus);

export default router;
