import { Request, Response, NextFunction } from 'express';
import expensesService from '../services/expenses.service';
import catchAsync from '../../../utils/catchAsync';
import { AppError } from '../../auth/utils/AppError';
import * as barberService from '../../barber/services/barber.service';

class ExpensesController {
    /**
     * Create a new expense
     * POST /api/expenses
     */
    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;
        const barber = await barberService.getBarberByUserId(userId);

        if (!barber) {
            return next(new AppError('ERROR', 'Barber profile not found', 404));
        }

        const { amount, date, category, description, type } = req.body;

        if (!amount || !date || !category || !description || !type) {
            return next(new AppError('ERROR', 'All fields are required', 400));
        }

        if (type !== 'personal' && type !== 'business') {
            return next(new AppError('ERROR', 'Type must be personal or business', 400));
        }

        const expense = await expensesService.create({
            barber_id: type === 'personal' ? barber.id : undefined,
            amount,
            date,
            category,
            description,
            type,
        });

        res.status(201).json({
            success: true,
            data: { expense },
        });
    });

    /**
     * Get daily expense summary
     * GET /api/expenses/daily/:date
     */
    getDailySummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;
        const barber = await barberService.getBarberByUserId(userId);

        if (!barber) {
            return next(new AppError('ERROR', 'Barber profile not found', 404));
        }

        const { date } = req.params;

        const summary = await expensesService.getDailySummary(barber.id, date);

        res.status(200).json({
            success: true,
            data: summary,
        });
    });

    /**
     * Get monthly expense summary
     * GET /api/expenses/monthly/:year/:month
     */
    getMonthlySummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;
        const barber = await barberService.getBarberByUserId(userId);

        if (!barber) {
            return next(new AppError('ERROR', 'Barber profile not found', 404));
        }

        const { year, month } = req.params;

        const summary = await expensesService.getMonthlySummary(barber.id, parseInt(year), parseInt(month));

        res.status(200).json({
            success: true,
            data: summary,
        });
    });

    /**
     * Get yearly expense summary
     * GET /api/expenses/yearly/:year
     */
    getYearlySummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;
        const barber = await barberService.getBarberByUserId(userId);

        if (!barber) {
            return next(new AppError('ERROR', 'Barber profile not found', 404));
        }

        const { year } = req.params;

        const summary = await expensesService.getYearlySummary(barber.id, parseInt(year));

        res.status(200).json({
            success: true,
            data: summary,
        });
    });

    /**
     * Update an expense
     * PUT /api/expenses/:id
     */
    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;
        const barber = await barberService.getBarberByUserId(userId);

        if (!barber) {
            return next(new AppError('ERROR', 'Barber profile not found', 404));
        }

        const { id } = req.params;
        const { amount, category, description, type } = req.body;

        try {
            const expense = await expensesService.update(id, barber.id, {
                amount,
                category,
                description,
                type,
            });

            res.status(200).json({
                success: true,
                data: { expense },
            });
        } catch (error: any) {
            return next(new AppError('UNAUTHORIZED', error.message, 403));
        }
    });

    /**
     * Delete an expense
     * DELETE /api/expenses/:id
     */
    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;
        const barber = await barberService.getBarberByUserId(userId);

        if (!barber) {
            return next(new AppError('ERROR', 'Barber profile not found', 404));
        }

        const { id } = req.params;

        try {
            await expensesService.delete(id, barber.id);

            res.status(200).json({
                success: true,
                message: 'Expense deleted successfully',
            });
        } catch (error: any) {
            return next(new AppError('UNAUTHORIZED', error.message, 403));
        }
    });
}

export default new ExpensesController();
