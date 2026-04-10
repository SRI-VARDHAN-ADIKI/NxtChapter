import { InterviewAttempt } from '../models/InterviewAttempt.js';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-flash-latest',
  apiKey: process.env.GEMINI_API_KEY,
  maxOutputTokens: 2048,
});

// Generate interview questions for a topic
const generateInterviewQuestions = async (topic, difficulty, count = 5) => {
  const prompt = `You are a technical interviewer at a top tech company.

Generate exactly ${count} interview questions for a candidate on the topic: "${topic}"
Difficulty: ${difficulty}

Rules:
- Mix of conceptual, scenario-based, and problem-solving questions
- ${difficulty === 'easy' ? 'Focus on fundamentals and basic concepts' : difficulty === 'medium' ? 'Include application-based and "explain with example" questions' : 'Include system design, edge cases, and deep technical questions'}
- Questions should be the kind asked in real technical interviews
- Each question should be answerable in 1-2 minutes of speaking

Return ONLY valid JSON array with no extra text:
[
  "Question 1 text here?",
  "Question 2 text here?",
  "Question 3 text here?",
  "Question 4 text here?",
  "Question 5 text here?"
]`;

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Question generation timeout')), 20000)
  );

  const response = await Promise.race([model.invoke(prompt), timeoutPromise]);
  const text = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
};

// Evaluate a student's answer
const evaluateAnswer = async (question, answer, topic) => {
  const prompt = `You are a senior technical interviewer evaluating a candidate's answer.

Topic: ${topic}
Question: "${question}"
Candidate's Answer: "${answer}"

Evaluate the answer on 3 dimensions (score each 0-100):

1. Technical Accuracy: Is the answer factually correct? Does it demonstrate knowledge?
2. Communication Clarity: Is the answer well-structured, concise, and easy to follow?
3. Depth of Knowledge: Does the answer include examples, edge cases, or deeper insights?

Also provide brief, constructive feedback (2-3 sentences max).

Return ONLY valid JSON:
{
  "technicalScore": 75,
  "communicationScore": 80,
  "depthScore": 60,
  "feedback": "Your feedback here"
}`;

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Evaluation timeout')), 20000)
  );

  const response = await Promise.race([model.invoke(prompt), timeoutPromise]);
  const text = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
};

// START an interview
export const startInterview = async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    const studentId = req.user._id;

    if (!topic) return res.status(400).json({ message: 'Topic is required' });

    console.log(`[Interview] Starting for topic: ${topic}, difficulty: ${difficulty}`);
    const questions = await generateInterviewQuestions(topic, difficulty || 'medium');
    console.log(`[Interview] Generated ${questions.length} questions`);

    const attempt = await InterviewAttempt.create({
      studentId,
      topic,
      difficulty: difficulty || 'medium',
      questions: questions.map(q => ({ question: q })),
      maxQuestions: questions.length,
    });

    res.status(201).json({
      attemptId: attempt._id,
      topic: attempt.topic,
      difficulty: attempt.difficulty,
      totalQuestions: attempt.maxQuestions,
      currentQuestion: 0,
      question: questions[0],
    });
  } catch (error) {
    console.error('[Interview Start Error]', error);
    res.status(500).json({ message: 'Failed to start interview', error: error.message });
  }
};

// ANSWER a question
export const answerQuestion = async (req, res) => {
  try {
    const { attemptId, answer } = req.body;

    const attempt = await InterviewAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: 'Interview not found' });
    if (attempt.status === 'completed') return res.status(400).json({ message: 'Interview already completed' });

    const idx = attempt.currentQuestionIndex;
    const currentQ = attempt.questions[idx];

    // Handle skipped / empty answer
    let evaluation;
    if (!answer || answer.trim().length < 10) {
      evaluation = {
        technicalScore: 0,
        communicationScore: 0,
        depthScore: 0,
        feedback: 'No answer provided or answer was too short to evaluate.',
      };
    } else {
      console.log(`[Interview] Evaluating Q${idx + 1} answer`);
      evaluation = await evaluateAnswer(currentQ.question, answer, attempt.topic);
    }

    const overall = Math.round((evaluation.technicalScore + evaluation.communicationScore + evaluation.depthScore) / 3);

    // Save to the question
    currentQ.studentAnswer = answer || '';
    currentQ.technicalScore = evaluation.technicalScore;
    currentQ.communicationScore = evaluation.communicationScore;
    currentQ.depthScore = evaluation.depthScore;
    currentQ.overallScore = overall;
    currentQ.aiFeedback = evaluation.feedback;
    currentQ.answeredAt = new Date();

    attempt.currentQuestionIndex = idx + 1;

    // Check if interview is complete
    const isComplete = attempt.currentQuestionIndex >= attempt.maxQuestions;

    if (isComplete) {
      attempt.status = 'completed';
      // Calculate overall score
      const totalScore = attempt.questions.reduce((sum, q) => sum + (q.overallScore || 0), 0);
      attempt.overallScore = Math.round(totalScore / attempt.maxQuestions);

      // Generate overall feedback
      const overallPrompt = `A candidate just completed a mock interview on "${attempt.topic}" (${attempt.difficulty} difficulty).
Their per-question scores were: ${attempt.questions.map((q, i) => `Q${i + 1}: ${q.overallScore}/100`).join(', ')}.
Overall score: ${attempt.overallScore}/100.

Give a 3-4 sentence summary of their performance and top 2 actionable tips to improve. Keep it encouraging but honest.`;

      try {
        const fbResponse = await model.invoke(overallPrompt);
        attempt.overallFeedback = fbResponse.content;
      } catch {
        attempt.overallFeedback = `You scored ${attempt.overallScore}/100 overall. Keep practicing!`;
      }
    }

    await attempt.save();

    const responseData = {
      evaluation: {
        technicalScore: evaluation.technicalScore,
        communicationScore: evaluation.communicationScore,
        depthScore: evaluation.depthScore,
        overallScore: overall,
        feedback: evaluation.feedback,
      },
      isComplete,
    };

    if (!isComplete) {
      responseData.nextQuestion = attempt.questions[attempt.currentQuestionIndex].question;
      responseData.currentQuestion = attempt.currentQuestionIndex;
    } else {
      responseData.overallScore = attempt.overallScore;
      responseData.overallFeedback = attempt.overallFeedback;
    }

    res.json(responseData);
  } catch (error) {
    console.error('[Interview Answer Error]', error);
    res.status(500).json({ message: 'Failed to evaluate answer', error: error.message });
  }
};

// GET interview history
export const getHistory = async (req, res) => {
  try {
    const attempts = await InterviewAttempt.find({ studentId: req.user._id })
      .select('topic difficulty overallScore status maxQuestions createdAt')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET single interview result
export const getResult = async (req, res) => {
  try {
    const attempt = await InterviewAttempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ message: 'Interview not found' });
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
