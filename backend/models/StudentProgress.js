import mongoose from 'mongoose';

const studentProgressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  videoWatched: { type: Boolean, default: false },
  cheatsheetRead: { type: Boolean, default: false },
  codingCompleted: { type: Boolean, default: false },
  quizCompleted: { type: Boolean, default: false },
  quizScore: { type: Number, default: 0 },
}, { timestamps: true });

studentProgressSchema.index({ studentId: 1, topicId: 1 }, { unique: true });

export const StudentProgress = mongoose.model('StudentProgress', studentProgressSchema);
