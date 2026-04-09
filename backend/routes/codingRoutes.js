import express from 'express';
import { getCodingQuestions, addCodingQuestion, evaluateCode } from '../controllers/codingController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/:topicId', protect, getCodingQuestions);
router.post('/', protect, adminOnly, addCodingQuestion);
router.post('/evaluate', protect, evaluateCode);

export default router;
