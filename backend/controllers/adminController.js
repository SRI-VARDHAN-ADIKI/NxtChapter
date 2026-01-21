const Course = require('../models/Course');
const Problem = require('../models/Problem');

exports.createCourse = async (req, res) => {
    try {
        const { title, description } = req.body;
        const instructor = req.user.id;
        const course = await Course.create({ title, description, instructor });
        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.uploadBundle = async (req, res) => {
    const { courseId, videoUrl, cheatsheetUrl, topicName, problemData } = req.body;

    try {
        // 1. Create Problem
        let problemId = null;
        if (problemData) {
            const problem = await Problem.create({
                title: problemData.title,
                description: problemData.description,
                starterCode: problemData.starterCode,
                testCases: problemData.testCases
            });
            problemId = problem._id;
        }

        // 2. Add to Course
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        course.contentBundles.push({
            videoUrl,
            cheatsheetUrl,
            topicName,
            practiceProblem: problemId
        });

        await course.save();
        res.json(course);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('instructor', 'name');
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.getCourseDetails = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name')
            .populate({
                path: 'contentBundles.practiceProblem',
                model: 'Problem'
            });
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
