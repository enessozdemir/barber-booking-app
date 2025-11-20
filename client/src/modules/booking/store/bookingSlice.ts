import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Barber {
    id: string;
    active: boolean;
    created_at: string;
    avatar_url?: string | null;
    users: {
        id: string;
        full_name: string;
        phone: string;
        email: string;
    };
}

interface TimeSlot {
    time: string;
    available: boolean;
    status?: string | null;
}

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
    barbers?: {
        id: string;
        users: {
            full_name: string;
            phone: string;
        };
    };
    customer?: {
        full_name: string;
        phone: string;
    };
}

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
    clearBookingState,
} = bookingSlice.actions;

export default bookingSlice.reducer;
