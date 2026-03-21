import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  topic: { type: String, required: true },
  // The dynamic difficulty rating for our point system
  difficultyRating: { type: Number, required: true },
  timesAnswered: { type: Number, default: 0 },
  successRate: { type: Number, default: 0.0 }
}, { timestamps: true });

export const Question = mongoose.model('Question', questionSchema);