const express = require('express');
const router = express.Router();
const { submitCode } = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/execute', protect, submitCode);

module.exports = router;
