const { z } = require('zod');

// Schema for Course Bundle Upload
exports.bundleSchema = z.object({
    courseId: z.string().length(24),
    videoUrl: z.string().url(),
    cheatsheetUrl: z.string().url(),
    topicName: z.string().min(3),
    problemData: z.object({
        title: z.string().min(5),
        description: z.string(),
        starterCode: z.string(),
        testCases: z.array(z.object({
            input: z.string(),
            expectedOutput: z.string()
        })).min(1)
    })
});

// Middleware Helper
exports.validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {
        return res.status(400).json({
            message: "Validation Error",
            errors: err.errors
        });
    }
};
