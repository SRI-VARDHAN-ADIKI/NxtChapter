import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  
  // The JSON data returned from our Gemini API evaluation:
  aiScore: { type: Number, required: true }, 
  pointsEarned: { type: Number, required: true }, 
  feedback: { type: String },
  
  codeSubmitted: { type: String, required: true }
}, { timestamps: true });

export const Submission = mongoose.model('Submission', submissionSchema);