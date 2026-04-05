import express from 'express';
import { createTransactionHandler, getTransactionsHandler, updateTransactionHandler, deleteTransactionHandler } from '../controllers/transactionController';
import protect from '../middleware/authMiddleware';
import authorize from '../middleware/roleMiddleware';
import { Role } from '../models/User';

const router = express.Router();

router.post('/', protect, authorize(Role.ADMIN), createTransactionHandler);
router.get('/', protect, authorize(Role.ANALYST, Role.ADMIN), getTransactionsHandler);
router.put('/:id', protect, authorize(Role.ADMIN), updateTransactionHandler);
router.delete('/:id', protect, authorize(Role.ADMIN), deleteTransactionHandler);

export default router;
