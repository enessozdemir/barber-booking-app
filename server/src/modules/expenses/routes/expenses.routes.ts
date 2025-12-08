import { Router } from 'express';
import expensesController from '../controllers/expenses.controller';
import { verifyToken } from '../../auth/middleware/verifyToken';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// CRUD operations
router.post('/', expensesController.create);
router.put('/:id', expensesController.update);
router.delete('/:id', expensesController.delete);

// Summaries
router.get('/daily/:date', expensesController.getDailySummary);
router.get('/business/items/:date', expensesController.getBusinessExpenses);
router.get('/monthly/:year/:month', expensesController.getMonthlySummary);
router.get('/yearly/:year', expensesController.getYearlySummary);

// Barber-specific expenses
router.get('/barber/:barberId/daily/:date', expensesController.getBarberExpenses);

export default router;
