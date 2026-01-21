const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contentBundles: [{
        videoUrl: String,
        cheatsheetUrl: String,
        topicName: String,
        practiceProblem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
