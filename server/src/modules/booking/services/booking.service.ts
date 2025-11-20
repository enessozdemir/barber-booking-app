import { supabase } from "../../../config/supabase";
import { AppError } from "../../auth/utils/AppError";
import { BOOKING_ERRORS } from "../constants/errorCodes";

// Time slot helpers
const BUSINESS_HOURS = {
    start: 8, // 8:00
    end: 20,  // 20:00
};

const SLOT_DURATION_MINUTES = 30;

function generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
}

function calculateEndTime(startTime: string, duration: number = 30): string {
    const [hours, minutes] = startTime.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + duration);
    return date.toTimeString().slice(0, 5);
}

// Get available slots for a barber on a specific date
export async function getAvailableSlots(barberId: string, date: string) {
    // Validate date
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        throw new AppError(BOOKING_ERRORS.BOOKING_IN_PAST, "Cannot book in the past", 400);
    }

    // Get all booked slots for this barber on this date (only pending and completed)
    const { data: bookings, error } = await supabase
        .from("bookings")
        .select("start_time, end_time, status")
        .eq("barber_id", barberId)
        .eq("date", date)
        .in("status", ["pending", "completed"]);

    if (error) throw error;

    // Generate all possible slots
    const allSlots = generateTimeSlots();

    // Create a map of booked slots with their status and span info
    const bookedSlotsMap = new Map();

    bookings?.forEach(b => {
        const start = new Date(`2000-01-01T${b.start_time}`);
        const end = new Date(`2000-01-01T${b.end_time}`);
        const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
        const span = Math.ceil(durationMinutes / 30);

        // Mark the start slot
        const startTimeStr = start.toTimeString().slice(0, 5);
        bookedSlotsMap.set(startTimeStr, {
            status: b.status,
            span: span,
            isStart: true
        });

        // Mark subsequent slots as covered
        start.setMinutes(start.getMinutes() + 30);
        while (start < end) {
            const timeStr = start.toTimeString().slice(0, 5);
            bookedSlotsMap.set(timeStr, {
                status: b.status,
                span: 0,
                isStart: false
            });
            start.setMinutes(start.getMinutes() + 30);
        }
    });

    const availableSlots = allSlots.map(slot => {
        const bookingInfo = bookedSlotsMap.get(slot);
        return {
            time: slot,
            available: !bookingInfo,
            status: bookingInfo?.status || null,
            span: bookingInfo?.span || 1,
            isStart: bookingInfo?.isStart !== false // Default to true for available slots
        };
    });

    return availableSlots;
}

// Create a new booking
export async function createBooking(
    userId: string,
    barberId: string,
    date: string,
    startTime: string,
    note?: string,
    duration: number = 30
) {
    // Validate date
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        throw new AppError(BOOKING_ERRORS.BOOKING_IN_PAST, "Cannot book in the past", 400);
    }

    // Validate time slot
    const allSlots = generateTimeSlots();
    if (!allSlots.includes(startTime)) {
        throw new AppError(BOOKING_ERRORS.INVALID_TIME_SLOT, "Invalid time slot", 400);
    }

    // Validate consecutive slots
    const slotsNeeded = duration / 30;
    const startIndex = allSlots.indexOf(startTime);
    if (startIndex === -1 || startIndex + slotsNeeded > allSlots.length) {
        throw new AppError(BOOKING_ERRORS.INSUFFICIENT_CONSECUTIVE_SLOTS, "Not enough time slots available", 400);
    }

    // Check for overlapping bookings for the same customer
    const { data: existingCustomerBookings, error: bookingError } = await supabase
        .from("bookings")
        .select("id, start_time, end_time, barbers!inner(users!inner(full_name))")
        .eq("customer_id", userId)
        .eq("date", date)
        .in("status", ["pending", "confirmed"]); // Only check active bookings

    if (bookingError) throw bookingError;

    // Calculate new booking end time for overlap check
    const newBookingStart = new Date(`2000-01-01T${startTime}`);
    const newBookingEnd = new Date(newBookingStart);
    newBookingEnd.setMinutes(newBookingEnd.getMinutes() + duration);

    if (existingCustomerBookings && existingCustomerBookings.length > 0) {
        const overlappingBooking = existingCustomerBookings.find(booking => {
            const existingStart = new Date(`2000-01-01T${booking.start_time}`);
            const existingEnd = new Date(`2000-01-01T${booking.end_time}`);

            // Check for overlap: (StartA < EndB) and (EndA > StartB)
            return newBookingStart < existingEnd && newBookingEnd > existingStart;
        });

        if (overlappingBooking) {
            const barberName = (overlappingBooking.barbers as any)?.users?.full_name || "bir berber";
            throw new AppError(
                BOOKING_ERRORS.CUSTOMER_ALREADY_BOOKED,
                `Bu saat aralığında ${barberName} ile zaten randevunuz var (${overlappingBooking.start_time.substring(0, 5)} - ${overlappingBooking.end_time.substring(0, 5)})`,
                400
            );
        }
    }

    // Calculate end time
    const endTime = calculateEndTime(startTime, duration);

    // Check for overlap with existing bookings
    const { data: overlappingBookings } = await supabase
        .from("bookings")
        .select("id")
        .eq("barber_id", barberId)
        .eq("date", date)
        .in("status", ["pending", "completed"])
        .lt("start_time", endTime)
        .gt("end_time", startTime);

    if (overlappingBookings && overlappingBookings.length > 0) {
        throw new AppError(BOOKING_ERRORS.SLOT_NOT_AVAILABLE, "One or more slots are already booked", 400);
    }

    // Delete any cancelled bookings that overlap with this new booking
    // This is to ensure we don't hit unique constraints if we had a cancelled booking in this slot
    // Note: Unique constraint is usually on (barber_id, date, start_time). 
    // Since we are creating a single booking record, we just need to make sure there isn't a cancelled one 
    // with the EXACT SAME start_time. 
    // But to be safe and clean, let's remove any cancelled overlaps.

    // Actually, simpler approach for now: just delete cancelled booking with same start_time
    // because that's likely the unique key.
    await supabase
        .from("bookings")
        .delete()
        .eq("barber_id", barberId)
        .eq("date", date)
        .eq("start_time", startTime)
        .eq("status", "cancelled");

    // Create booking
    const { data, error } = await supabase
        .from("bookings")
        .insert({
            customer_id: userId,
            barber_id: barberId,
            date,
            start_time: startTime,
            end_time: endTime,
            status: "pending",
            note: note || null,
        })
        .select(`
      *,
      barbers!inner (
        id,
        users!inner (
          full_name
        )
      )
    `)
        .single();

    if (error) throw error;
    return data;
}

