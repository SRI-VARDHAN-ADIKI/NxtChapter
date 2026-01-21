const express = require('express');
const router = express.Router();
const { createCourse, uploadBundle, getCourses, getCourseDetails } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

router.post('/course', protect, admin, createCourse);
router.post('/bundle', protect, admin, uploadBundle);

// Public or Protected depending on requirements. Let's make them protected for now or public for students.
// Assuming students need to see courses.
router.get('/courses', protect, getCourses);
router.get('/course/:id', protect, getCourseDetails);

module.exports = router;
