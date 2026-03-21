import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';

// Import Routes
import evaluationRoutes from './routes/evaluationRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to accept JSON data in the body

// Mount Routes
// This means our submit endpoint is at: http://localhost:5000/api/evaluations/submit
app.use('/api/evaluations', evaluationRoutes);

// Basic test route to check if server is up
app.get('/', (req, res) => {
  res.send('NxtChapter API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});