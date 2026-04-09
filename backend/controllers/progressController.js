import { StudentProgress } from '../models/StudentProgress.js';
import { Topic } from '../models/Topic.js';

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const progress = await StudentProgress.find({ studentId, courseId });
    const topics = await Topic.find({ courseId });

    const topicProgress = topics.map((topic) => {
      const p = progress.find((pr) => pr.topicId.toString() === topic._id.toString());
      return {
        topicId: topic._id,
        title: topic.title,
        order: topic.order,
        videoWatched: p?.videoWatched || false,
        cheatsheetRead: p?.cheatsheetRead || false,
        codingCompleted: p?.codingCompleted || false,
        quizCompleted: p?.quizCompleted || false,
        quizScore: p?.quizScore || 0,
      };
    });

    const completedTopics = topicProgress.filter(
      (t) => t.videoWatched && t.cheatsheetRead && t.codingCompleted && t.quizCompleted
    ).length;

    res.json({
      totalTopics: topics.length,
      completedTopics,
      percentage: topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : 0,
      topics: topicProgress,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const { topicId, courseId, field } = req.body;
    const studentId = req.user._id;

    const validFields = ['videoWatched', 'cheatsheetRead', 'codingCompleted', 'quizCompleted'];
    if (!validFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid progress field' });
    }

    let progress = await StudentProgress.findOne({ studentId, topicId });

    if (!progress) {
      progress = await StudentProgress.create({ studentId, topicId, courseId });
    }

    progress[field] = true;
    if (req.body.quizScore !== undefined) {
      progress.quizScore = req.body.quizScore;
    }
    await progress.save();

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
