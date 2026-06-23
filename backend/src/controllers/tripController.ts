import { Request, Response } from 'express';
import Trip from '../models/Trip.js';
import {
  AuthRequest,
  CreateTripSchema,
  RegenerateDaySchema,
  AddDaySchema,
  RemoveDaySchema,
  AddExpenseSchema,
  BudgetTier,
} from '../types/index.js';
import {
  generateFullTrip,
  regenerateDayItinerary,
  generateNewDay,
} from '../services/aiService.js';

/**
 * @desc    Get all trips for the authenticated user
 * @route   GET /api/trips
 * @access  Private
 */
export const getTrips = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trips = await Trip.find({ userId: req.user!._id }).sort(
      '-createdAt'
    );
    res
      .status(200)
      .json({ success: true, count: trips.length, data: trips });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Get a single trip
 * @route   GET /api/trips/:id
 * @access  Private
 */
export const getTrip = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      res.status(404).json({ success: false, error: 'Trip not found' });
      return;
    }

    // Data isolation: verify ownership
    if (trip.userId.toString() !== req.user!._id.toString()) {
      res
        .status(403)
        .json({ success: false, error: 'Not authorized to access this trip' });
      return;
    }

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Create a new trip with AI-generated content
 * @route   POST /api/trips
 * @access  Private
 */
export const createTrip = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = CreateTripSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation error',
      });
      return;
    }

    const { destination, durationDays, budgetTier, interests } = parsed.data;

    // Call AI service to generate the full trip
    const aiData = await generateFullTrip(
      destination,
      durationDays,
      budgetTier as BudgetTier,
      interests
    );

    const trip = await Trip.create({
      userId: req.user!._id,
      destination,
      durationDays,
      budgetTier,
      interests,
      itinerary: aiData.itinerary,
      hotels: aiData.hotels,
      estimatedBudget: aiData.estimatedBudget,
      packingList: aiData.packingList,
      weatherInsights: aiData.weatherInsights,
    });

    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate trip. Please try again.',
    });
  }
};

/**
 * @desc    Update a trip (general updates like packing list toggles)
 * @route   PUT /api/trips/:id
 * @access  Private
 */
export const updateTrip = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      res.status(404).json({ success: false, error: 'Trip not found' });
      return;
    }

    if (trip.userId.toString() !== req.user!._id.toString()) {
      res
        .status(403)
        .json({ success: false, error: 'Not authorized to update this trip' });
      return;
    }

    // Only allow updating safe fields
    const allowedUpdates: Record<string, unknown> = {};
    if (req.body.packingList) allowedUpdates.packingList = req.body.packingList;
    if (req.body.itinerary) allowedUpdates.itinerary = req.body.itinerary;

    trip = await Trip.findByIdAndUpdate(req.params.id, allowedUpdates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Delete a trip
 * @route   DELETE /api/trips/:id
 * @access  Private
 */
export const deleteTrip = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      res.status(404).json({ success: false, error: 'Trip not found' });
      return;
    }

    if (trip.userId.toString() !== req.user!._id.toString()) {
      res
        .status(403)
        .json({ success: false, error: 'Not authorized to delete this trip' });
      return;
    }

    await trip.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Regenerate a specific day of the itinerary using AI
 * @route   POST /api/trips/:id/regenerate-day
 * @access  Private
 */
export const regenerateDay = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = RegenerateDaySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation error',
      });
      return;
    }

    const { dayNumber, instructions } = parsed.data;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      res.status(404).json({ success: false, error: 'Trip not found' });
      return;
    }

    if (trip.userId.toString() !== req.user!._id.toString()) {
      res
        .status(403)
        .json({ success: false, error: 'Not authorized to update this trip' });
      return;
    }

    const dayIndex = trip.itinerary.findIndex(
      (day) => day.dayNumber === dayNumber
    );
    if (dayIndex === -1) {
      res
        .status(404)
        .json({ success: false, error: 'Day not found in itinerary' });
      return;
    }

    const currentActivities = JSON.stringify(
      trip.itinerary[dayIndex].activities
    );

    const newDay = await regenerateDayItinerary(
      trip.destination,
      trip.budgetTier as BudgetTier,
      trip.interests,
      dayNumber,
      currentActivities,
      instructions
    );

    trip.itinerary[dayIndex].activities = newDay.activities;
    await trip.save();

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    console.error('Regenerate day error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to regenerate day. Please try again.',
    });
  }
};

