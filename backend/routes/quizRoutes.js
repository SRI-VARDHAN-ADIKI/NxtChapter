import express from 'express';
import { startQuiz, answerQuestion, getQuizResult } from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/start', protect, startQuiz);
router.post('/answer', protect, answerQuestion);
router.get('/result/:attemptId', protect, getQuizResult);

export default router;
