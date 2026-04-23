import express from 'express';
import { getCodingQuestions, addCodingQuestion, evaluateCode, runLocalCode } from '../controllers/codingController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/:topicId', protect, getCodingQuestions);
router.post('/', protect, adminOnly, addCodingQuestion);
router.post('/evaluate', protect, evaluateCode);
router.post('/run-local', protect, runLocalCode);

export default router;
