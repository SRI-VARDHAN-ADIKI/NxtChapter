import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// Route to register a new student
// Endpoint: http://localhost:5000/api/auth/register
router.post('/register', registerUser);

// Route to login an existing student
// Endpoint: http://localhost:5000/api/auth/login
router.post('/login', loginUser);

export default router;