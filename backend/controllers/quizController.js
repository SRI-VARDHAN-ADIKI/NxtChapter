import { QuizAttempt } from '../models/QuizAttempt.js';
import { Topic } from '../models/Topic.js';
import { StudentProgress } from '../models/StudentProgress.js';
import { updateGamification } from '../services/gamificationService.js';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-1.5-flash',
  apiKey: process.env.GEMINI_API_KEY,
  maxOutputTokens: 2048,
});

console.log('[AI Config] Initialized with key starting with:', process.env.GEMINI_API_KEY?.substring(0, 10));

const generateQuestion = async (topicTitle, difficulty) => {
  const difficultyLabel = difficulty <= 2 ? 'easy' : difficulty <= 4 ? 'medium' : 'hard';

  const prompt = `You are a quiz generator for an adaptive learning platform.

Topic: ${topicTitle}
Difficulty Level: ${difficultyLabel} (${difficulty}/7)

Generate exactly ONE multiple choice question. Return ONLY valid JSON with no extra text:
{
  "questionText": "the question",
  "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
  "correctAnswer": "A) option1"
}

Rules:
- The question must be about "${topicTitle}"
- Difficulty ${difficultyLabel}: ${difficulty <= 2 ? 'basic recall and simple concepts' : difficulty <= 4 ? 'application and understanding' : 'analysis, edge cases, and tricky scenarios'}
- All 4 options must be plausible
- correctAnswer must exactly match one of the options`;

  console.log(`[AI Quiz] Generating question for topic: ${topicTitle}, difficulty: ${difficulty}`);
  
  // Add a 20-second timeout to the AI call
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('AI Generation Timeout')), 20000)
  );

  const response = await Promise.race([model.invoke(prompt), timeoutPromise]);
  console.log('[AI Quiz] Gemini response received');
  const text = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
};

export const startQuiz = async (req, res) => {
  try {
    const { topicId } = req.body;
    const studentId = req.user._id;

    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const existing = await QuizAttempt.findOne({ studentId, topicId, status: 'in_progress' });
    if (existing) {
      // The last question in the array is the UNANSWERED one (it was pushed before save)
      // totalQuestions counts answered questions, so questions[totalQuestions] is the current pending question
      const pendingQuestion = existing.questions[existing.totalQuestions];
      if (!pendingQuestion) {
        // All questions already answered but status not updated — mark complete
        existing.status = 'completed';
        await existing.save();
      } else {
        return res.json({
          attemptId: existing._id,
          questionNumber: existing.totalQuestions + 1,
          maxQuestions: existing.maxQuestions,
          score: existing.score,
          currentDifficulty: existing.currentDifficulty,
          question: {
            questionText: pendingQuestion.questionText,
            options: pendingQuestion.options,
            difficulty: pendingQuestion.difficulty,
          },
          status: existing.status,
        });
      }
    }

    const firstQuestion = await generateQuestion(topic.title, 1);

    const attempt = await QuizAttempt.create({
      studentId,
      topicId,
      questions: [{
        questionText: firstQuestion.questionText,
        options: firstQuestion.options,
        correctAnswer: firstQuestion.correctAnswer,
        difficulty: 1,
      }],
      currentDifficulty: 1,
      totalQuestions: 0,
      maxQuestions: 10,
    });

    res.status(201).json({
      attemptId: attempt._id,
      questionNumber: 1,
      maxQuestions: 10,
      score: 0,
      currentDifficulty: 1,
      question: {
        questionText: firstQuestion.questionText,
        options: firstQuestion.options,
        difficulty: 1,
      },
      status: 'in_progress',
    });
  } catch (error) {
    console.error('[Quiz Error]', error);
    res.status(500).json({ message: 'Failed to start quiz', error: error.message });
  }
};

export const answerQuestion = async (req, res) => {
  try {
    const { attemptId, answer } = req.body;

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: 'Quiz attempt not found' });
    if (attempt.status === 'completed') {
      return res.status(400).json({ message: 'Quiz already completed' });
    }

    const currentQuestion = attempt.questions[attempt.questions.length - 1];
    const isCorrect = answer === currentQuestion.correctAnswer;

    currentQuestion.studentAnswer = answer;
    currentQuestion.isCorrect = isCorrect;
    attempt.totalQuestions += 1;
    if (isCorrect) attempt.score += 1;

    if (isCorrect) {
      attempt.currentDifficulty = Math.min(7, attempt.currentDifficulty + 1);
    } else {
      attempt.currentDifficulty = Math.max(1, attempt.currentDifficulty - 1);
    }

    if (attempt.totalQuestions >= attempt.maxQuestions) {
      attempt.status = 'completed';
      await attempt.save();

      const topic = await Topic.findById(attempt.topicId);
      await StudentProgress.findOneAndUpdate(
        { studentId: attempt.studentId, topicId: attempt.topicId },
        {
          studentId: attempt.studentId,
          topicId: attempt.topicId,
          courseId: topic.courseId,
          quizCompleted: true,
          quizScore: Math.round((attempt.score / attempt.maxQuestions) * 100),
        },
        { upsert: true }
      );

      // Add gamification XP
      await updateGamification(attempt.studentId, 50, req.app);

      return res.json({
        isCorrect,
        correctAnswer: currentQuestion.correctAnswer,
        status: 'completed',
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
      });
    }

    const topic = await Topic.findById(attempt.topicId);
    const nextQuestion = await generateQuestion(topic.title, attempt.currentDifficulty);

    attempt.questions.push({
      questionText: nextQuestion.questionText,
      options: nextQuestion.options,
      correctAnswer: nextQuestion.correctAnswer,
      difficulty: attempt.currentDifficulty,
    });

    await attempt.save();

    res.json({
      isCorrect,
      correctAnswer: currentQuestion.correctAnswer,
      status: 'in_progress',
      score: attempt.score,
      questionNumber: attempt.totalQuestions + 1,
      maxQuestions: attempt.maxQuestions,
      currentDifficulty: attempt.currentDifficulty,
      question: {
        questionText: nextQuestion.questionText,
        options: nextQuestion.options,
        difficulty: attempt.currentDifficulty,
      },
    });
  } catch (error) {
    console.error('[Quiz Answer Error]', error);
    res.status(500).json({ message: 'Failed to process answer', error: error.message });
  }
};

export const getQuizResult = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.attemptId).populate('topicId', 'title');
    if (!attempt) return res.status(404).json({ message: 'Quiz attempt not found' });

    res.json({
      topicTitle: attempt.topicId.title,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
      questions: attempt.questions,
      status: attempt.status,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
