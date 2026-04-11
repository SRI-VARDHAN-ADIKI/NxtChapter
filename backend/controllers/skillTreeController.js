import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Topic } from '../models/Topic.js';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-flash-latest',
  apiKey: process.env.GEMINI_API_KEY,
});

export const getSkillTree = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const courses = await Course.find();
    
    // Get all topics and their relevance
    const topics = await Topic.find().select('title category difficulty');

    const prompt = `You are an AI educational counselor. 
Student Level: ${user.level}
Student Skill Rating: ${user.skillRating}
Student Weak Points: ${user.recentWeakPoints.join(', ')}

Available Topics: ${JSON.stringify(topics.map(t => ({ id: t._id, title: t.title, category: t.category })))}

Create a logical, visual "Skill Tree" (learning path) for this student.
The tree should have exactly 4 "tiers" from foundational to advanced.
Each tier should have 2-3 topics that are most relevant to the student's current gaps and level.

Output ONLY a raw JSON structure:
{
  "tiers": [
    {
      "name": "Foundations",
      "topics": [{ "id": "...", "title": "...", "reason": "AI explains why this is next" }]
    },
    ... (total 4 tiers)
  ]
}`;

    const response = await model.invoke(prompt);
    const text = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    res.json(JSON.parse(text));
  } catch (error) {
    console.error('[Skill Tree Error]', error);
    res.status(500).json({ message: 'Failed to generate skill tree', error: error.message });
  }
};
