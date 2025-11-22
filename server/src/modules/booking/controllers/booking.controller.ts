import { Request, Response } from "express";
import * as bookingService from "../services/booking.service";
import * as barberService from "../../barber/services/barber.service";
import earningsRepository from "../../earnings/repositories/earnings.repository";
import catchAsync from "../../../utils/catchAsync";
import { AppError } from "../../auth/utils/AppError";

// Get available slots for a barber on a specific date
export const getAvailableSlots = catchAsync(async (req: Request, res: Response) => {
    const { barberId, date } = req.query;

    if (!barberId || !date) {
        res.status(400).json({
            error: {
                code: 'MISSING_FIELDS',
                message: 'barberId and date are required'
            }
        });
        return;
    }

    const slots = await bookingService.getAvailableSlots(
        barberId as string,
        date as string
    );

    res.json({ slots });
});

// Create a new booking (customer)
export const createBooking = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { barberId, date, startTime, notes, duration } = req.body;

    if (!barberId || !date || !startTime) {
        res.status(400).json({
            error: {
                code: 'MISSING_FIELDS',
                message: 'barberId, date, and startTime are required'
            }
        });
        return;
    }

    const booking = await bookingService.createBooking(
        userId,
        barberId,
        date,
        startTime,
        notes,
        duration
    );

    res.status(201).json({ booking, message: 'Booking created successfully' });
});

// Get user's bookings
export const getMyBookings = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const bookings = await bookingService.getUserBookings(userId);
    res.json({ bookings });
});

// Cancel booking (customer)
export const cancelBooking = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const booking = await bookingService.cancelBooking(id, userId);
    res.json({ booking, message: 'Booking cancelled successfully' });
});

// Get barber's schedule (barber only)
export const getBarberSchedule = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { date } = req.query;

    // Get barber record for this user
    const barber = await barberService.getBarberByUserId(userId);
    if (!barber) {
        res.status(404).json({
            error: {
                code: 'BARBER_NOT_FOUND',
                message: 'Barber profile not found'
            }
        });
        return;
    }

    const bookings = await bookingService.getBarberBookings(
        barber.id,
        date as string | undefined
    );

    res.json({ bookings });
});

// Update booking status (barber only)
export const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        res.status(400).json({
            error: {
                code: 'MISSING_FIELDS',
                message: 'status is required'
            }
        });
        return;
    }

    // Get barber record
    const barber = await barberService.getBarberByUserId(userId);
    if (!barber) {
        res.status(404).json({
            error: {
                code: 'BARBER_NOT_FOUND',
                message: 'Barber profile not found'
            }
        });
        return;
    }

    const booking = await bookingService.updateBookingStatus(id, status, barber.id);

    // If status is NOT completed, delete any existing earning record
    if (status !== 'completed') {
        try {
            await earningsRepository.deleteByBookingId(id);
        } catch (error) {
            // Log error but don't fail the request (record might not exist)
            console.error('Failed to delete earning record:', error);
        }
    }

    res.json({ booking, message: 'Booking status updated successfully' });
});

// Update booking price (barber only)
export const updateBookingPrice = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { price } = req.body;

    if (price === undefined || price === null) {
        res.status(400).json({
            error: {
                code: 'MISSING_FIELDS',
                message: 'price is required'
            }
        });
        return;
    }

    // Get barber record
    const barber = await barberService.getBarberByUserId(userId);
    if (!barber) {
        res.status(404).json({
            error: {
                code: 'BARBER_NOT_FOUND',
                message: 'Barber profile not found'
            }
        });
        return;
    }

    const booking = await bookingService.updateBookingPrice(id, price, barber.id);

    // If booking has a price and is completed, try to add/update earnings
    if (price > 0 && booking.status === 'completed') {
        try {
            await earningsRepository.upsertByBookingId({
                barber_id: barber.id,
                booking_id: booking.id,
                amount: price,
                date: booking.date,
                type: 'booking'
            });
        } catch (earningError: any) {
            // Log error but don't fail the booking update
            console.error('Failed to create/update earning record:', earningError.message);
            // Continue - booking price was updated successfully
        }
    }

    res.json({ booking, message: 'Booking price updated successfully' });
});

// Reschedule booking (barber only)
export const rescheduleBooking = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { date, startTime } = req.body;

    if (!date || !startTime) {
        res.status(400).json({
            error: {
                code: 'MISSING_FIELDS',
                message: 'date and startTime are required'
            }
        });
        return;
    }

    // Get barber record
    const barber = await barberService.getBarberByUserId(userId);
    if (!barber) {
        res.status(404).json({
            error: {
                code: 'BARBER_NOT_FOUND',
                message: 'Barber profile not found'
            }
        });
        return;
    }

    const booking = await bookingService.rescheduleBooking(id, date, startTime, barber.id);
    res.json({ booking, message: 'Booking rescheduled successfully' });
});

// Delete booking (barber only)
export const deleteBooking = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Get barber record
    const barber = await barberService.getBarberByUserId(userId);
    if (!barber) {
        res.status(404).json({
            error: {
                code: 'BARBER_NOT_FOUND',
                message: 'Barber profile not found'
            }
        });
        return;
    }

    await bookingService.deleteBooking(id, barber.id);
    res.json({ message: 'Booking deleted successfully' });
});

// Add manual earning (barber only)
export const addManualEarning = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { amount, date, notes } = req.body;

    if (!amount || !date) {
        res.status(400).json({
            error: {
                code: 'MISSING_FIELDS',
                message: 'amount and date are required'
            }
        });
        return;
    }

    // Get barber record
    const barber = await barberService.getBarberByUserId(userId);
    if (!barber) {
        res.status(404).json({
            error: {
                code: 'BARBER_NOT_FOUND',
                message: 'Barber profile not found'
            }
        });
        return;
    }

    const earning = await earningsRepository.create({
        barber_id: barber.id,
        amount,
        date,
        type: 'walk_in',
        note: notes
    });

    res.status(201).json({ earning, message: 'Manual earning added successfully' });
});

// Get daily earnings (barber only)
export const getDailyEarnings = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { date } = req.query;

    // Get barber record
    const barber = await barberService.getBarberByUserId(userId);
    if (!barber) {
        res.status(404).json({
            error: {
                code: 'BARBER_NOT_FOUND',
                message: 'Barber profile not found'
            }
        });
        return;
    }

    // Use current date if not provided
    const targetDate = date as string || new Date().toISOString().split('T')[0];
    const earnings = await earningsRepository.getByBarberAndDate(barber.id, targetDate);

    res.json({ earnings });
});
