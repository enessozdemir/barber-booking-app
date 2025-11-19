export const ERROR_MESSAGES: Record<string, string> = {
    // Login
    INVALID_CREDENTIALS: 'Telefon numarası veya şifre hatalı',
    MISSING_PHONE_OR_PASSWORD: 'Telefon numarası ve şifre gerekli',

    // Register
    MISSING_FIELDS: 'Lütfen tüm alanları doldurun',
    PASSWORDS_DO_NOT_MATCH: 'Şifreler eşleşmiyor',
    PHONE_ALREADY_REGISTERED: 'Bu telefon numarası zaten kayıtlı',
    EMAIL_ALREADY_REGISTERED: 'Bu e-posta adresi zaten kayıtlı',

    // Refresh Token
    INVALID_REFRESH_TOKEN: 'Oturum süresi doldu, lütfen tekrar giriş yapın',
    REFRESH_TOKEN_NOT_FOUND: 'Oturum bulunamadı, lütfen tekrar giriş yapın',
    MISSING_REFRESH_TOKEN: 'Oturum bilgisi eksik',

    // Reset Password
    USER_NOT_FOUND: 'Kullanıcı bulunamadı',
    INVALID_OR_EXPIRED_TOKEN: 'Geçersiz veya süresi dolmuş bağlantı',
    MISSING_PASSWORD: 'Şifre gerekli',
    MISSING_TOKEN: 'Token bilgisi eksik',

    // Generic
    INTERNAL_SERVER_ERROR: 'Bir hata oluştu, lütfen tekrar deneyin',

    // Booking
    BARBER_NOT_FOUND: 'Berber bulunamadı',
    BARBER_NOT_ACTIVE: 'Bu berber şu anda aktif değil',
    BOOKING_NOT_FOUND: 'Randevu bulunamadı',
    SLOT_NOT_AVAILABLE: 'Bu saat dolu, lütfen başka bir saat seçin',
    INVALID_TIME_SLOT: 'Geçersiz saat aralığı',
    INVALID_DATE: 'Geçersiz tarih',
    BOOKING_IN_PAST: 'Geçmiş tarihe randevu oluşturamazsınız',
    UNAUTHORIZED_ACCESS: 'Bu işlem için yetkiniz yok',
    INVALID_AMOUNT: 'Geçersiz tutar',
};

export function getErrorMessage(errorCode?: string): string {
    if (!errorCode) return ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
    return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
}
