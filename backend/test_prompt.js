import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const destination = 'italy';
const durationDays = 5;
const budgetTier = 'High';
const interests = ['Relaxation'];

const prompt = `You are an elite travel planner with deep knowledge of destinations worldwide.
Create a detailed ${durationDays}-day itinerary for a trip to ${destination}.

**Traveler Profile:**
- Budget tier: ${budgetTier}
- Interests: ${interests.join(', ')}

**Requirements:**
1. Day-by-day itinerary with 3-4 activities per day spread across Morning, Afternoon, and Evening
2. Suggest exactly 3 hotels: one "Budget", one "Mid-Range", and one "Luxury" — all appropriate for ${destination}
3. Estimate total trip budget in USD broken down by: Flights, Accommodation, Food, Activities — and calculate the total
4. Create a smart packing list with at least 4 categories relevant to the destination's climate, the ${durationDays}-day duration, and the traveler's specific interests (e.g., suggest hiking boots if "Adventure" is an interest, or an adapter plug based on the destination country)

Use REAL place names, realistic prices for a ${budgetTier} budget, and practical travel advice.

Return ONLY a valid JSON object with this exact structure:
{
  "itinerary": [
    {
      "dayNumber": 1,
      "activities": [
        { "title": "string", "description": "string", "estimatedCost": 0, "timeOfDay": "Morning" }
      ]
    }
  ],
  "hotels": [
    { "name": "string", "tier": "Budget", "pricePerNight": 0, "rating": "string", "description": "string" }
  ],
  "estimatedBudget": {
    "flights": 0, "accommodation": 0, "food": 0, "activities": 0, "total": 0
  },
  "packingList": [
    {
      "category": "string",
      "items": [ { "name": "string", "packed": false } ]
    }
  ]
}`;

async function testPrompt() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });
    console.log('RAW RESP:');
    console.log(response.text);
  } catch (error) {
    console.error(error);
  }
}

testPrompt();