// Get user's bookings
export async function getUserBookings(userId: string) {
    const { data, error } = await supabase
        .from("bookings")
        .select(`
      *,
      barbers!inner (
        id,
        users!inner (
          full_name,
          phone
        )
      )
    `)
        .eq("customer_id", userId)
        .order("date", { ascending: false })
        .order("start_time", { ascending: false });

    if (error) throw error;
    return data;
}

// Get barber's bookings
export async function getBarberBookings(barberId: string, date?: string) {
    let query = supabase
        .from("bookings")
        .select(`
      *,
      customer:users!customer_id (
        full_name,
        phone
      )
    `)
        .eq("barber_id", barberId);

    if (date) {
        query = query.eq("date", date);
    }

    query = query.order("date", { ascending: true }).order("start_time", { ascending: true });

    const { data, error } = await query;

    if (error) throw error;
    return data;
}

// Update booking status
export async function updateBookingStatus(
    bookingId: string,
    status: string,
    barberId: string
) {
    // Verify booking belongs to this barber
    const { data: booking } = await supabase
        .from("bookings")
        .select("barber_id")
        .eq("id", bookingId)
        .single();

    if (!booking || booking.barber_id !== barberId) {
        throw new AppError(BOOKING_ERRORS.UNAUTHORIZED_ACCESS, "Unauthorized access", 403);
    }

    const { data, error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", bookingId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Update booking price
export async function updateBookingPrice(
    bookingId: string,
    price: number,
    barberId: string
) {
    if (price < 0) {
        throw new AppError(BOOKING_ERRORS.INVALID_AMOUNT, "Invalid price", 400);
    }

    // Verify booking belongs to this barber
    const { data: booking } = await supabase
        .from("bookings")
        .select("barber_id")
        .eq("id", bookingId)
        .single();

    if (!booking || booking.barber_id !== barberId) {
        throw new AppError(BOOKING_ERRORS.UNAUTHORIZED_ACCESS, "Unauthorized access", 403);
    }

    const { data, error } = await supabase
        .from("bookings")
        .update({ price })
        .eq("id", bookingId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Reschedule booking
export async function rescheduleBooking(
    bookingId: string,
    newDate: string,
    newStartTime: string,
    barberId: string
) {
    // Verify booking belongs to this barber
    const { data: booking } = await supabase
        .from("bookings")
        .select("barber_id")
        .eq("id", bookingId)
        .single();

    if (!booking || booking.barber_id !== barberId) {
        throw new AppError(BOOKING_ERRORS.UNAUTHORIZED_ACCESS, "Unauthorized access", 403);
    }

    // Validate new date
    const selectedDate = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        throw new AppError(BOOKING_ERRORS.BOOKING_IN_PAST, "Cannot book in the past", 400);
    }

    // Validate time slot
    const allSlots = generateTimeSlots();
    if (!allSlots.includes(newStartTime)) {
        throw new AppError(BOOKING_ERRORS.INVALID_TIME_SLOT, "Invalid time slot", 400);
    }

    // Check if new slot is available (excluding cancelled bookings)
    const { data: existingBooking } = await supabase
        .from("bookings")
        .select("id")
        .eq("barber_id", barberId)
        .eq("date", newDate)
        .eq("start_time", newStartTime)
        .neq("status", "cancelled")
        .in("status", ["pending", "completed"])
        .neq("id", bookingId)
        .maybeSingle();

    if (existingBooking) {
        throw new AppError(BOOKING_ERRORS.SLOT_NOT_AVAILABLE, "This slot is already booked", 400);
    }

    const newEndTime = calculateEndTime(newStartTime);

    const { data, error } = await supabase
        .from("bookings")
        .update({
            date: newDate,
            start_time: newStartTime,
            end_time: newEndTime,
        })
        .eq("id", bookingId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Cancel booking (user)
export async function cancelBooking(bookingId: string, userId: string) {
    // Verify booking belongs to this user
    const { data: booking } = await supabase
        .from("bookings")
        .select("customer_id")
        .eq("id", bookingId)
        .single();

    if (!booking || booking.customer_id !== userId) {
        throw new AppError(BOOKING_ERRORS.UNAUTHORIZED_ACCESS, "Unauthorized access", 403);
    }

    const { data, error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Delete booking (barber)
export async function deleteBooking(bookingId: string, barberId: string) {
    // Verify booking belongs to this barber
    const { data: booking } = await supabase
        .from("bookings")
        .select("barber_id")
        .eq("id", bookingId)
        .single();

    if (!booking || booking.barber_id !== barberId) {
        throw new AppError(BOOKING_ERRORS.UNAUTHORIZED_ACCESS, "Unauthorized access", 403);
    }

    const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);

    if (error) throw error;
    return { success: true };
}
