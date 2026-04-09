import { Doubt } from '../models/Doubt.js';
import { Topic } from '../models/Topic.js';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash',
  apiKey: process.env.GEMINI_API_KEY,
  maxOutputTokens: 1024,
});

export const askDoubt = async (req, res) => {
  try {
    const { question, topicId, courseId } = req.body;
    const studentId = req.user._id;

    if (!question) return res.status(400).json({ message: 'Question is required' });

    let context = '';
    if (topicId) {
      const topic = await Topic.findById(topicId);
      if (topic) context = `The student is studying the topic: "${topic.title}". `;
    }

    const prompt = `You are a helpful teaching assistant for a coding and CS learning platform.
${context}
The student asks: "${question}"

Provide a clear, concise, and helpful answer. Use examples if needed. Keep it under 300 words.`;

    const response = await model.invoke(prompt);
    const aiResponse = response.content;

    const doubt = await Doubt.create({
      studentId,
      topicId: topicId || undefined,
      courseId: courseId || undefined,
      question,
      aiResponse,
      status: 'ai_resolved',
    });

    res.status(201).json(doubt);
  } catch (error) {
    res.status(500).json({ message: 'Failed to process doubt', error: error.message });
  }
};

export const escalateDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });

    doubt.isEscalated = true;
    doubt.status = 'escalated';
    await doubt.save();

    res.json(doubt);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getStudentDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.find({ studentId: req.user._id })
      .populate('topicId', 'title')
      .populate('mentorId', 'name')
      .sort({ createdAt: -1 });
    res.json(doubts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getEscalatedDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.find({ isEscalated: true })
      .populate('studentId', 'name email')
      .populate('topicId', 'title')
      .sort({ createdAt: -1 });
    res.json(doubts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const resolveDoubt = async (req, res) => {
  try {
    const { mentorResponse } = req.body;
    if (!mentorResponse) return res.status(400).json({ message: 'Response is required' });

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });

    doubt.mentorResponse = mentorResponse;
    doubt.mentorId = req.user._id;
    doubt.status = 'mentor_resolved';
    await doubt.save();

    res.json(doubt);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
