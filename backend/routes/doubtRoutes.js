import express from 'express';
import { askDoubt, escalateDoubt, getStudentDoubts, getEscalatedDoubts, resolveDoubt } from '../controllers/doubtController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, askDoubt);
router.post('/:id/escalate', protect, escalateDoubt);
router.get('/student', protect, getStudentDoubts);
router.get('/mentor', protect, adminOnly, getEscalatedDoubts);
router.put('/:id/resolve', protect, adminOnly, resolveDoubt);

export default router;
