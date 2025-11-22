import { Request, Response, NextFunction } from 'express';
import financialService from '../services/financial.service';
import catchAsync from '../../../utils/catchAsync';
import { AppError } from '../../auth/utils/AppError';
import * as barberService from '../../barber/services/barber.service';

class FinancialController {
    /**
     * Get daily financial summary
     * GET /api/financial/summary/daily/:date
     */
    getDailySummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;
        const barber = await barberService.getBarberByUserId(userId);

        if (!barber) {
            return next(new AppError('ERROR', 'Barber profile not found', 404));
        }

        const { date } = req.params;

        const summary = await financialService.getDailySummary(barber.id, date);

        res.status(200).json({
            success: true,
            data: summary,
        });
    });

    /**
     * Get monthly financial summary
     * GET /api/financial/summary/monthly/:year/:month
     */
    getMonthlySummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;
        const barber = await barberService.getBarberByUserId(userId);

        if (!barber) {
            return next(new AppError('ERROR', 'Barber profile not found', 404));
        }

        const { year, month } = req.params;

        const summary = await financialService.getMonthlySummary(barber.id, parseInt(year), parseInt(month));

        res.status(200).json({
            success: true,
            data: summary,
        });
    });

    /**
     * Get yearly financial summary
     * GET /api/financial/summary/yearly/:year
     */
    getYearlySummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;
        const barber = await barberService.getBarberByUserId(userId);

        if (!barber) {
            return next(new AppError('ERROR', 'Barber profile not found', 404));
        }

        const { year } = req.params;

        const summary = await financialService.getYearlySummary(barber.id, parseInt(year));

        res.status(200).json({
            success: true,
            data: summary,
        });
    });
}

export default new FinancialController();
