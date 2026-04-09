import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  studentAnswer: { type: String, default: '' },
  isCorrect: { type: Boolean, default: false },
  difficulty: { type: Number, default: 1 },
}, { _id: false });

const quizAttemptSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  questions: [quizQuestionSchema],
  currentDifficulty: { type: Number, default: 1 },
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  maxQuestions: { type: Number, default: 10 },
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
}, { timestamps: true });

export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
