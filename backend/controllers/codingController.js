import { CodingQuestion } from '../models/CodingQuestion.js';
import { User } from '../models/User.js';
import { Submission } from '../models/Submission.js';
import { evaluateSubmissionCode } from '../services/aiAgentService.js';
import { executeInSandbox } from '../services/sandboxService.js';

export const getCodingQuestions = async (req, res) => {
  try {
    const questions = await CodingQuestion.find({ topicId: req.params.topicId }).sort({ difficultyRating: 1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addCodingQuestion = async (req, res) => {
  try {
    const { title, description, topic, difficultyRating, topicId } = req.body;
    if (!title || !description || !topic || !difficultyRating || !topicId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const question = await CodingQuestion.create({ title, description, topic, difficultyRating, topicId });
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const evaluateCode = async (req, res) => {
  try {
    const { userId, questionId, userCode, language } = req.body;

    const user = await User.findById(userId);
    const question = await CodingQuestion.findById(questionId);

    if (!user || !question) {
      return res.status(404).json({ message: 'User or Question not found' });
    }

    // 1. Deterministic Sandbox Execution
    const allTestCases = question.testCases || [];
    const executionResults = await executeInSandbox(userCode, language || 'javascript', allTestCases);
    const testCasesPassed = executionResults.filter(r => r.passed).length;
    const totalTestCases = allTestCases.length;

    // 2. AI Conceptual Evaluation (Vibes, Style, Mastery)
    const aiResult = await evaluateSubmissionCode(question.title, question.description, allTestCases, userCode);

    const K = 32;
    // ensure AI overallScore is a valid number, default 0 if parsed poorly
    const aiScoreSafe = parseFloat(aiResult.overallScore) || 0;
    const expectedScore = 1 / (1 + Math.pow(10, (question.difficultyRating - user.skillRating) / 400));
    const pointChange = Math.round(K * (aiScoreSafe - expectedScore));

    const oldElo = user.skillRating;
    user.skillRating += pointChange;
    user.totalQuestionsAnswered += 1;

    if (aiResult.weakPoints && aiResult.weakPoints.length > 0) {
      user.recentWeakPoints.push(...aiResult.weakPoints);
      if (user.recentWeakPoints.length > 5) {
        user.recentWeakPoints = user.recentWeakPoints.slice(-5);
      }
    }
    await user.save();

    question.timesAnswered += 1;
    question.successRate = ((question.successRate * (question.timesAnswered - 1)) + aiScoreSafe) / question.timesAnswered;
    await question.save();

    const submission = await Submission.create({
      userId: user._id,
      questionId: question._id,
      aiScore: aiScoreSafe,
      pointsEarned: pointChange,
      feedback: aiResult.feedback,
      codeSubmitted: userCode,
    });

    res.status(200).json({
      syntaxScore: parseInt(aiResult.syntaxAccuracy) || 0,
      conceptScore: parseInt(aiResult.conceptMastery) || 0,
      testCasesPassed: testCasesPassed,
      totalTestCases: totalTestCases,
      aiFeedback: aiResult.feedback,
      oldElo,
      newElo: user.skillRating,
      state: 'evaluated',
      submissionId: submission._id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error during evaluation', error: error.message });
  }
};

export const runLocalCode = async (req, res) => {
  try {
    const { questionId, userCode, language } = req.body;
    
    if (!userCode || !userCode.trim()) {
      return res.status(400).json({ message: 'Code is required' });
    }

    const question = await CodingQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const visibleTestCases = (question.testCases || []).filter(tc => !tc.isHidden);
    
    if (visibleTestCases.length === 0) {
      return res.json([]);
    }

    // Deterministic execution! Lightning fast.
    const results = await executeInSandbox(userCode, language || 'javascript', visibleTestCases);
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Run Local Code Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
