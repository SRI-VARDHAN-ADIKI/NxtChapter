import express from 'express';
import { protect } from '../middleware/auth.js';
import { askVoiceTutor } from '../controllers/voiceTutorController.js';

const router = express.Router();

router.post('/ask', protect, askVoiceTutor);

export default router;