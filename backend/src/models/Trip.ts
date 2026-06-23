import mongoose, { Schema, Model } from 'mongoose';
import {
  ITrip,
  IActivity,
  IDayItinerary,
  IHotel,
  IEstimatedBudget,
  IPackingItem,
  IPackingCategory,
  IWeatherInsights,
  IExpense,
  BudgetTierEnum,
  HotelTierEnum,
  TimeOfDayEnum,
} from '../types/index.js';

const ActivitySchema = new Schema<IActivity>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    estimatedCost: { type: Number, required: true, default: 0 },
    timeOfDay: { type: String, enum: TimeOfDayEnum, required: true },
  },
  { _id: false }
);

const DayItinerarySchema = new Schema<IDayItinerary>(
  {
    dayNumber: { type: Number, required: true },
    activities: { type: [ActivitySchema], default: [] },
  },
  { _id: false }
);

const HotelSchema = new Schema<IHotel>(
  {
    name: { type: String, required: true },
    tier: { type: String, enum: HotelTierEnum, required: true },
    pricePerNight: { type: Number, required: true, default: 0 },
    rating: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const EstimatedBudgetSchema = new Schema<IEstimatedBudget>(
  {
    flights: { type: Number, default: 0 },
    buses: { type: Number, default: 0 },
    trains: { type: Number, default: 0 },
    carRentals: { type: Number, default: 0 },
    accommodation: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    activities: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { _id: false }
);

const PackingItemSchema = new Schema<IPackingItem>(
  {
    name: { type: String, required: true },
    packed: { type: Boolean, default: false },
  },
  { _id: false }
);

const PackingCategorySchema = new Schema<IPackingCategory>(
  {
    category: { type: String, required: true },
    items: { type: [PackingItemSchema], default: [] },
  },
  { _id: false }
);

const WeatherInsightsSchema = new Schema<IWeatherInsights>(
  {
    averageTemp: { type: String, required: true },
    condition: { type: String, required: true },
    packingAdvice: { type: String, required: true },
    seasonalHighlights: { type: String, required: true },
  },
  { _id: false }
);

const ExpenseSchema = new Schema<IExpense>({
  category: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
  date: { type: Date, default: Date.now },
});

const TripSchema = new Schema<ITrip>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
  },
  durationDays: {
    type: Number,
    required: [true, 'Duration is required'],
    min: 1,
    max: 30,
  },
  budgetTier: {
    type: String,
    enum: BudgetTierEnum,
    required: [true, 'Budget tier is required'],
  },
  interests: {
    type: [String],
    required: [true, 'At least one interest is required'],
  },
  itinerary: { type: [DayItinerarySchema], default: [] },
  hotels: { type: [HotelSchema], default: [] },
  estimatedBudget: { type: EstimatedBudgetSchema, default: {} },
  packingList: { type: [PackingCategorySchema], default: [] },
  weatherInsights: { type: WeatherInsightsSchema },
  expenses: { type: [ExpenseSchema], default: [] },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Trip: Model<ITrip> = mongoose.model<ITrip>('Trip', TripSchema);

export default Trip;
