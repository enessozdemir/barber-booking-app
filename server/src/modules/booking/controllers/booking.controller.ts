import { Request, Response } from "express";
import * as bookingService from "../services/booking.service";
import * as dailyEarningsService from "../services/dailyEarnings.service";
import * as barberService from "../../barber/services/barber.service";

// Get available slots for a barber on a specific date
export async function getAvailableSlots(req: Request, res: Response) {
    try {
        const { barberId, date } = req.query;

        if (!barberId || !date) {
            return res.status(400).json({
                error: {
                    code: 'MISSING_FIELDS',
                    message: 'barberId and date are required'
                }
            });
        }

        const slots = await bookingService.getAvailableSlots(
            barberId as string,
            date as string
        );

        return res.json({ slots });
    } catch (err: any) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: {
                code: err.code || 'INTERNAL_SERVER_ERROR',
                message: err.message || 'Failed to fetch available slots'
            }
        });
    }
}

// Create a new booking (customer)
export async function createBooking(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const { barberId, date, startTime, notes } = req.body;

        if (!barberId || !date || !startTime) {
            return res.status(400).json({
                error: {
                    code: 'MISSING_FIELDS',
                    message: 'barberId, date, and startTime are required'
                }
            });
        }

        const booking = await bookingService.createBooking(
            userId,
            barberId,
            date,
            startTime,
            notes
        );

        return res.status(201).json({ booking, message: 'Booking created successfully' });
    } catch (err: any) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: {
                code: err.code || 'INTERNAL_SERVER_ERROR',
                message: err.message || 'Failed to create booking'
            }
        });
    }
}

// Get user's bookings
export async function getMyBookings(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const bookings = await bookingService.getUserBookings(userId);
        return res.json({ bookings });
    } catch (err: any) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: {
                code: err.code || 'INTERNAL_SERVER_ERROR',
                message: err.message || 'Failed to fetch bookings'
            }
        });
    }
}

// Cancel booking (customer)
export async function cancelBooking(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;

        const booking = await bookingService.cancelBooking(id, userId);
        return res.json({ booking, message: 'Booking cancelled successfully' });
    } catch (err: any) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: {
                code: err.code || 'INTERNAL_SERVER_ERROR',
                message: err.message || 'Failed to cancel booking'
            }
        });
    }
}

// Get barber's schedule (barber only)
export async function getBarberSchedule(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const { date } = req.query;

        // Get barber record for this user
        const barber = await barberService.getBarberByUserId(userId);
        if (!barber) {
            return res.status(404).json({
                error: {
                    code: 'BARBER_NOT_FOUND',
                    message: 'Barber profile not found'
                }
            });
        }

        const bookings = await bookingService.getBarberBookings(
            barber.id,
            date as string | undefined
        );

        return res.json({ bookings });
    } catch (err: any) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: {
                code: err.code || 'INTERNAL_SERVER_ERROR',
                message: err.message || 'Failed to fetch schedule'
            }
        });
    }
}

// Update booking status (barber only)
export async function updateBookingStatus(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                error: {
                    code: 'MISSING_FIELDS',
                    message: 'status is required'
                }
            });
        }

        // Get barber record
        const barber = await barberService.getBarberByUserId(userId);
        if (!barber) {
            return res.status(404).json({
                error: {
                    code: 'BARBER_NOT_FOUND',
                    message: 'Barber profile not found'
                }
            });
        }

        const booking = await bookingService.updateBookingStatus(id, status, barber.id);
        return res.json({ booking, message: 'Booking status updated successfully' });
    } catch (err: any) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: {
                code: err.code || 'INTERNAL_SERVER_ERROR',
                message: err.message || 'Failed to update booking status'
            }
        });
    }
}

