import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import dns from 'node:dns';
import http from 'http';
import { Server } from 'socket.io';
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
import analyticsRoutes from './routes/analyticsRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';
import discussionRoutes from './routes/discussionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import skillTreeRoutes from './routes/skillTreeRoutes.js';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Make io accessible in routes
app.set('io', io);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their notification room`);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

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
app.use('/api/analytics', analyticsRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/skilltree', skillTreeRoutes);

app.get('/', (req, res) => {
  res.send('NxtChapter API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});