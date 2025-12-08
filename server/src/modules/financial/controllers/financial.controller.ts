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
    /**
     * Get business daily financial summary
     * GET /api/financial/summary/business/daily/:date
     */
    getBusinessDailySummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { date } = req.params;

        const summary = await financialService.getBusinessDailySummary(date);

        res.status(200).json({
            success: true,
            data: summary,
        });
    });

    /**
     * Get business monthly financial summary
     * GET /api/financial/summary/business/monthly/:year/:month
     */
    getBusinessMonthlySummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { year, month } = req.params;

        const summary = await financialService.getBusinessMonthlySummary(parseInt(year), parseInt(month));

        res.status(200).json({
            success: true,
            data: summary,
        });
    });

    /**
     * Get business yearly financial summary
     * GET /api/financial/summary/business/yearly/:year
     */
    getBusinessYearlySummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { year } = req.params;

        const summary = await financialService.getBusinessYearlySummary(parseInt(year));

        res.status(200).json({
            success: true,
            data: summary,
        });
    });

    /**
     * Get barber daily financial summary
     * GET /api/financial/summary/barber/:barberId/daily/:date
     */
    getBarberDailySummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { barberId, date } = req.params;

        const summary = await financialService.getDailySummary(barberId, date);

        res.status(200).json({
            success: true,
            data: summary,
        });
    });

    /**
     * Get barber monthly financial summary
     * GET /api/financial/summary/barber/:barberId/monthly/:year/:month
     */
    getBarberMonthlySummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { barberId, year, month } = req.params;

        const summary = await financialService.getMonthlySummary(barberId, parseInt(year), parseInt(month));

        res.status(200).json({
            success: true,
            data: summary,
        });
    });

    /**
     * Get barber yearly financial summary
     * GET /api/financial/summary/barber/:barberId/yearly/:year
     */
    getBarberYearlySummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { barberId, year } = req.params;

        const summary = await financialService.getYearlySummary(barberId, parseInt(year));

        res.status(200).json({
            success: true,
            data: summary,
        });
    });
}

export default new FinancialController();
