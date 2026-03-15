const express = require('express');
const router = express.Router();
const { startSession, getNextQuestion, chatWithTutor } = require('../controllers/adaptiveQuizController');
const { protect } = require('../middleware/authMiddleware');

router.post('/start', protect, startSession);
router.post('/next-question', protect, getNextQuestion);
router.post('/tutor-chat', protect, chatWithTutor);

module.exports = router;
