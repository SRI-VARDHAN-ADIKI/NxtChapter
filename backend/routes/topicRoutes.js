import express from 'express';
import { getTopicById, createTopic, updateTopic, deleteTopic } from '../controllers/topicController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', protect, getTopicById);
router.post('/', protect, adminOnly, createTopic);
router.put('/:id', protect, adminOnly, updateTopic);
router.delete('/:id', protect, adminOnly, deleteTopic);

export default router;
