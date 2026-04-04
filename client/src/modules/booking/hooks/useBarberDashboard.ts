import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { setBarberBookings, setLoading } from '../store/bookingSlice';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useErrorHandler } from '../../../shared/hooks/useErrorHandler';
import { getCurrentDateString, generateTimeSlots } from '../../../shared/utils/timeSlots';

interface Booking {
    id: string;
    customer_id: string;
    barber_id: string;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    note?: string;
    price?: number;
    created_at: string;
    customer?: {
        full_name: string;
        phone: string;
    };
}

export function useBarberDashboard() {
    const dispatch = useDispatch();
    const { handleError } = useErrorHandler();
    const user = useSelector((state: RootState) => state.auth.user);
    const bookings = useSelector((state: RootState) => state.booking.barberBookings);
    const loading = useSelector((state: RootState) => state.booking.loading);

    const [selectedDate, setSelectedDate] = useState(getCurrentDateString());
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [price, setPrice] = useState('');
    const [status, setStatus] = useState('pending');
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        bookingId: string | null;
    }>({ isOpen: false, bookingId: null });

    const fetchSchedule = useCallback(async (date: string) => {
        try {
            dispatch(setLoading(true));
            const res = await axios.get('/bookings/barber/schedule', { params: { date } });
            dispatch(setBarberBookings(res.data.bookings));
        } catch (err) {
            toast.error(handleError(err));
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch, handleError]);

    useEffect(() => {
        fetchSchedule(selectedDate);
    }, [fetchSchedule, selectedDate]);

    // Memoized time slots
    const allSlots = useMemo(() => generateTimeSlots(), []);

    const handleSlotClick = useCallback((booking: Booking | undefined) => {
        if (!booking) return;
        setSelectedBooking(booking);
        setPrice(booking.price != null ? String(Math.round(booking.price)) : '');
        setStatus(booking.status);
        setShowModal(true);
    }, []);

    const handleDeleteBooking = useCallback(async () => {
        if (!confirmModal.bookingId) return;

        try {
            await axios.delete(`/bookings/${confirmModal.bookingId}`);
            toast.success('Randevu silindi');
            fetchSchedule(selectedDate);
            setConfirmModal({ isOpen: false, bookingId: null });
            setSelectedBooking(null);
            setShowModal(false);
        } catch (err) {
            toast.error(handleError(err));
        }
    }, [confirmModal.bookingId, fetchSchedule, selectedDate, handleError]);

    const handleUpdateBooking = useCallback(async () => {
        if (!selectedBooking) return;

        // Validation: Price is mandatory for completed bookings
        if (status === 'completed' && (!price || parseFloat(price) <= 0)) {
            toast.error('Tamamlanan randevular için fiyat girmek zorunludur');
            return;
        }

        try {
            await axios.patch(`/bookings/${selectedBooking.id}/status`, { status });

            // Only update price if status is completed
            if (status === 'completed' && price && parseFloat(price) > 0) {
                await axios.patch(`/bookings/${selectedBooking.id}/price`, {
                    price: Math.round(parseFloat(price)),
                });
            }

            toast.success('Randevu güncellendi');
            fetchSchedule(selectedDate);
            setShowModal(false);
        } catch (err) {
            toast.error(handleError(err));
        }
    }, [selectedBooking, status, price, fetchSchedule, selectedDate, handleError]);

    const closeModal = useCallback(() => {
        setShowModal(false);
    }, []);

    const openDeleteConfirm = useCallback((bookingId: string) => {
        setShowModal(false);
        setConfirmModal({ isOpen: true, bookingId });
    }, []);

    const closeDeleteConfirm = useCallback(() => {
        setConfirmModal({ isOpen: false, bookingId: null });
    }, []);

    return {
        // State
        user,
        bookings,
        loading,
        selectedDate,
        selectedBooking,
        showModal,
        price,
        status,
        confirmModal,
        allSlots,

        // Setters
        setSelectedDate,
        setPrice,
        setStatus,

        // Handlers
        handleSlotClick,
        handleDeleteBooking,
        handleUpdateBooking,
        closeModal,
        openDeleteConfirm,
        closeDeleteConfirm,
        fetchSchedule,
    };
}
