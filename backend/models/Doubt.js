import mongoose from 'mongoose';

const doubtSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  question: { type: String, required: true },
  aiResponse: { type: String, default: '' },
  isEscalated: { type: Boolean, default: false },
  mentorResponse: { type: String, default: '' },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['ai_resolved', 'escalated', 'mentor_resolved'], default: 'ai_resolved' },
}, { timestamps: true });

export const Doubt = mongoose.model('Doubt', doubtSchema);
