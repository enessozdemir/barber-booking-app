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

function calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + SLOT_DURATION_MINUTES;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
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

    // Create a map of booked slots with their status
    const bookedSlotsMap = new Map(
        bookings?.map(b => [b.start_time.substring(0, 5), b.status]) || []
    );

    const availableSlots = allSlots.map(slot => ({
        time: slot,
        available: !bookedSlotsMap.has(slot),
        status: bookedSlotsMap.get(slot) || null
    }));

    return availableSlots;
}

// Create a new booking
export async function createBooking(
    userId: string,
    barberId: string,
    date: string,
    startTime: string,
    note?: string
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

    // Check if customer already has a booking on this date
    const { data: existingCustomerBookings, error: bookingError } = await supabase
        .from("bookings")
        .select("id, start_time, barbers!inner(users!inner(full_name))")
        .eq("customer_id", userId)
        .eq("date", date)
        .in("status", ["pending", "completed"]);

    if (bookingError) throw bookingError;

    if (existingCustomerBookings && existingCustomerBookings.length > 0) {
        const existingBooking = existingCustomerBookings[0];
        const barberName = (existingBooking.barbers as any)?.users?.full_name || "bir berber";
        throw new AppError(
            BOOKING_ERRORS.CUSTOMER_ALREADY_BOOKED,
            `Bu tarihte zaten ${barberName} ile ${existingBooking.start_time.substring(0, 5)} saatinde randevunuz var`,
            400
        );
    }

    // Check if slot is available (excluding cancelled bookings)
    const { data: existingBooking } = await supabase
        .from("bookings")
        .select("id, status")
        .eq("barber_id", barberId)
        .eq("date", date)
        .eq("start_time", startTime)
        .in("status", ["pending", "completed"])
        .maybeSingle();

    if (existingBooking) {
        throw new AppError(BOOKING_ERRORS.SLOT_NOT_AVAILABLE, "This slot is already booked", 400);
    }

    // Delete any cancelled bookings for this slot to avoid unique constraint violation
    await supabase
        .from("bookings")
        .delete()
        .eq("barber_id", barberId)
        .eq("date", date)
        .eq("start_time", startTime)
        .eq("status", "cancelled");

    // Calculate end time
    const endTime = calculateEndTime(startTime);

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
