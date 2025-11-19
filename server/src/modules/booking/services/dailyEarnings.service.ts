import { supabase } from "../../../config/supabase";
import { AppError } from "../../auth/utils/AppError";
import { BOOKING_ERRORS } from "../constants/errorCodes";

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

    const { data, error } = await supabase
        .from("daily_earnings")
        .insert({
            barber_id: barberId,
            date,
            amount,
            source: "manual",
            notes: notes || null,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Get daily earnings for a barber
export async function getDailyEarnings(barberId: string, date?: string) {
    let query = supabase
        .from("daily_earnings")
        .select("*")
        .eq("barber_id", barberId);

    if (date) {
        query = query.eq("date", date);
    }

    query = query.order("date", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data;
}

// Get total earnings for a barber in a date range
export async function getTotalEarnings(
    barberId: string,
    startDate: string,
    endDate: string
) {
    const { data, error } = await supabase
        .from("daily_earnings")
        .select("amount")
        .eq("barber_id", barberId)
        .gte("date", startDate)
        .lte("date", endDate);

    if (error) throw error;

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

    const { data, error } = await supabase
        .from("daily_earnings")
        .insert({
            barber_id: barberId,
            booking_id: bookingId,
            date,
            amount,
            source: "booking",
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}
