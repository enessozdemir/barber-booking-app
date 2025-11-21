import { AppError } from "../../auth/utils/AppError";
import { BOOKING_ERRORS } from "../constants/errorCodes";
import bookingRepository from "../repositories/booking.repository";

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
    // Validate date - compare only date parts, not time
    const selectedDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        throw new AppError(BOOKING_ERRORS.BOOKING_IN_PAST, "Cannot book in the past", 400);
    }

    // Get all booked slots for this barber on this date (only pending and completed)
    const bookings = await bookingRepository.findBookingsByBarberAndDate(barberId, date, ["pending", "completed"]);

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
    const existingCustomerBookings = await bookingRepository.findCustomerBookings(userId, date, ["pending", "confirmed"]);

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
    const overlappingBookings = await bookingRepository.findOverlappingBookings(barberId, date, startTime, endTime, ["pending", "completed"]);

    if (overlappingBookings && overlappingBookings.length > 0) {
        throw new AppError(BOOKING_ERRORS.SLOT_NOT_AVAILABLE, "One or more slots are already booked", 400);
    }

    // Delete any cancelled bookings that overlap with this new booking
    await bookingRepository.deleteCancelledBooking(barberId, date, startTime);

    // Create booking
    return bookingRepository.createBooking({
        customer_id: userId,
        barber_id: barberId,
        date,
        start_time: startTime,
        end_time: endTime,
        status: "pending",
        note: note || null,
    });
}

// Get user's bookings
export async function getUserBookings(userId: string) {
    return bookingRepository.findUserBookings(userId);
}

// Get barber's bookings
export async function getBarberBookings(barberId: string, date?: string) {
    return bookingRepository.findBarberBookings(barberId, date);
}

// Update booking status
export async function updateBookingStatus(
    bookingId: string,
    status: string,
    barberId: string
) {
    // Verify booking belongs to this barber
    const booking = await bookingRepository.findBookingById(bookingId);

    if (!booking || booking.barber_id !== barberId) {
        throw new AppError(BOOKING_ERRORS.UNAUTHORIZED_ACCESS, "Unauthorized access", 403);
    }

    return bookingRepository.updateBookingStatus(bookingId, status);
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
    const booking = await bookingRepository.findBookingById(bookingId);

    if (!booking || booking.barber_id !== barberId) {
        throw new AppError(BOOKING_ERRORS.UNAUTHORIZED_ACCESS, "Unauthorized access", 403);
    }

    return bookingRepository.updateBookingPrice(bookingId, price);
}

// Reschedule booking
export async function rescheduleBooking(
    bookingId: string,
    newDate: string,
    newStartTime: string,
    barberId: string
) {
    // Verify booking belongs to this barber
    const booking = await bookingRepository.findBookingById(bookingId);

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
    const existingBooking = await bookingRepository.findExistingBookingForReschedule(barberId, newDate, newStartTime, bookingId);

    if (existingBooking) {
        throw new AppError(BOOKING_ERRORS.SLOT_NOT_AVAILABLE, "This slot is already booked", 400);
    }

    const newEndTime = calculateEndTime(newStartTime);

    return bookingRepository.updateBookingTime(bookingId, newDate, newStartTime, newEndTime);
}

// Cancel booking (user)
export async function cancelBooking(bookingId: string, userId: string) {
    // Verify booking belongs to this user
    const booking = await bookingRepository.findBookingById(bookingId);

    if (!booking || booking.customer_id !== userId) {
        throw new AppError(BOOKING_ERRORS.UNAUTHORIZED_ACCESS, "Unauthorized access", 403);
    }

    return bookingRepository.updateBookingStatus(bookingId, "cancelled");
}

// Delete booking (barber)
export async function deleteBooking(bookingId: string, barberId: string) {
    // Verify booking belongs to this barber
    const booking = await bookingRepository.findBookingById(bookingId);

    if (!booking || booking.barber_id !== barberId) {
        throw new AppError(BOOKING_ERRORS.UNAUTHORIZED_ACCESS, "Unauthorized access", 403);
    }

    await bookingRepository.deleteBooking(bookingId);
    return { success: true };
}
