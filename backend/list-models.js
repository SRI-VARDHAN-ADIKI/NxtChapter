import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await result.json();
    console.log('Available Models:', JSON.stringify(data.models?.map(m => m.name), null, 2));
  } catch (err) {
    console.error('List Models Error:', err.message);
  }
}

listModels();
