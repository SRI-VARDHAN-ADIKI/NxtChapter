const QuizSession = require('../models/QuizSession');
const Course = require('../models/Course');
const aiService = require('../services/aiAgentService');

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

        // 1. Evaluate Previous Answer
        if (previousAnswer && session.history.length > 0) {
            const lastQuestion = session.history[session.history.length - 1];

            // Use LangChain Service
            const evalResult = await aiService.evaluateAnswer(lastQuestion.question, previousAnswer);

            isCorrect = evalResult.correct;
            feedback = evalResult; // { correct, explanation, suggested_focus }

            // Update History
            lastQuestion.answer = previousAnswer;
            lastQuestion.correct = isCorrect;

            // Adjust Difficulty
            if (isCorrect) {
                session.currentDifficulty = Math.min(10, session.currentDifficulty + 1);
            } else {
                session.currentDifficulty = Math.max(1, session.currentDifficulty - 1);
            }
        }

        // 2. Generate New Question
        const course = await Course.findById(session.courseId);
        const topic = course ? course.title : "General Programming";

        // Use LangChain Service
        const newQuestionData = await aiService.generateQuestion(topic, session.currentDifficulty);

        session.history.push({
            question: newQuestionData.question,
        });

        await session.save();

        res.json({
            feedback,
            previousCorrect: isCorrect,
            currentDifficulty: session.currentDifficulty,
            newQuestion: newQuestionData
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.chatWithTutor = async (req, res) => {
    const { message, codeContext, history } = req.body;
    // history could be passed to maintain conversation state if we upgrade to ConversationChain
    try {
        const reply = await aiService.chatWithTutor(history, message, codeContext);
        res.json({ reply });
    } catch (error) {
        res.status(500).json({ message: "AI Tutor Error" });
    }
};
