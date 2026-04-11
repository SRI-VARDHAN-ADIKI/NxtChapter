import { User } from '../models/User.js';
import { Question } from '../models/Question.js';
import { Submission } from '../models/Submission.js';
import { updateGamification } from '../services/gamificationService.js';
import { evaluateSubmissionCode } from '../services/aiAgentService.js';

export const submitAnswer = async (req, res) => {
  try {
    const { userId, questionId, userCode } = req.body;

    const user = await User.findById(userId);
    const question = await Question.findById(questionId);

    if (!user || !question) {
      return res.status(404).json({ message: "User or Question not found" });
    }

    const aiResult = await evaluateSubmissionCode(
      question.title, 
      question.description, 
      userCode
    );

    const K = 32;
    const expectedScore = 1 / (1 + Math.pow(10, (question.difficultyRating - user.skillRating) / 400));
    const pointChange = Math.round(K * (aiResult.overallScore - expectedScore));
    
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
    
    // Add gamification XP
    await updateGamification(user._id, 100, req.app);

    question.timesAnswered += 1;
    question.successRate = ((question.successRate * (question.timesAnswered - 1)) + aiResult.overallScore) / question.timesAnswered;
    await question.save();

    const submission = await Submission.create({
      userId: user._id,
      questionId: question._id,
      aiScore: aiResult.overallScore,
      pointsEarned: pointChange,
      feedback: aiResult.feedback,
      codeSubmitted: userCode
    });

    res.status(200).json({
      syntaxScore: parseInt(aiResult.syntaxAccuracy) || 0,
      conceptScore: parseInt(aiResult.conceptMastery) || 0,
      aiFeedback: aiResult.feedback,
      oldElo: oldElo,
      newElo: user.skillRating,
      state: 'evaluated',
      submissionId: submission._id
    });

  } catch (error) {
    console.error("Submission Error:", error);
    res.status(500).json({ message: "Server Error during submission", error: error.message });
  }
};