/**
 * @desc    Add a new day to the itinerary using AI
 * @route   POST /api/trips/:id/add-day
 * @access  Private
 */
export const addDay = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = AddDaySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation error',
      });
      return;
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      res.status(404).json({ success: false, error: 'Trip not found' });
      return;
    }

    if (trip.userId.toString() !== req.user!._id.toString()) {
      res
        .status(403)
        .json({ success: false, error: 'Not authorized to update this trip' });
      return;
    }

    const newDayNumber = trip.itinerary.length + 1;
    const existingDaysSummary = trip.itinerary
      .map(
        (d) =>
          `Day ${d.dayNumber}: ${d.activities.map((a) => a.title).join(', ')}`
      )
      .join('; ');

    const newDay = await generateNewDay(
      trip.destination,
      trip.budgetTier as BudgetTier,
      trip.interests,
      newDayNumber,
      existingDaysSummary,
      parsed.data.instructions
    );

    trip.itinerary.push(newDay);
    trip.durationDays = trip.itinerary.length;
    await trip.save();

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    console.error('Add day error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add day. Please try again.',
    });
  }
};

/**
 * @desc    Remove a day from the itinerary and re-number remaining days
 * @route   POST /api/trips/:id/remove-day
 * @access  Private
 */
export const removeDay = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = RemoveDaySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation error',
      });
      return;
    }

    const { dayNumber } = parsed.data;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      res.status(404).json({ success: false, error: 'Trip not found' });
      return;
    }

    if (trip.userId.toString() !== req.user!._id.toString()) {
      res
        .status(403)
        .json({ success: false, error: 'Not authorized to update this trip' });
      return;
    }

    if (trip.itinerary.length <= 1) {
      res.status(400).json({
        success: false,
        error: 'Cannot remove the last remaining day',
      });
      return;
    }

    // Remove the day
    trip.itinerary = trip.itinerary.filter((d) => d.dayNumber !== dayNumber);

    // Re-number remaining days
    trip.itinerary.forEach((day, index) => {
      day.dayNumber = index + 1;
    });

    trip.durationDays = trip.itinerary.length;
    await trip.save();

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Get a single trip (public read-only)
 * @route   GET /api/trips/share/:id
 * @access  Public
 */
export const getPublicTrip = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      res.status(404).json({ success: false, error: 'Trip not found' });
      return;
    }

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Add an expense to a trip
 * @route   POST /api/trips/:id/expenses
 * @access  Private
 */
export const addExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = AddExpenseSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation error',
      });
      return;
    }

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      res.status(404).json({ success: false, error: 'Trip not found' });
      return;
    }

    if (trip.userId.toString() !== req.user!._id.toString()) {
      res
        .status(403)
        .json({ success: false, error: 'Not authorized to update this trip' });
      return;
    }

    trip.expenses.push(parsed.data as any);
    await trip.save();

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc    Delete an expense from a trip
 * @route   DELETE /api/trips/:id/expenses/:expenseId
 * @access  Private
 */
export const deleteExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      res.status(404).json({ success: false, error: 'Trip not found' });
      return;
    }

    if (trip.userId.toString() !== req.user!._id.toString()) {
      res
        .status(403)
        .json({ success: false, error: 'Not authorized to update this trip' });
      return;
    }

    trip.expenses = trip.expenses.filter(
      (e: any) => e._id.toString() !== req.params.expenseId
    );
    await trip.save();

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, error: err.message });
  }
};
