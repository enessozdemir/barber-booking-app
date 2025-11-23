import { Router } from 'express';
import financialController from '../controllers/financial.controller';
import { verifyToken } from '../../auth/middleware/verifyToken';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Financial summaries
router.get('/summary/daily/:date', financialController.getDailySummary);
router.get('/summary/monthly/:year/:month', financialController.getMonthlySummary);
router.get('/summary/yearly/:year', financialController.getYearlySummary);
router.get('/summary/business/daily/:date', financialController.getBusinessDailySummary);
router.get('/summary/business/monthly/:year/:month', financialController.getBusinessMonthlySummary);
router.get('/summary/business/yearly/:year', financialController.getBusinessYearlySummary);

export default router;
