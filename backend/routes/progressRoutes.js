import express from 'express';
import { getCourseProgress, updateProgress } from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:courseId', protect, getCourseProgress);
router.put('/update', protect, updateProgress);

export default router;
