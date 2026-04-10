import { Topic } from '../models/Topic.js';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-flash-latest',
  apiKey: process.env.GEMINI_API_KEY,
  maxOutputTokens: 512,
});

export const askVoiceTutor = async (req, res) => {
  try {
    const { question, topicId } = req.body;

    if (!question) return res.status(400).json({ message: 'Question is required' });

    let topicContext = '';
    if (topicId) {
      const topic = await Topic.findById(topicId);
      if (topic) topicContext = `The student is currently studying: "${topic.title}". `;
    }

    const prompt = `You are a friendly, patient voice tutor for a coding education platform.
${topicContext}
The student asked (via voice): "${question}"

Rules:
- Keep your response SHORT (under 150 words) — it will be spoken aloud
- Use simple, conversational language (avoid jargon unless explaining it)
- If it's a coding concept, give ONE clear example
- Be encouraging and supportive
- Do NOT use markdown formatting, bullet points, or special characters — just plain spoken text
- Do NOT use code blocks — describe code verbally

Respond naturally as if you're speaking to the student face-to-face:`;

    console.log(`[Voice Tutor] Question: "${question.substring(0, 60)}..."`);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Voice Tutor Timeout')), 15000)
    );

    const response = await Promise.race([model.invoke(prompt), timeoutPromise]);
    console.log('[Voice Tutor] Response generated');

    res.json({
      answer: response.content,
      topicContext: topicContext ? true : false,
    });
  } catch (error) {
    console.error('[Voice Tutor Error]', error);
    res.status(500).json({ message: 'Failed to get voice tutor response', error: error.message });
  }
};
