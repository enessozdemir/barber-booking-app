export interface BookingSlot {
    time: string;
    available: boolean;
    status?: string | null;
    span?: number;
    isStart?: boolean;
}

export interface Booking {
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
