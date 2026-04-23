import { User } from '../models/User.js';
import { updateGamification, BADGE_DEFS } from '../services/gamificationService.js';

// Called when a student performs a custom action
export const recordActivity = async (req, res) => {
  try {
    const { xpEarned = 0 } = req.body;
    const result = await updateGamification(req.user._id, xpEarned, req.app);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('name skillRating xp level streak badges totalQuestionsAnswered')
      .sort({ xp: -1 })
      .limit(50);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's gamification profile
export const getMyGamification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('name xp level streak longestStreak badges skillRating totalQuestionsAnswered lastActiveDate');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check & update streak on load
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    const lastActiveDay = lastActive ? new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate()) : null;
    const diffDays = lastActiveDay ? Math.floor((today - lastActiveDay) / (1000 * 60 * 60 * 24)) : -1;

    if (diffDays > 1) {
      user.streak = 0;
      await user.save();
    }

    res.json({
      ...user.toObject(),
      allBadges: BADGE_DEFS.map(b => ({
        ...b,
        earned: user.badges.some(ub => ub.id === b.id),
        condition: undefined,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
