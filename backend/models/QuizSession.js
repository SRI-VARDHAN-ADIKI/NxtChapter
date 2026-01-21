const mongoose = require('mongoose');

const quizSessionSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    currentDifficulty: { type: Number, default: 5, min: 1, max: 10 },
    history: [{
        question: String,
        answer: String,
        correct: Boolean,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('QuizSession', quizSessionSchema);
