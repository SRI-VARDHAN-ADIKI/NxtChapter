import express from 'express';
import { protect } from '../middleware/auth.js';
import { startInterview, answerQuestion, getHistory, getResult } from '../controllers/interviewController.js';

const router = express.Router();

router.post('/start', protect, startInterview);
router.post('/answer', protect, answerQuestion);
router.get('/history', protect, getHistory);
router.get('/result/:attemptId', protect, getResult);

export default router;
