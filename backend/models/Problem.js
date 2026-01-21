const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String }, // Markdown format
    starterCode: { type: String },
    testCases: [{
        input: String,
        expectedOutput: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
