import express from 'express';
import { protect } from '../middleware/auth.js';
import { recordActivity, getLeaderboard, getMyGamification } from '../controllers/gamificationController.js';

const router = express.Router();

router.post('/activity', protect, recordActivity);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/me', protect, getMyGamification);

export default router;
