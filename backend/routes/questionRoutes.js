import express from 'express';
import { getNextQuestion, addQuestion } from '../controllers/questionController.js';

const router = express.Router();

// Route to get the next adaptive question for a specific student
// Endpoint: http://localhost:5000/api/questions/next/:userId
router.get('/next/:userId', getNextQuestion);

// Route to add a new question to the database (for you as the admin)
// Endpoint: http://localhost:5000/api/questions/add
router.post('/add', addQuestion);

export default router;