// Update booking price (barber only)
export async function updateBookingPrice(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;
        const { price } = req.body;

        if (price === undefined || price === null) {
            return res.status(400).json({
                error: {
                    code: 'MISSING_FIELDS',
                    message: 'price is required'
                }
            });
        }

        // Get barber record
        const barber = await barberService.getBarberByUserId(userId);
        if (!barber) {
            return res.status(404).json({
                error: {
                    code: 'BARBER_NOT_FOUND',
                    message: 'Barber profile not found'
                }
            });
        }

        const booking = await bookingService.updateBookingPrice(id, price, barber.id);

        // If booking has a price and is completed, add to daily earnings
        if (price > 0 && booking.status === 'completed') {
            await dailyEarningsService.addBookingEarning(
                barber.id,
                booking.id,
                price,
                booking.date
            );
        }

        return res.json({ booking, message: 'Booking price updated successfully' });
    } catch (err: any) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: {
                code: err.code || 'INTERNAL_SERVER_ERROR',
                message: err.message || 'Failed to update booking price'
            }
        });
    }
}

// Reschedule booking (barber only)
export async function rescheduleBooking(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;
        const { date, startTime } = req.body;

        if (!date || !startTime) {
            return res.status(400).json({
                error: {
                    code: 'MISSING_FIELDS',
                    message: 'date and startTime are required'
                }
            });
        }

        // Get barber record
        const barber = await barberService.getBarberByUserId(userId);
        if (!barber) {
            return res.status(404).json({
                error: {
                    code: 'BARBER_NOT_FOUND',
                    message: 'Barber profile not found'
                }
            });
        }

        const booking = await bookingService.rescheduleBooking(id, date, startTime, barber.id);
        return res.json({ booking, message: 'Booking rescheduled successfully' });
    } catch (err: any) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: {
                code: err.code || 'INTERNAL_SERVER_ERROR',
                message: err.message || 'Failed to reschedule booking'
            }
        });
    }
}

// Delete booking (barber only)
export async function deleteBooking(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;

        // Get barber record
        const barber = await barberService.getBarberByUserId(userId);
        if (!barber) {
            return res.status(404).json({
                error: {
                    code: 'BARBER_NOT_FOUND',
                    message: 'Barber profile not found'
                }
            });
        }

        await bookingService.deleteBooking(id, barber.id);
        return res.json({ message: 'Booking deleted successfully' });
    } catch (err: any) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: {
                code: err.code || 'INTERNAL_SERVER_ERROR',
                message: err.message || 'Failed to delete booking'
            }
        });
    }
}

// Add manual earning (barber only)
export async function addManualEarning(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const { amount, date, notes } = req.body;

        if (!amount || !date) {
            return res.status(400).json({
                error: {
                    code: 'MISSING_FIELDS',
                    message: 'amount and date are required'
                }
            });
        }

        // Get barber record
        const barber = await barberService.getBarberByUserId(userId);
        if (!barber) {
            return res.status(404).json({
                error: {
                    code: 'BARBER_NOT_FOUND',
                    message: 'Barber profile not found'
                }
            });
        }

        const earning = await dailyEarningsService.addManualEarning(
            barber.id,
            amount,
            date,
            notes
        );

        return res.status(201).json({ earning, message: 'Manual earning added successfully' });
    } catch (err: any) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: {
                code: err.code || 'INTERNAL_SERVER_ERROR',
                message: err.message || 'Failed to add manual earning'
            }
        });
    }
}

// Get daily earnings (barber only)
export async function getDailyEarnings(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const { date } = req.query;

        // Get barber record
        const barber = await barberService.getBarberByUserId(userId);
        if (!barber) {
            return res.status(404).json({
                error: {
                    code: 'BARBER_NOT_FOUND',
                    message: 'Barber profile not found'
                }
            });
        }

        const earnings = await dailyEarningsService.getDailyEarnings(
            barber.id,
            date as string | undefined
        );

        return res.json({ earnings });
    } catch (err: any) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: {
                code: err.code || 'INTERNAL_SERVER_ERROR',
                message: err.message || 'Failed to fetch earnings'
            }
        });
    }
}
