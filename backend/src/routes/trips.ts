import { Router } from 'express';
import {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  regenerateDay,
  addDay,
  removeDay,
  getPublicTrip,
  addExpense,
  deleteExpense,
} from '../controllers/tripController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Public read-only route
router.get('/share/:id', getPublicTrip);

// All subsequent trip routes are protected
router.use(protect);

router.route('/').get(getTrips).post(createTrip);

router.route('/:id').get(getTrip).put(updateTrip).delete(deleteTrip);

router.post('/:id/regenerate-day', regenerateDay);
router.post('/:id/add-day', addDay);
router.post('/:id/remove-day', removeDay);

router.post('/:id/expenses', addExpense);
router.delete('/:id/expenses/:expenseId', deleteExpense);

export default router;
