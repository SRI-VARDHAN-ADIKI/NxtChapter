import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';

export const BADGE_DEFS = [
  { id: 'first_quiz', name: 'Quiz Starter', icon: '🎯', condition: (u) => u.totalQuestionsAnswered >= 1 },
  { id: 'quiz_10', name: 'Quiz Enthusiast', icon: '🏅', condition: (u) => u.totalQuestionsAnswered >= 10 },
  { id: 'quiz_50', name: 'Quiz Master', icon: '👑', condition: (u) => u.totalQuestionsAnswered >= 50 },
  { id: 'streak_3', name: 'On Fire', icon: '🔥', condition: (u) => u.streak >= 3 },
  { id: 'streak_7', name: 'Week Warrior', icon: '⚡', condition: (u) => u.streak >= 7 },
  { id: 'streak_30', name: 'Unstoppable', icon: '💎', condition: (u) => u.streak >= 30 },
  { id: 'xp_500', name: 'Rising Star', icon: '⭐', condition: (u) => u.xp >= 500 },
  { id: 'xp_2000', name: 'Knowledge Seeker', icon: '🧠', condition: (u) => u.xp >= 2000 },
  { id: 'xp_5000', name: 'Grandmaster', icon: '🏆', condition: (u) => u.xp >= 5000 },
  { id: 'elo_1200', name: 'Expert Coder', icon: '💻', condition: (u) => u.skillRating >= 1200 },
  { id: 'elo_1600', name: 'Elite', icon: '🦅', condition: (u) => u.skillRating >= 1600 },
  { id: 'elo_2000', name: 'Legendary', icon: '🐉', condition: (u) => u.skillRating >= 2000 },
];

const XP_PER_LEVEL = 200;
const calcLevel = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1;

export const updateGamification = async (userId, xpEarned, app = null) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Update streak
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    const lastActiveDay = lastActive ? new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate()) : null;

    const diffDays = lastActiveDay ? Math.floor((today - lastActiveDay) / (1000 * 60 * 60 * 24)) : -1;

    let streakUpdated = false;
    if (diffDays === 1) {
      user.streak += 1;
      streakUpdated = true;
    } else if (diffDays !== 0) {
      user.streak = 1;
      streakUpdated = true;
    }
    user.lastActiveDate = now;
    if (user.streak > user.longestStreak) user.longestStreak = user.streak;

    // Add XP & Level
    const oldLevel = user.level;
    user.xp += xpEarned;
    user.level = calcLevel(user.xp);

    // Badges
    const earnedIds = user.badges.map(b => b.id);
    const newBadges = [];
    for (const badge of BADGE_DEFS) {
      if (!earnedIds.includes(badge.id) && badge.condition(user)) {
        const b = { id: badge.id, name: badge.name, icon: badge.icon };
        user.badges.push(b);
        newBadges.push(b);
      }
    }

    await user.save();

    // Send Real-time notifications via Socket.IO
    if (app) {
      const io = app.get('io');
      if (io) {
        if (streakUpdated && user.streak > 1) {
          const n = await Notification.create({
            userId, type: 'streak', title: 'Streak Continued!',
            message: `You've reached a ${user.streak} day streak! keep it up! 🔥`
          });
          io.to(userId.toString()).emit('notification', n);
        }
        if (user.level > oldLevel) {
          const n = await Notification.create({
            userId, type: 'system', title: 'Level Up!',
            message: `Congratulations! You've reached Level ${user.level} 🎊`
          });
          io.to(userId.toString()).emit('notification', n);
        }
        for (const b of newBadges) {
          const n = await Notification.create({
            userId, type: 'badge', title: 'New Badge Earned!',
            message: `You've earned the "${b.name}" badge! ${b.icon}`
          });
          io.to(userId.toString()).emit('notification', n);
        }
      }
    }

    return { xp: user.xp, level: user.level, streak: user.streak, newBadges };
  } catch (error) {
    console.error('Gamification update error:', error);
  }
};
