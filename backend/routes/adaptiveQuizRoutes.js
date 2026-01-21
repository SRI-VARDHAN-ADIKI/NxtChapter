const express = require('express');
const router = express.Router();
const { startSession, getNextQuestion } = require('../controllers/adaptiveQuizController');
const { protect } = require('../middleware/authMiddleware');

router.post('/start', protect, startSession);
router.post('/next-question', protect, getNextQuestion);

module.exports = router;
