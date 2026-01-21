const axios = require('axios');
const Problem = require('../models/Problem');
const User = require('../models/User');

exports.submitCode = async (req, res) => {
    const { problemId, sourceCode, language } = req.body; // language: e.g., 'python', 'javascript'
    const userId = req.user.id;

    try {
        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        let allPassed = true;
        const results = [];

        for (const testCase of problem.testCases) {
            const pistonPayload = {
                language: language || 'javascript', // Default to JS
                version: '*',
                files: [
                    {
                        content: sourceCode
                    }
                ],
                stdin: testCase.input,
            };

            try {
                const response = await axios.post('https://emkc.org/api/v2/piston/execute', pistonPayload);
                const { run } = response.data;

                const actualOutput = run.stdout.trim();
                const expectedOutput = testCase.expectedOutput.trim();

                const passed = actualOutput === expectedOutput;
                if (!passed) allPassed = false;

                results.push({
                    input: testCase.input,
                    expected: expectedOutput,
                    actual: actualOutput,
                    passed
                });

            } catch (apiError) {
                console.error('Piston API Error:', apiError.message);
                return res.status(500).json({ message: 'Execution Sandbox Error' });
            }
        }

        if (allPassed) {
            // Award XP
            const user = await User.findById(userId);
            user.xpPoints += 50;
            await user.save();
        }

        res.json({
            success: allPassed,
            results,
            xpAwarded: allPassed ? 50 : 0
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
