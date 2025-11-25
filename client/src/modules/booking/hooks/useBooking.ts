import { useCallback } from 'react';
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
    addBooking,
} from '../store/bookingSlice';
import axios from 'axios';

import type { Barber } from '../../../types/barber';

export function useBooking() {
    const dispatch = useDispatch();
    const booking = useSelector((state: RootState) => state.booking);

    const fetchBarbers = useCallback(async () => {
        try {
            dispatch(setLoading(true));
            const res = await axios.get('/barbers');
            dispatch(setBarbers(res.data.barbers));
        } catch {
            dispatch(setError('Berberler yüklenemedi'));
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const selectBarber = useCallback((barber: Barber | null) => {
        dispatch(setSelectedBarber(barber));
    }, [dispatch]);

    const fetchAvailableSlots = useCallback(async (barberId: string, date: string) => {
        try {
            const res = await axios.get('/bookings/available-slots', {
                params: { barberId, date },
            });
            dispatch(setAvailableSlots(res.data.slots));
        } catch {
            dispatch(setError('Müsait saatler yüklenemedi'));
        }
    }, [dispatch]);

    const createBooking = useCallback(async (barberId: string, date: string, startTime: string, note?: string, duration: number = 30) => {
        dispatch(setLoading(true));
        try {
            const res = await axios.post('/bookings', { barberId, date, startTime, note, duration });
            dispatch(addBooking(res.data.booking));
            return res.data.booking;
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const fetchMyBookings = useCallback(async () => {
        try {
            dispatch(setLoading(true));
            const res = await axios.get('/bookings/my-bookings');
            dispatch(setMyBookings(res.data.bookings));
        } catch {
            dispatch(setError('Randevular yüklenemedi'));
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const cancelBooking = useCallback(async (bookingId: string) => {
        const res = await axios.patch(`/bookings/${bookingId}/cancel`);
        return res.data;
    }, []);

    const clearState = useCallback(() => {
        dispatch(clearBookingState());
    }, [dispatch]);

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
