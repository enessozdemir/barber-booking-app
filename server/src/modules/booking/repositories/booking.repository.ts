import { supabase } from "../../../config/supabase";

export class BookingRepository {
    async findBookingsByBarberAndDate(barberId: string, date: string, statuses: string[]) {
        const { data, error } = await supabase
            .from("bookings")
            .select("start_time, end_time, status")
            .eq("barber_id", barberId)
            .eq("date", date)
            .in("status", statuses);

        if (error) throw error;
        return data;
    }

    async findCustomerBookings(customerId: string, date: string, statuses: string[]) {
        const { data, error } = await supabase
            .from("bookings")
            .select("id, start_time, end_time, barbers!inner(users!inner(full_name))")
            .eq("customer_id", customerId)
            .eq("date", date)
            .in("status", statuses);

        if (error) throw error;
        return data;
    }

    async findOverlappingBookings(barberId: string, date: string, startTime: string, endTime: string, statuses: string[]) {
        const { data, error } = await supabase
            .from("bookings")
            .select("id")
            .eq("barber_id", barberId)
            .eq("date", date)
            .in("status", statuses)
            .lt("start_time", endTime)
            .gt("end_time", startTime);

        if (error) throw error;
        return data;
    }

    async deleteCancelledBooking(barberId: string, date: string, startTime: string) {
        const { error } = await supabase
            .from("bookings")
            .delete()
            .eq("barber_id", barberId)
            .eq("date", date)
            .eq("start_time", startTime)
            .eq("status", "cancelled");

        if (error) throw error;
    }

    async createBooking(bookingData: any) {
        const { data, error } = await supabase
            .from("bookings")
            .insert(bookingData)
            .select(`
        *,
        barbers!inner (
          id,
          users!inner (
            full_name
          )
        )
      `)
            .single();

        if (error) throw error;
        return data;
    }

    async findUserBookings(userId: string) {
        const { data, error } = await supabase
            .from("bookings")
            .select(`
        *,
        barbers!inner (
          id,
          users!inner (
            full_name,
            phone
          )
        )
      `)
            .eq("customer_id", userId)
            .order("date", { ascending: false })
            .order("start_time", { ascending: false });

        if (error) throw error;
        return data;
    }

    async findBarberBookings(barberId: string, date?: string) {
        let query = supabase
            .from("bookings")
            .select(`
        *,
        customer:users!customer_id (
          full_name,
          phone
        )
      `)
            .eq("barber_id", barberId);

        if (date) {
            query = query.eq("date", date);
        }

        query = query.order("date", { ascending: true }).order("start_time", { ascending: true });

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    async findBookingById(bookingId: string) {
        const { data, error } = await supabase
            .from("bookings")
            .select("barber_id, customer_id, status, date, id") // Added fields needed for checks
            .eq("id", bookingId)
            .single();

        if (error) return null;
        return data;
    }

    async updateBookingStatus(bookingId: string, status: string) {
        const { data, error } = await supabase
            .from("bookings")
            .update({ status })
            .eq("id", bookingId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateBookingPrice(bookingId: string, price: number) {
        const { data, error } = await supabase
            .from("bookings")
            .update({ price })
            .eq("id", bookingId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async findExistingBookingForReschedule(barberId: string, date: string, startTime: string, excludeBookingId: string) {
        const { data, error } = await supabase
            .from("bookings")
            .select("id")
            .eq("barber_id", barberId)
            .eq("date", date)
            .eq("start_time", startTime)
            .neq("status", "cancelled")
            .in("status", ["pending", "completed"])
            .neq("id", excludeBookingId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async updateBookingTime(bookingId: string, date: string, startTime: string, endTime: string) {
        const { data, error } = await supabase
            .from("bookings")
            .update({
                date,
                start_time: startTime,
                end_time: endTime,
            })
            .eq("id", bookingId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteBooking(bookingId: string) {
        const { error } = await supabase
            .from("bookings")
            .delete()
            .eq("id", bookingId);

        if (error) throw error;
    }
}

export default new BookingRepository();
