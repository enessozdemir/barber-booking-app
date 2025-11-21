import { AppError } from "../../auth/utils/AppError";
import { BOOKING_ERRORS } from "../constants/errorCodes";
import dailyEarningsRepository from "../repositories/dailyEarnings.repository";

// Add manual earning (for walk-in customers without booking)
export async function addManualEarning(
    barberId: string,
    amount: number,
    date: string,
    notes?: string
) {
    if (amount <= 0) {
        throw new AppError(BOOKING_ERRORS.INVALID_AMOUNT, "Amount must be greater than 0", 400);
    }

    return dailyEarningsRepository.createEarning({
        barber_id: barberId,
        date,
        amount,
        source: "manual",
        notes: notes || null,
    });
}

// Get daily earnings for a barber
export async function getDailyEarnings(barberId: string, date?: string) {
    return dailyEarningsRepository.findEarningsByBarber(barberId, date);
}

// Get total earnings for a barber in a date range
export async function getTotalEarnings(
    barberId: string,
    startDate: string,
    endDate: string
) {
    const data = await dailyEarningsRepository.findEarningsByBarberAndDateRange(barberId, startDate, endDate);
    const total = data?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0;
    return { total, records: data };
}

// Auto-add earning when booking is completed with price
export async function addBookingEarning(
    barberId: string,
    bookingId: string,
    amount: number,
    date: string
) {
    if (amount <= 0) {
        throw new AppError(BOOKING_ERRORS.INVALID_AMOUNT, "Amount must be greater than 0", 400);
    }

    return dailyEarningsRepository.createEarning({
        barber_id: barberId,
        booking_id: bookingId,
        date,
        amount,
        source: "booking",
    });
}
