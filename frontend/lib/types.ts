// ─── Budget & Hotel Tier Types ───────────────────────────────────────────────

export type BudgetTier = 'Low' | 'Medium' | 'High';
export type HotelTier = 'Budget' | 'Mid-Range' | 'Luxury';
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening';

// ─── Data Interfaces ─────────────────────────────────────────────────────────

export interface IActivity {
  title: string;
  description: string;
  estimatedCost: number;
  timeOfDay: TimeOfDay;
}

export interface IDayItinerary {
  dayNumber: number;
  activities: IActivity[];
}

export interface IHotel {
  name: string;
  tier: HotelTier;
  pricePerNight: number;
  rating: string;
  description: string;
}

export interface IEstimatedBudget {
  flights: number;
  buses: number;
  trains: number;
  carRentals: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

export interface IPackingItem {
  name: string;
  packed: boolean;
}

export interface IPackingCategory {
  category: string;
  items: IPackingItem[];
}

export interface IWeatherInsights {
  averageTemp: string;
  condition: string;
  packingAdvice: string;
  seasonalHighlights: string;
}

export interface IExpense {
  _id?: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface ITrip {
  _id: string;
  userId: string;
  destination: string;
  durationDays: number;
  budgetTier: BudgetTier;
  interests: string[];
  itinerary: IDayItinerary[];
  hotels: IHotel[];
  estimatedBudget: IEstimatedBudget;
  packingList: IPackingCategory[];
  weatherInsights?: IWeatherInsights;
  expenses?: IExpense[];
  createdAt: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
}

// ─── API Response Types ──────────────────────────────────────────────────────

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  token?: string;
  user?: IUser;
}

// ─── Form Types ──────────────────────────────────────────────────────────────

export interface CreateTripInput {
  destination: string;
  durationDays: number;
  budgetTier: BudgetTier;
  interests: string[];
}

export interface RegenerateDayInput {
  dayNumber: number;
  instructions: string;
}

// ─── Interest Options ────────────────────────────────────────────────────────

export const INTEREST_OPTIONS = [
  'Adventure',
  'Culture',
  'Food & Cuisine',
  'History',
  'Nature',
  'Nightlife',
  'Photography',
  'Relaxation',
  'Shopping',
  'Sports',
  'Art & Museums',
  'Architecture',
  'Beach',
  'Wildlife',
  'Local Experiences',
] as const;
