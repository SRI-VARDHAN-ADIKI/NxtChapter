import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { getAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/', protect, adminOnly, getAnalytics);

export default router;
