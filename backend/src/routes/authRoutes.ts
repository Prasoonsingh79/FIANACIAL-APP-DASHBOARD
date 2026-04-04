import express from 'express';
import { loginUser, registerUser, getUsers, updateUserStatus } from '../controllers/authController';
import protect from '../middleware/authMiddleware';
import authorize from '../middleware/roleMiddleware';
import { UserRole } from '../models/User';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', protect, authorize(UserRole.ADMIN), getUsers);
router.put('/:id', protect, authorize(UserRole.ADMIN), updateUserStatus);

export default router;
