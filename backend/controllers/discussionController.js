import { Discussion } from '../models/Discussion.js';

export const createDiscussion = async (req, res) => {
  try {
    const { topicId, courseId, title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content required' });

    const discussion = await Discussion.create({
      topicId, courseId, userId: req.user._id, title, content,
    });
    await discussion.populate('userId', 'name role');
    res.status(201).json(discussion);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getDiscussions = async (req, res) => {
  try {
    const { topicId } = req.params;
    const discussions = await Discussion.find({ topicId })
      .populate('userId', 'name role')
      .populate('replies.userId', 'name role')
      .sort({ isPinned: -1, createdAt: -1 });
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addReply = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content required' });

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

    discussion.replies.push({ userId: req.user._id, content });
    await discussion.save();
    await discussion.populate('replies.userId', 'name role');
    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const upvoteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

    const idx = discussion.upvotes.indexOf(req.user._id);
    if (idx > -1) {
      discussion.upvotes.splice(idx, 1); // remove upvote
    } else {
      discussion.upvotes.push(req.user._id); // add upvote
    }
    await discussion.save();
    res.json({ upvotes: discussion.upvotes.length, upvoted: idx === -1 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const upvoteReply = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ message: 'Reply not found' });

    const idx = reply.upvotes.indexOf(req.user._id);
    if (idx > -1) {
      reply.upvotes.splice(idx, 1);
    } else {
      reply.upvotes.push(req.user._id);
    }
    await discussion.save();
    res.json({ upvotes: reply.upvotes.length, upvoted: idx === -1 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
