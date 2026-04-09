import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  videoUrl: { type: String, default: '' },
  cheatsheet: { type: String, default: '' },
}, { timestamps: true });

export const Topic = mongoose.model('Topic', topicSchema);
