import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Barber } from '../../../types/barber';
import type { Booking, BookingSlot as TimeSlot } from '../../../types/booking';

interface BookingState {
    barbers: Barber[];
    selectedBarber: Barber | null;
    availableSlots: TimeSlot[];
    myBookings: Booking[];
    barberBookings: Booking[];
    loading: boolean;
    error: string | null;
}

const initialState: BookingState = {
    barbers: [],
    selectedBarber: null,
    availableSlots: [],
    myBookings: [],
    barberBookings: [],
    loading: false,
    error: null,
};

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        setBarbers: (state, action: PayloadAction<Barber[]>) => {
            state.barbers = action.payload;
        },
        setSelectedBarber: (state, action: PayloadAction<Barber | null>) => {
            state.selectedBarber = action.payload;
        },
        setAvailableSlots: (state, action: PayloadAction<TimeSlot[]>) => {
            state.availableSlots = action.payload;
        },
        setMyBookings: (state, action: PayloadAction<Booking[]>) => {
            state.myBookings = action.payload;
        },
        setBarberBookings: (state, action: PayloadAction<Booking[]>) => {
            state.barberBookings = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        addBooking: (state, action: PayloadAction<Booking>) => {
            state.myBookings.unshift(action.payload);
        },
        clearBookingState: (state) => {
            state.selectedBarber = null;
            state.availableSlots = [];
            state.error = null;
        },
    },
});

export const {
    setBarbers,
    setSelectedBarber,
    setAvailableSlots,
    setMyBookings,
    setBarberBookings,
    setLoading,
    setError,
    addBooking,
    clearBookingState,
} = bookingSlice.actions;

export default bookingSlice.reducer;
