const { GoogleGenerativeAI } = require('@google/generative-ai');
const QuizSession = require('../models/QuizSession');
const Course = require('../models/Course');
const User = require('../models/User');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.startSession = async (req, res) => {
    const { courseId } = req.body;
    const studentId = req.user.id;

    try {
        let session = await QuizSession.findOne({ studentId, courseId });
        if (!session) {
            session = await QuizSession.create({ studentId, courseId });
        }
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getNextQuestion = async (req, res) => {
    const { sessionId, previousAnswer } = req.body;

    try {
        const session = await QuizSession.findById(sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        let feedback = null;
        let isCorrect = false;

        // Evaluate previous answer if exists
        if (previousAnswer && session.history.length > 0) {
            const lastQuestion = session.history[session.history.length - 1];

            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const evalPrompt = `
        Question: "${lastQuestion.question}"
        User Answer: "${previousAnswer}"
        
        Evaluate strictly: Is the answer correct? Return JSON: { "correct": boolean, "explanation": "string" }
      `;

            const result = await model.generateContent(evalPrompt);
            const response = await result.response;
            const text = response.text();

            // Basic JSON parsing (Production should be more robust)
            try {
                const evalResult = JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));
                isCorrect = evalResult.correct;
                feedback = evalResult.explanation;

                // Update Session
                lastQuestion.answer = previousAnswer;
                lastQuestion.correct = isCorrect;

                if (isCorrect) {
                    session.currentDifficulty = Math.min(10, session.currentDifficulty + 1);
                } else {
                    session.currentDifficulty = Math.max(1, session.currentDifficulty - 1);
                }
            } catch (e) {
                console.error("Gemini Eval Parse Error", e);
                // Fallback or retry logic
            }
        }

        // Generate New Question
        const course = await Course.findById(session.courseId);
        // Assuming course has a subject/topic. For now, use title or generic "Coding".
        const topic = course ? course.title : "General Programming";

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const questionPrompt = `
      Generat 1 multiple choice question (MCQ) on the topic "${topic}".
      Difficulty Level: ${session.currentDifficulty}/10.
      Format: JSON { "question": "string", "options": ["A", "B", "C", "D"], "answer": "correct_option_string" }
    `;

        const qResult = await model.generateContent(questionPrompt);
        const qResponse = await qResult.response;
        const qText = qResponse.text();

        let newQuestionData;
        try {
            newQuestionData = JSON.parse(qText.replace(/```json/g, '').replace(/```/g, ''));
        } catch (e) {
            return res.status(500).json({ message: "AI Generation Failed", error: e.message });
        }

        session.history.push({
            question: newQuestionData.question,
            // We don't store correct answer here to prevent cheating inspections if we returned whole history
        });

        await session.save();

        res.json({
            feedback,
            previousCorrect: isCorrect,
            currentDifficulty: session.currentDifficulty,
            newQuestion: newQuestionData
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
