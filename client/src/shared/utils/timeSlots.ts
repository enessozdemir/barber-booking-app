/**
 * Generate time slots from 8:00 to 20:00 in 30-minute intervals
 */
export function generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let hour = 8; hour < 20; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
}

/**
 * Calculate end time given a start time and duration in minutes
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
    const endTime = new Date(`2000-01-01T${startTime}`);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);
    return endTime.toTimeString().slice(0, 5);
}

/**
 * Get current date as ISO string (YYYY-MM-DD) in Turkey timezone
 */
export function getCurrentDateString(): string {
    const now = new Date();
    // Convert to Turkey timezone (UTC+3)
    const turkeyTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
    const year = turkeyTime.getFullYear();
    const month = String(turkeyTime.getMonth() + 1).padStart(2, '0');
    const day = String(turkeyTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

