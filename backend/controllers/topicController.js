import { Topic } from '../models/Topic.js';
import { CodingQuestion } from '../models/CodingQuestion.js';

export const getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const codingQuestions = await CodingQuestion.find({ topicId: topic._id });
    res.json({ ...topic.toObject(), codingQuestions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createTopic = async (req, res) => {
  try {
    const { title, order, courseId, videoUrl, cheatsheet } = req.body;
    if (!title || !courseId) {
      return res.status(400).json({ message: 'Title and courseId are required' });
    }

    const topic = await Topic.create({
      title,
      order: order || 0,
      courseId,
      videoUrl: videoUrl || '',
      cheatsheet: cheatsheet || '',
    });

    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const { title, order, videoUrl, cheatsheet } = req.body;
    if (title) topic.title = title;
    if (order !== undefined) topic.order = order;
    if (videoUrl !== undefined) topic.videoUrl = videoUrl;
    if (cheatsheet !== undefined) topic.cheatsheet = cheatsheet;

    await topic.save();
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    await CodingQuestion.deleteMany({ topicId: topic._id });
    await Topic.findByIdAndDelete(req.params.id);
    res.json({ message: 'Topic and its coding questions deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
