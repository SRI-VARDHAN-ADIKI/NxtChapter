import express from 'express';
import { protect } from '../middleware/auth.js';
import { getSkillTree } from '../controllers/skillTreeController.js';

const router = express.Router();

router.get('/', protect, getSkillTree);

export default router;
