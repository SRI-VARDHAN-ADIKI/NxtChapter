import mongoose from 'mongoose';

const codingQuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  topic: { type: String, required: true },
  difficultyRating: { type: Number, required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  timesAnswered: { type: Number, default: 0 },
  successRate: { type: Number, default: 0.0 },
  testCases: [{
    input: { type: String },
    expectedOutput: { type: String },
    isHidden: { type: Boolean, default: false }
  }]
}, { timestamps: true });

export const CodingQuestion = mongoose.model('CodingQuestion', codingQuestionSchema);
