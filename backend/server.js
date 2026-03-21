import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';

// Import Routes
import evaluationRoutes from './routes/evaluationRoutes.js';
import authRoutes from './routes/authRoutes.js'; 
import questionRoutes from './routes/questionRoutes.js'; // <-- We added this

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/questions', questionRoutes); // <-- We added this

// Basic test route
app.get('/', (req, res) => {
  res.send('NxtChapter API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});