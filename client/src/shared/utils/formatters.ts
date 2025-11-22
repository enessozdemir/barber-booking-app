/**
 * Format phone number to Turkish format: +90 XXX XXX XX XX
 */
export function formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Format as +90 XXX XXX XX XX
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
        // Remove leading 0 and add +90
        const withoutZero = cleaned.substring(1);
        return `+90 ${withoutZero.substring(0, 3)} ${withoutZero.substring(3, 6)} ${withoutZero.substring(6, 8)} ${withoutZero.substring(8, 10)}`;
    } else if (cleaned.length === 10) {
        // Already without leading 0
        return `+90 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8, 10)}`;
    }
    // Return as is if format is unexpected
    return phone;
}

/**
 * Get initials from full name
 */
export function getBarberInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}
