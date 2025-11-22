import { useState, useCallback, useMemo, useEffect } from 'react';
import { useBooking } from './useBooking';
import { useAuth } from '../../auth/hooks/useAuth';
import { useErrorHandler } from '../../../shared/hooks/useErrorHandler';
import { toast } from 'react-toastify';
import { getCurrentDateString } from '../../../shared/utils/timeSlots';

interface Barber {
    id: string;
    active: boolean;
    created_at: string;
    users: {
        id: string;
        full_name: string;
        phone: string;
        email: string;
    };
    avatar_url?: string | null;
}

export function useCustomerDashboard() {
    const { booking, fetchBarbers, selectBarber, fetchAvailableSlots, createBooking, fetchMyBookings, cancelBooking } = useBooking();
    const { state: authState } = useAuth();
    const { handleError } = useErrorHandler();

    const todayStr = getCurrentDateString();
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [selectedTime, setSelectedTime] = useState('');
    const [notes, setNotes] = useState('');
    const [personCount, setPersonCount] = useState(1);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'book' | 'my-bookings'>('book');
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        bookingId: string | null;
    }>({ isOpen: false, bookingId: null });
    const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all');

    useEffect(() => {
        selectBarber(null);
        fetchBarbers();
        fetchMyBookings();
    }, [selectBarber, fetchBarbers, fetchMyBookings]);

    // Memoized filtered and sorted bookings
    const filteredBookings = useMemo(() => {
        let list = booking.myBookings ? booking.myBookings.slice() : [];

        if (filterStatus !== 'all') {
            list = list.filter(b => {
                if (filterStatus === 'cancelled') {
                    return b.status === 'cancelled' || b.status === 'rejected';
                }
                return b.status === filterStatus;
            });
        }

        // Sort by most-recent action/creation (latest first)
        list.sort((a, b) => {
            const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
            const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
            return tb - ta;
        });

        return list;
    }, [booking.myBookings, filterStatus]);

    // Memoized min date
    const minDate = useMemo(() => getCurrentDateString(), []);

    const handleBarberSelect = useCallback((barber: Barber) => {
        selectBarber(barber);
        setShowBookingForm(true);
        const currentDate = getCurrentDateString();
        setSelectedDate(currentDate);
        fetchAvailableSlots(barber.id, currentDate);
        setSelectedTime('');
        setNotes('');
    }, [selectBarber, fetchAvailableSlots]);

    const handleDateChange = useCallback((date: string) => {
        setSelectedDate(date);
        setSelectedTime('');
        if (booking.selectedBarber && date) {
            fetchAvailableSlots(booking.selectedBarber.id, date);
        }
    }, [booking.selectedBarber, fetchAvailableSlots]);

    const handleBookingSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!booking.selectedBarber || !selectedDate || !selectedTime) {
            toast.error('Lütfen tüm alanları doldurun');
            return;
        }

        const duration = personCount * 30;

        try {
            await createBooking(booking.selectedBarber.id, selectedDate, selectedTime, notes, duration);
            toast.success('Randevu başarıyla oluşturuldu!');
            setShowBookingForm(false);
            selectBarber(null);
            setPersonCount(1);
            fetchMyBookings();
        } catch (err) {
            toast.error(handleError(err));
        }
    }, [booking.selectedBarber, selectedDate, selectedTime, personCount, notes, createBooking, selectBarber, fetchMyBookings, handleError]);

    const handleCancelBooking = useCallback((bookingId: string) => {
        setConfirmModal({ isOpen: true, bookingId });
    }, []);

    const confirmCancelBooking = useCallback(async () => {
        if (!confirmModal.bookingId) return;

        try {
            await cancelBooking(confirmModal.bookingId);
            toast.success('Randevu iptal edildi');
            await fetchMyBookings();

            if (booking.selectedBarber && selectedDate) {
                await fetchAvailableSlots(booking.selectedBarber.id, selectedDate);
            }
        } catch (err) {
            toast.error(handleError(err));
        } finally {
            setConfirmModal({ isOpen: false, bookingId: null });
        }
    }, [confirmModal.bookingId, cancelBooking, fetchMyBookings, booking.selectedBarber, selectedDate, fetchAvailableSlots, handleError]);

    const closeBookingForm = useCallback(() => {
        setShowBookingForm(false);
        selectBarber(null);
    }, [selectBarber]);

    return {
        // State
        booking,
        authState,
        selectedDate,
        selectedTime,
        notes,
        personCount,
        showBookingForm,
        activeTab,
        confirmModal,
        filterStatus,
        filteredBookings,
        minDate,

        // Setters
        setSelectedDate,
        setSelectedTime,
        setNotes,
        setPersonCount,
        setActiveTab,
        setConfirmModal,
        setFilterStatus,

        // Handlers
        handleBarberSelect,
        handleDateChange,
        handleBookingSubmit,
        handleCancelBooking,
        confirmCancelBooking,
        closeBookingForm,
    };
}
