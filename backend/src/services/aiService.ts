import { GoogleGenAI } from '@google/genai';
import {
  AIGeneratedTrip,
  IDayItinerary,
  IPackingCategory,
  BudgetTier,
} from '../types/index.js';

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

/**
  * Wrapper to execute model content generation with exponential backoff retries for transient failures.
  */
async function generateContentWithRetry(options: any, retries = 3, delayMs = 1500): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await getAI().models.generateContent(options);
    } catch (error) {
      const err = error as any;
      const isTransient = err.status === 503 || err.status === 429 || (err.message && (err.message.includes('503') || err.message.includes('429') || err.message.includes('high demand') || err.message.includes('quota')));
      if (isTransient && i < retries - 1) {
        console.warn(`Gemini API warning: transient error (status ${err.status || 'unknown'}). Retrying in ${delayMs}ms... (Attempt ${i + 1} of ${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 2;
      } else {
        throw error;
      }
    }
  }
}

/**
 * Strips markdown code fences from AI response text if present.
 */
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Safely parse JSON from AI response with retry logic.
 */
function parseAIResponse<T>(text: string): T {
  const cleaned = cleanJsonResponse(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error('Failed to parse AI response as valid JSON. Raw text:', text);
    console.error('Parsing error:', err);
    throw new Error('Failed to parse AI response as valid JSON');
  }
}

/**
 * Generate a complete trip: itinerary, hotels, budget, and packing list.
 */
export async function generateFullTrip(
  destination: string,
  durationDays: number,
  budgetTier: BudgetTier,
  interests: string[]
): Promise<AIGeneratedTrip> {
    const prompt = `You are an elite travel planner with deep knowledge of destinations worldwide.
Create a detailed ${durationDays}-day itinerary for a trip to ${destination}.

**Traveler Profile:**
- Budget tier: ${budgetTier}
- Interests: ${interests.join(', ')}

**Requirements:**
1. Generate a day-by-day itinerary with 3-4 activities per day spread across Morning, Afternoon, and Evening
2. Suggest exactly 3 hotels: one "Budget", one "Mid-Range", and one "Luxury" — all appropriate for ${destination}
3. Estimate total trip budget in USD broken down by transportation (Flights, Buses, Trains, Car Rentals) and daily expenses (Accommodation, Food, Activities) — and calculate the total
4. Create a smart packing list with at least 4 categories relevant to the destination's climate, the ${durationDays}-day duration, and the traveler's specific interests (e.g., suggest hiking boots if "Adventure" is an interest, or an adapter plug based on the destination country)
5. Generate weather and climate insights for the destination for typical seasonal climate, including average temperature (e.g. "22°C - 28°C" or similar), general condition (e.g. "Sunny & Humid" or "Mild & Windy"), specific clothing/packing advice based on weather, and seasonal highlights.

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
    "flights": 0, "buses": 0, "trains": 0, "carRentals": 0, "accommodation": 0, "food": 0, "activities": 0, "total": 0
  },
  "packingList": [
    {
      "category": "string",
      "items": [ { "name": "string", "packed": false } ]
    }
  ],
  "weatherInsights": {
    "averageTemp": "string",
    "condition": "string",
    "packingAdvice": "string",
    "seasonalHighlights": "string"
  }
}`;

  try {
    const response = await generateContentWithRetry({
      model: 'gemini-flash-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text ?? '';
    return parseAIResponse<AIGeneratedTrip>(text);
  } catch (error) {
    console.warn(`[Gemini API] Failed to generate trip via AI. Falling back to mock generator:`, error);
    return generateMockTrip(destination, durationDays, budgetTier, interests);
  }
}

/**
 * Regenerate a specific day of an existing itinerary.
 */
export async function regenerateDayItinerary(
  destination: string,
  budgetTier: BudgetTier,
  interests: string[],
  dayNumber: number,
  currentActivities: string,
  userInstructions: string
): Promise<IDayItinerary> {
  const prompt = `You are an expert travel planner. I have an existing itinerary for a trip to ${destination} (budget: ${budgetTier}, interests: ${interests.join(', ')}).

Day ${dayNumber} currently has these activities: ${currentActivities}

The user wants to regenerate this day with the following instructions: "${userInstructions}"

Return ONLY a valid JSON object with this exact structure:
{
  "dayNumber": ${dayNumber},
  "activities": [
    { "title": "string", "description": "string", "estimatedCost": 0, "timeOfDay": "Morning" }
  ]
}

Generate 3-4 new activities for the day. Use real place names and realistic costs.`;

  try {
    const response = await generateContentWithRetry({
      model: 'gemini-flash-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text ?? '';
    return parseAIResponse<IDayItinerary>(text);
  } catch (error) {
    console.warn(`[Gemini API] Failed to regenerate day via AI. Falling back to local generation:`, error);
    return {
      dayNumber,
      activities: [
        {
          title: `Enjoy ${destination} Explorer Day`,
          description: `Custom activities designed around your feedback: "${userInstructions}".`,
          estimatedCost: budgetTier === 'Low' ? 12 : budgetTier === 'Medium' ? 30 : 65,
          timeOfDay: 'Morning'
        },
        {
          title: `Local Scenic & Historic Quarter Tour`,
          description: `Stroll through the central plaza, take photographs, and stop by a popular local cafe.`,
          estimatedCost: budgetTier === 'Low' ? 8 : budgetTier === 'Medium' ? 20 : 45,
          timeOfDay: 'Afternoon'
        },
        {
          title: `Leisure Evening & Dining Experience`,
          description: `Unwind with a peaceful dinner at a restaurant recommended for travellers who enjoy local lifestyle.`,
          estimatedCost: budgetTier === 'Low' ? 15 : budgetTier === 'Medium' ? 35 : 75,
          timeOfDay: 'Evening'
        }
      ]
    };
  }
}

/**
 * Generate a new day to add to the itinerary.
 */
export async function generateNewDay(
  destination: string,
  budgetTier: BudgetTier,
  interests: string[],
  dayNumber: number,
  existingDaysSummary: string,
  userInstructions?: string
): Promise<IDayItinerary> {
  const instructionsText = userInstructions
    ? `The user has specific instructions: "${userInstructions}"`
    : 'Create a varied day that complements the existing itinerary.';

  const prompt = `You are an expert travel planner. I have an existing itinerary for a trip to ${destination} (budget: ${budgetTier}, interests: ${interests.join(', ')}).

Existing days summary: ${existingDaysSummary}

I want to add a new Day ${dayNumber} to the itinerary. ${instructionsText}

Return ONLY a valid JSON object with this exact structure:
{
  "dayNumber": ${dayNumber},
  "activities": [
    { "title": "string", "description": "string", "estimatedCost": 0, "timeOfDay": "Morning" }
  ]
}

Generate 3-4 activities for the day. Use real place names and realistic costs. Avoid duplicating activities from existing days.`;

  try {
    const response = await generateContentWithRetry({
      model: 'gemini-flash-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text ?? '';
    return parseAIResponse<IDayItinerary>(text);
  } catch (error) {
    console.warn(`[Gemini API] Failed to generate new day via AI. Falling back to local generation:`, error);
    return {
      dayNumber,
      activities: [
        {
          title: `Scenic Excursion in ${destination}`,
          description: `Take a half-day excursion to highly-rated local landmarks and sightsee.`,
          estimatedCost: budgetTier === 'Low' ? 15 : budgetTier === 'Medium' ? 35 : 80,
          timeOfDay: 'Morning'
        },
        {
          title: `Artisanal Tasting & Craft Market`,
          description: `Interact with local artists, shop for souvenirs, and try regional culinary bites.`,
          estimatedCost: budgetTier === 'Low' ? 10 : budgetTier === 'Medium' ? 25 : 50,
          timeOfDay: 'Afternoon'
        },
        {
          title: `Sunset Vista & Night Walk`,
          description: `Head to a popular panoramic viewpoint to watch the sunset, followed by a walk through the city lights.`,
          estimatedCost: budgetTier === 'Low' ? 0 : budgetTier === 'Medium' ? 15 : 40,
          timeOfDay: 'Evening'
        }
      ]
    };
  }
}

/**
 * Generate a smart packing list independently.
 */
export async function generatePackingList(
  destination: string,
  durationDays: number,
  interests: string[]
): Promise<IPackingCategory[]> {
  const prompt = `You are a travel packing expert. Create a smart packing list for a ${durationDays}-day trip to ${destination}.

The traveler's interests are: ${interests.join(', ')}.

Consider:
- The destination's typical climate and weather
- The trip duration (${durationDays} days)
- The traveler's specific interests (e.g., hiking boots for Adventure, formal wear for Business, snorkel gear for Beach)
- Destination-specific items (power adapters, travel documents, local currency tips)

Return ONLY a valid JSON array with this exact structure:
[
  {
    "category": "string",
    "items": [ { "name": "string", "packed": false } ]
  }
]

Include at least 5 categories with 3-6 items each.`;

  const response = await generateContentWithRetry({
    model: 'gemini-flash-latest',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const text = response.text ?? '';
  return parseAIResponse<IPackingCategory[]>(text);
}

// ─── High-quality Local Mock Generator Fallback ──────────────────────────────

function generateMockTrip(
  destination: string,
  durationDays: number,
  budgetTier: BudgetTier,
  interests: string[]
): AIGeneratedTrip {
  const itinerary = [];
  for (let d = 1; d <= durationDays; d++) {
    itinerary.push({
      dayNumber: d,
      activities: [
        {
          title: `Explore Historic ${destination} Highlights`,
          description: `Visit the most iconic sights in ${destination} related to your interests in ${interests.join(', ')}. Walk through the cultural quarters and enjoy the local scenery.`,
          estimatedCost: budgetTier === 'Low' ? 15 : budgetTier === 'Medium' ? 35 : 75,
          timeOfDay: 'Morning' as const,
        },
        {
          title: `Taste Local Flavors & Culinary Lunch`,
          description: `Indulge in a premium dining experience featuring local specialties. Take a leisure walk around nearby parks or plazas.`,
          estimatedCost: budgetTier === 'Low' ? 10 : budgetTier === 'Medium' ? 25 : 60,
          timeOfDay: 'Afternoon' as const,
        },
        {
          title: `Relaxing Scenic Evening & Entertainment`,
          description: `Enjoy the nighttime ambiance of ${destination}. Experience live performance, local night market, or a rooftop lounge with panoramic views.`,
          estimatedCost: budgetTier === 'Low' ? 20 : budgetTier === 'Medium' ? 45 : 100,
          timeOfDay: 'Evening' as const,
        }
      ]
    });
  }

  const hotels = [
    {
      name: `Obsidian Comfort Inn ${destination}`,
      tier: 'Budget' as const,
      pricePerNight: budgetTier === 'Low' ? 45 : 65,
      rating: '4.2/5',
      description: 'Affordable, clean, and highly rated accommodations located close to transit hubs.',
    },
    {
      name: `Metropolitan Plaza Hotel ${destination}`,
      tier: 'Mid-Range' as const,
      pricePerNight: budgetTier === 'Low' ? 95 : 130,
      rating: '4.6/5',
      description: 'Premium amenities, spacious modern suites, and perfect central location.',
    },
    {
      name: `Grand Imperial Spa & Resort ${destination}`,
      tier: 'Luxury' as const,
      pricePerNight: budgetTier === 'Low' ? 250 : 380,
      rating: '4.9/5',
      description: 'Ultra-luxurious 5-star service, private infinity pool, premium wellness center, and fine dining.',
    }
  ];

  const flights = budgetTier === 'Low' ? 250 : budgetTier === 'Medium' ? 550 : 1200;
  const buses = budgetTier === 'Low' ? 20 : budgetTier === 'Medium' ? 45 : 90;
  const trains = budgetTier === 'Low' ? 35 : budgetTier === 'Medium' ? 80 : 160;
  const carRentals = budgetTier === 'Low' ? 0 : budgetTier === 'Medium' ? 120 : 300;
  const accommodation = hotels.find(h => h.tier === (budgetTier === 'Low' ? 'Budget' : budgetTier === 'Medium' ? 'Mid-Range' : 'Luxury'))!.pricePerNight * durationDays;
  const food = (budgetTier === 'Low' ? 25 : budgetTier === 'Medium' ? 60 : 130) * durationDays;
  const activities = (budgetTier === 'Low' ? 20 : budgetTier === 'Medium' ? 50 : 110) * durationDays;
  const total = flights + buses + trains + carRentals + accommodation + food + activities;

  const packingList = [
    {
      category: 'Clothing & Essentials',
      items: [
        { name: 'Weather-appropriate clothing layers', packed: false },
        { name: 'Comfortable walking/hiking shoes', packed: false },
        { name: 'Rain jacket or umbrella', packed: false },
      ]
    },
    {
      category: 'Electronics & Gear',
      items: [
        { name: 'Universal power adapter plug', packed: false },
        { name: 'Phone charger & power bank', packed: false },
        { name: 'Camera or phone lens kit', packed: false },
      ]
    },
    {
      category: 'Documents & Wallet',
      items: [
        { name: 'Passport & photocopies', packed: false },
        { name: 'Travel insurance documents', packed: false },
        { name: 'Local currency cash & credit cards', packed: false },
      ]
    },
    {
      category: 'Health & Personal Care',
      items: [
        { name: 'Personal prescriptions & first-aid items', packed: false },
        { name: 'Sunscreen and sunglasses', packed: false },
        { name: 'Travel-size toiletries', packed: false },
      ]
    }
  ];

  const weatherInsights = {
    averageTemp: '18°C - 26°C (64°F - 79°F)',
    condition: 'Pleasant & Mildly Sunny',
    packingAdvice: 'Pack light breathable clothing for daytime activities, and a light jacket or sweater for cooler evening strolls.',
    seasonalHighlights: 'Ideal sightseeing season with blooming local foliage and vibrant cultural street festivals.',
  };

  return {
    itinerary,
    hotels,
    estimatedBudget: { flights, buses, trains, carRentals, accommodation, food, activities, total },
    packingList,
    weatherInsights,
  };
}
