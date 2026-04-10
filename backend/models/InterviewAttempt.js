import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  studentAnswer: { type: String, default: '' },
  technicalScore: { type: Number, default: 0 },
  communicationScore: { type: Number, default: 0 },
  depthScore: { type: Number, default: 0 },
  overallScore: { type: Number, default: 0 },
  aiFeedback: { type: String, default: '' },
  answeredAt: { type: Date },
});

const interviewAttemptSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  questions: [questionSchema],
  currentQuestionIndex: { type: Number, default: 0 },
  overallScore: { type: Number, default: 0 },
  overallFeedback: { type: String, default: '' },
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  maxQuestions: { type: Number, default: 5 },
}, { timestamps: true });

export const InterviewAttempt = mongoose.model('InterviewAttempt', interviewAttemptSchema);
