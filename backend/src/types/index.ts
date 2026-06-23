import { Types } from 'mongoose';
import { z } from 'zod/v4';
import { Request } from 'express';

// ─── Budget & Hotel Tier Enums ───────────────────────────────────────────────

export const BudgetTierEnum = ['Low', 'Medium', 'High'] as const;
export type BudgetTier = (typeof BudgetTierEnum)[number];

export const HotelTierEnum = ['Budget', 'Mid-Range', 'Luxury'] as const;
export type HotelTier = (typeof HotelTierEnum)[number];

export const TimeOfDayEnum = ['Morning', 'Afternoon', 'Evening'] as const;
export type TimeOfDay = (typeof TimeOfDayEnum)[number];

// ─── Mongoose Document Interfaces ────────────────────────────────────────────

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

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
  _id?: Types.ObjectId;
  category: string;
  amount: number;
  description: string;
  date: Date;
}

export interface ITrip {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  destination: string;
  durationDays: number;
  budgetTier: BudgetTier;
  interests: string[];
  itinerary: IDayItinerary[];
  hotels: IHotel[];
  estimatedBudget: IEstimatedBudget;
  packingList: IPackingCategory[];
  weatherInsights?: IWeatherInsights;
  expenses: IExpense[];
  createdAt: Date;
}

// ─── Express Request Extension ───────────────────────────────────────────────

export interface AuthRequest extends Request {
  user?: IUser;
}

// ─── Zod Validation Schemas ──────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Please provide a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const LoginSchema = z.object({
  email: z.email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const CreateTripSchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  durationDays: z.number().int().min(1).max(30),
  budgetTier: z.enum(BudgetTierEnum),
  interests: z.array(z.string()).min(1, 'At least one interest is required'),
});

export const RegenerateDaySchema = z.object({
  dayNumber: z.number().int().min(1),
  instructions: z.string().min(1, 'Please provide regeneration instructions'),
});

export const AddDaySchema = z.object({
  afterDay: z.number().int().min(0).optional(),
  instructions: z.string().optional(),
});

export const RemoveDaySchema = z.object({
  dayNumber: z.number().int().min(1),
});

export const AddExpenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().min(0.01, 'Amount must be greater than zero'),
  description: z.string().default(''),
  date: z.string().default(() => new Date().toISOString()).transform((val) => new Date(val)),
});

// ─── AI Response Types ───────────────────────────────────────────────────────

export interface AIGeneratedTrip {
  itinerary: IDayItinerary[];
  hotels: IHotel[];
  estimatedBudget: IEstimatedBudget;
  packingList: IPackingCategory[];
  weatherInsights: IWeatherInsights;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}
