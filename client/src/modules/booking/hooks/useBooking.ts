import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import {
    setBarbers,
    setSelectedBarber,
    setAvailableSlots,
    setMyBookings,
    setLoading,
    setError,
    clearBookingState,
} from '../store/bookingSlice';
import axios from 'axios';

// Import Barber type from the slice
type Barber = {
    id: string;
    active: boolean;
    rating: number;
    created_at: string;
    users: {
        id: string;
        full_name: string;
        phone: string;
        email: string;
    };
};

export function useBooking() {
    const dispatch = useDispatch();
    const booking = useSelector((state: RootState) => state.booking);

    const fetchBarbers = async () => {
        try {
            dispatch(setLoading(true));
            const res = await axios.get('/barbers');
            dispatch(setBarbers(res.data.barbers));
        } catch (error) {
            console.error('Failed to fetch barbers:', error);
            dispatch(setError('Berberler yüklenemedi'));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const selectBarber = (barber: Barber | null) => {
        dispatch(setSelectedBarber(barber));
    };

    const fetchAvailableSlots = async (barberId: string, date: string) => {
        try {
            dispatch(setLoading(true));
            const res = await axios.get('/bookings/available-slots', {
                params: { barberId, date },
            });
            dispatch(setAvailableSlots(res.data.slots));
        } catch (error) {
            console.error('Failed to fetch slots:', error);
            dispatch(setError('Müsait saatler yüklenemedi'));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const createBooking = async (
        barberId: string,
        date: string,
        startTime: string,
        notes?: string
    ) => {
        const res = await axios.post('/bookings', {
            barberId,
            date,
            startTime,
            notes,
        });
        return res.data;
    };

    const fetchMyBookings = async () => {
        try {
            dispatch(setLoading(true));
            const res = await axios.get('/bookings/my-bookings');
            dispatch(setMyBookings(res.data.bookings));
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            dispatch(setError('Randevular yüklenemedi'));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const cancelBooking = async (bookingId: string) => {
        const res = await axios.patch(`/bookings/${bookingId}/cancel`);
        return res.data;
    };

    const clearState = () => {
        dispatch(clearBookingState());
    };

    return {
        booking,
        fetchBarbers,
        selectBarber,
        fetchAvailableSlots,
        createBooking,
        fetchMyBookings,
        cancelBooking,
        clearState,
    };
}
