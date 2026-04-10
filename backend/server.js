import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import dns from 'node:dns';
import { connectDB } from './config/db.js';

dns.setDefaultResultOrder('ipv4first');

import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import topicRoutes from './routes/topicRoutes.js';
import codingRoutes from './routes/codingRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import doubtRoutes from './routes/doubtRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import voiceTutorRoutes from './routes/voiceTutorRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/voice-tutor', voiceTutorRoutes);
app.use('/api/interview', interviewRoutes);

app.get('/', (req, res) => {
  res.send('NxtChapter API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});