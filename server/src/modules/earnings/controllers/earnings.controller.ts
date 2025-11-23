import { Request, Response, NextFunction } from 'express';
import earningsService from '../services/earnings.service';
import catchAsync from '../../../utils/catchAsync';
import { AppError } from '../../auth/utils/AppError';
import * as barberService from '../../barber/services/barber.service';

class EarningsController {
    /**
     * Create a walk-in earning
     * POST /api/earnings/walk-in
     */
    createWalkIn = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;
        const barber = await barberService.getBarberByUserId(userId);

        if (!barber) {
            return next(new AppError('ERROR', 'Barber profile not found', 404));
        }

        const { amount, date, note } = req.body;

        if (!amount || !date) {
            return next(new AppError('ERROR', 'Amount and date are required', 400));
        }

        const earning = await earningsService.createWalkIn(barber.id, amount, date, note);

        res.status(201).json({
            success: true,
            data: { earning },
        });
    });

    /**
     * Update an earning
     * PATCH /api/earnings/:id
     */
    updateEarning = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { amount, note, date } = req.body;

        const earning = await earningsService.updateEarning(id, { amount, note, date });

        res.status(200).json({
            success: true,
            data: { earning },
        });
    });

    /**
     * Get daily earning summary
     * GET /api/earnings/daily/:date
     */
    getDailySummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;
        const barber = await barberService.getBarberByUserId(userId);

        if (!barber) {
            return next(new AppError('ERROR', 'Barber profile not found', 404));
        }

        const { date } = req.params;

        const summary = await earningsService.getDailySummary(barber.id, date);

        res.status(200).json({
            success: true,
            data: summary,
        });
    });

    /**
     * Get monthly earning summary
     * GET /api/earnings/monthly/:year/:month
     */
    getMonthlySummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;
        const barber = await barberService.getBarberByUserId(userId);

        if (!barber) {
            return next(new AppError('ERROR', 'Barber profile not found', 404));
        }

        const { year, month } = req.params;

        const summary = await earningsService.getMonthlySummary(barber.id, parseInt(year), parseInt(month));

        res.status(200).json({
            success: true,
            data: summary,
        });
    });

    /**
     * Get yearly earning summary
     * GET /api/earnings/yearly/:year
     */
    getYearlySummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;
        const barber = await barberService.getBarberByUserId(userId);

        if (!barber) {
            return next(new AppError('ERROR', 'Barber profile not found', 404));
        }

        const { year } = req.params;

        const summary = await earningsService.getYearlySummary(barber.id, parseInt(year));

        res.status(200).json({
            success: true,
            data: summary,
        });
    });

    /**
     * Get business daily summary
     * GET /api/earnings/business/daily/:date
     */
    getBusinessDailySummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { date } = req.params;

        const summary = await earningsService.getBusinessDailySummary(date);

        res.status(200).json({
            success: true,
            data: summary,
        });
    });

    /**
     * Get business earnings list
     * GET /api/earnings/business/items/:date
     */
    getBusinessEarnings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { date } = req.params;

        const items = await earningsService.getBusinessEarnings(date);

        res.status(200).json({
            success: true,
            data: { items },
        });
    });

    /**
     * Get business monthly summary
     * GET /api/earnings/business/monthly/:year/:month
     */
    getBusinessMonthlySummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { year, month } = req.params;

        const summary = await earningsService.getBusinessMonthlySummary(parseInt(year), parseInt(month));

        res.status(200).json({
            success: true,
            data: summary,
        });
    });

    /**
     * Get business yearly summary
     * GET /api/earnings/business/yearly/:year
     */
    getBusinessYearlySummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { year } = req.params;

        const summary = await earningsService.getBusinessYearlySummary(parseInt(year));

        res.status(200).json({
            success: true,
            data: summary,
        });
    });
}

export default new EarningsController();
