import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  skillRating: { type: Number, default: 1000 },
  recentWeakPoints: [{ type: String }],
  totalQuestionsAnswered: { type: Number, default: 0 },
  // Gamification
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  badges: [{ 
    id: String, 
    name: String, 
    icon: String, 
    earnedAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);