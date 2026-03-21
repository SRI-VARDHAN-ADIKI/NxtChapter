import express from 'express';
import { submitAnswer } from '../controllers/evaluationController.js';

const router = express.Router();

// POST route for a student submitting code
// This creates the endpoint: http://localhost:5000/api/evaluations/submit
router.post('/submit', submitAnswer);

export default router;