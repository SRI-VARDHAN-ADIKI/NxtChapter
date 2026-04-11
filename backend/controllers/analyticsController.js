import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Topic } from '../models/Topic.js';
import { Submission } from '../models/Submission.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { Doubt } from '../models/Doubt.js';
import { InterviewAttempt } from '../models/InterviewAttempt.js';

export const getAnalytics = async (req, res) => {
  try {
    // Overview counts
    const [totalStudents, totalCourses, totalTopics, totalSubmissions, totalDoubts] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments(),
      Topic.countDocuments(),
      Submission.countDocuments(),
      Doubt.countDocuments(),
    ]);

    // Student registrations over last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const registrations = await User.aggregate([
      { $match: { role: 'student', createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Quiz scores distribution
    const quizScores = await QuizAttempt.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, avgScore: { $avg: '$score' }, totalAttempts: { $sum: 1 }, maxScore: { $max: '$score' }, minScore: { $min: '$score' } } },
    ]);

    // Top students by XP
    const topStudents = await User.find({ role: 'student' })
      .select('name xp level skillRating streak totalQuestionsAnswered')
      .sort({ xp: -1 })
      .limit(10);

    // Activity per day (submissions + quiz attempts last 14 days)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const dailySubmissions = await Submission.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Skill rating distribution
    const ratingBuckets = await User.aggregate([
      { $match: { role: 'student' } },
      { $bucket: { groupBy: '$skillRating', boundaries: [0, 800, 1000, 1200, 1400, 1600, 1800, 2000, 3000], default: 'Other', output: { count: { $sum: 1 } } } },
    ]);

    // Doubts status breakdown
    const doubtStats = await Doubt.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Interview stats
    const interviewStats = await InterviewAttempt.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: 1 }, avgScore: { $avg: '$overallScore' } } },
    ]);

    res.json({
      overview: { totalStudents, totalCourses, totalTopics, totalSubmissions, totalDoubts },
      registrations,
      quizScores: quizScores[0] || { avgScore: 0, totalAttempts: 0 },
      topStudents,
      dailyActivity: dailySubmissions,
      ratingDistribution: ratingBuckets,
      doubtStats,
      interviewStats: interviewStats[0] || { total: 0, avgScore: 0 },
    });
  } catch (error) {
    console.error('[Analytics Error]', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};
