import express from 'express';
import { protect } from '../middleware/auth.js';
import { createDiscussion, getDiscussions, addReply, upvoteDiscussion, upvoteReply } from '../controllers/discussionController.js';

const router = express.Router();

router.post('/', protect, createDiscussion);
router.get('/:topicId', protect, getDiscussions);
router.post('/:id/reply', protect, addReply);
router.post('/:id/upvote', protect, upvoteDiscussion);
router.post('/:id/reply/:replyId/upvote', protect, upvoteReply);

export default router;
