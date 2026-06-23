import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.list();
    console.log('Available models:');
    for (const m of response.models || []) {
      console.log(`- ${m.name}`);
    }
  } catch (err) {
    console.error('Failed to list models:', err.message || err);
  }
}

listModels();
