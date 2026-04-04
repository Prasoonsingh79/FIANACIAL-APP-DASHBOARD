import express from 'express';
import { createTransaction, getTransactions, updateTransaction, deleteTransaction } from '../controllers/transactionController';
import protect from '../middleware/authMiddleware';
import authorize from '../middleware/roleMiddleware';
import { UserRole } from '../models/User';

const router = express.Router();

router.post('/', protect, authorize(UserRole.ADMIN), createTransaction);
router.get('/', protect, authorize(UserRole.ANALYST, UserRole.ADMIN), getTransactions);
router.put('/:id', protect, authorize(UserRole.ADMIN), updateTransaction);
router.delete('/:id', protect, authorize(UserRole.ADMIN), deleteTransaction);

export default router;
