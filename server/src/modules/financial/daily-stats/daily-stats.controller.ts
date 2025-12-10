import { Request, Response } from 'express';
import dailyStatsService from './daily-stats.service';
import catchAsync from '../../../utils/catchAsync';

export const updatePosAmount = catchAsync(async (req: Request, res: Response) => {
    const { date, amount } = req.body;

    if (!date || amount === undefined) {
        return res.status(400).json({
            status: 'error',
            message: 'Tarih ve miktar gereklidir'
        });
    }

    const stats = await dailyStatsService.updatePosAmount(date, Number(amount));

    res.status(200).json({
        status: 'success',
        data: stats
    });
});

export const getDailyStats = catchAsync(async (req: Request, res: Response) => {
    const { date } = req.params;

    if (!date) {
        return res.status(400).json({
            status: 'error',
            message: 'Tarih gereklidir'
        });
    }

    const stats = await dailyStatsService.getDailyStats(date);

    res.status(200).json({
        status: 'success',
        data: stats || { date, pos_amount: 0 }
    });
});
