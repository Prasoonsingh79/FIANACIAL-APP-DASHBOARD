import express from 'express';
import { getDashboardSummary } from '../controllers/dashboardController';
import protect from '../middleware/authMiddleware';
import authorize from '../middleware/roleMiddleware';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/summary', protect, authorize(UserRole.VIEWER, UserRole.ANALYST, UserRole.ADMIN), getDashboardSummary);

export default router;
