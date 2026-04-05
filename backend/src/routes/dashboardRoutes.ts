import express from 'express';
import { getDashboardSummary } from '../controllers/dashboardController';
import protect from '../middleware/authMiddleware';
import authorize from '../middleware/roleMiddleware';
import { Role } from '../models/User';

const router = express.Router();

router.get('/summary', protect, authorize(Role.VIEWER, Role.ANALYST, Role.ADMIN), getDashboardSummary);

export default router;
