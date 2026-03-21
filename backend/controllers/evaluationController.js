import { User } from '../models/User.js';
import { Question } from '../models/Question.js';
import { Submission } from '../models/Submission.js';
import { evaluateSubmissionCode } from '../services/aiAgentService.js';

export const submitAnswer = async (req, res) => {
  try {
    const { userId, questionId, studentCode } = req.body;

    // 1. Fetch User and Question
    const user = await User.findById(userId);
    const question = await Question.findById(questionId);

    if (!user || !question) {
      return res.status(404).json({ message: "User or Question not found" });
    }

    // 2. Call the AI Agent to evaluate the code
    const aiResult = await evaluateSubmissionCode(
      question.title, 
      question.description, 
      studentCode
    );

    // 3. Calculate Dynamic Points (Elo Rating Math)
    const K = 32; // Maximum points to gain/lose
    
    // Calculate expected win probability based on current ratings
    const expectedScore = 1 / (1 + Math.pow(10, (question.difficultyRating - user.skillRating) / 400));
    
    // Calculate actual point change based on AI's score (0.0 to 1.0)
    const pointChange = Math.round(K * (aiResult.overallScore - expectedScore));
    
    // 4. Update User Data
    user.skillRating += pointChange;
    user.totalQuestionsAnswered += 1;
    
    // Update weak points (keep only the latest 5 to avoid bloating)
    if (aiResult.weakPoints && aiResult.weakPoints.length > 0) {
      user.recentWeakPoints.push(...aiResult.weakPoints);
      if (user.recentWeakPoints.length > 5) {
        user.recentWeakPoints = user.recentWeakPoints.slice(-5);
      }
    }
    await user.save();

    // 5. Update Question Stats
    question.timesAnswered += 1;
    // Calculate rolling success rate
    question.successRate = ((question.successRate * (question.timesAnswered - 1)) + aiResult.overallScore) / question.timesAnswered;
    await question.save();

    // 6. Save the Submission Log
    const submission = await Submission.create({
      userId: user._id,
      questionId: question._id,
      aiScore: aiResult.overallScore,
      pointsEarned: pointChange,
      feedback: aiResult.feedback,
      codeSubmitted: studentCode
    });

    // 7. Send Response back to React Frontend
    res.status(200).json({
      success: true,
      newSkillRating: user.skillRating,
      pointsEarned: pointChange,
      aiEvaluation: aiResult,
      submissionId: submission._id
    });

  } catch (error) {
    console.error("Submission Error:", error);
    res.status(500).json({ message: "Server Error during submission", error: error.message });
  }
};