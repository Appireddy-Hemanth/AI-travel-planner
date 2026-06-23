import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function testGemini() {
  console.log('Testing Gemini API call directly...');
  console.log('API Key present:', !!process.env.GEMINI_API_KEY);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const models = [
    'gemini-1.5-flash-8b',
    'gemini-1.5-flash-8b-latest',
    'gemini-2.0-pro-exp-02-05',
    'gemini-2.0-flash-thinking-exp-01-21',
    'gemini-2.0-flash-exp',
    'gemini-2.5-flash'
  ];

  for (const model of models) {
    try {
      console.log(`Trying model: ${model}...`);
      const response = await ai.models.generateContent({
        model: model,
        contents: 'Tell me a 3-word travel slogan.',
      });
      console.log(`✨ Success with model ${model}! Response:`, response.text.trim());
      return;
    } catch (error) {
      console.error(`❌ Failed with model ${model}:`, error.message || error);
    }
  }
}

testGemini();
