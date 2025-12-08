import { Router } from 'express';
import earningsController from '../controllers/earnings.controller';
import { verifyToken } from '../../auth/middleware/verifyToken';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Walk-in earnings
router.post('/walk-in', earningsController.createWalkIn);
router.patch('/:id', earningsController.updateEarning);
router.delete('/:id', earningsController.deleteEarning);

// Personal earnings summaries
router.get('/daily/:date', earningsController.getDailySummary);
router.get('/monthly/:year/:month', earningsController.getMonthlySummary);
router.get('/yearly/:year', earningsController.getYearlySummary);

// Barber-specific earnings
router.get('/barber/:barberId/daily/:date', earningsController.getBarberDailySummary);
router.get('/barber/:barberId/monthly/:year/:month', earningsController.getBarberMonthlySummary);
router.get('/barber/:barberId/yearly/:year', earningsController.getBarberYearlySummary);

// Business earnings summaries
router.get('/business/daily/:date', earningsController.getBusinessDailySummary);
router.get('/business/items/:date', earningsController.getBusinessEarnings);
router.get('/business/monthly/:year/:month', earningsController.getBusinessMonthlySummary);
router.get('/business/yearly/:year', earningsController.getBusinessYearlySummary);

export default router;
