import { supabase } from '../../../config/supabase';

export interface Earning {
    id: string;
    barber_id: string;
    booking_id: string | null;
    amount: number;
    date: string;
    type: 'booking' | 'walk_in';
    note: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateEarningDTO {
    barber_id: string;
    booking_id?: string;
    amount: number;
    date: string;
    type: 'booking' | 'walk_in';
    note?: string;
}

export interface EarningWithBarber extends Earning {
    barbers?: {
        users: {
            full_name: string;
        };
    };
}

class EarningsRepository {
    /**
     * Create a new earning record
     */
    async create(data: CreateEarningDTO): Promise<Earning> {
        const { data: earning, error } = await supabase
            .from('earnings')
            .insert({
                barber_id: data.barber_id,
                booking_id: data.booking_id || null,
                amount: data.amount,
                date: data.date,
                type: data.type,
                note: data.note || null,
            })
            .select()
            .single();

        if (error) throw error;
        return earning;
    }

    /**
     * Upsert earning by booking_id (update if exists, create if not)
     */
    async upsertByBookingId(data: CreateEarningDTO): Promise<Earning> {
        // First, try to find existing earning for this booking
        if (data.booking_id) {
            const { data: existing } = await supabase
                .from('earnings')
                .select('*')
                .eq('booking_id', data.booking_id)
                .single();

            if (existing) {
                // Update existing record
                const { data: updated, error } = await supabase
                    .from('earnings')
                    .update({
                        amount: data.amount,
                        date: data.date,
                        note: data.note || null,
                    })
                    .eq('id', existing.id)
                    .select()
                    .single();

                if (error) throw error;
                return updated;
            }
        }

        // No existing record, create new one
        return this.create(data);
    }

    /**
     * Get earnings by barber and date
     */
    async getByBarberAndDate(barberId: string, date: string): Promise<Earning[]> {
        const { data, error } = await supabase
            .from('earnings')
            .select('*')
            .eq('barber_id', barberId)
            .eq('date', date)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Get earnings by barber and date range
     */
    async getByBarberAndDateRange(
        barberId: string,
        startDate: string,
        endDate: string
    ): Promise<Earning[]> {
        const { data, error } = await supabase
            .from('earnings')
            .select('*')
            .eq('barber_id', barberId)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    /**
     * Get all earnings for a specific date (all barbers)
     */
    async getAllByDate(date: string): Promise<EarningWithBarber[]> {
        const { data, error } = await supabase
            .from('earnings')
            .select(`
        *,
        barbers (
          users (
            full_name
          )
        )
      `)
            .eq('date', date)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async createWalkIn(barberId: string, amount: number, date: string, note?: string) {
        const { data, error } = await supabase
            .from('earnings')
            .insert({
                barber_id: barberId,
                amount,
                date,
                note,
                type: 'walk_in'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateEarning(id: string, updates: { amount?: number; note?: string; date?: string }) {
        const { data, error } = await supabase
            .from('earnings')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Get earning by ID
     */
    async getById(id: string): Promise<Earning | null> {
        const { data, error } = await supabase
            .from('earnings')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return data;
    }

    /**
     * Get all earnings for a date range (all barbers)
     */
    async getAllByDateRange(startDate: string, endDate: string): Promise<EarningWithBarber[]> {
        const { data, error } = await supabase
            .from('earnings')
            .select(`
        *,
        barbers (
          users (
            full_name
          )
        )
      `)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    /**
     * Get total earnings by barber and date
     */
    async getTotalByBarberAndDate(barberId: string, date: string): Promise<number> {
        const earnings = await this.getByBarberAndDate(barberId, date);
        return earnings.reduce((sum, e) => sum + Number(e.amount), 0);
    }

    /**
     * Get total earnings by barber and date range
     */
    async getTotalByBarberAndDateRange(
        barberId: string,
        startDate: string,
        endDate: string
    ): Promise<number> {
        const earnings = await this.getByBarberAndDateRange(barberId, startDate, endDate);
        return earnings.reduce((sum, e) => sum + Number(e.amount), 0);
    }

    /**
     * Delete an earning
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase.from('earnings').delete().eq('id', id);
        if (error) throw error;
    }

    /**
     * Delete earning by booking_id
     */
    async deleteByBookingId(bookingId: string): Promise<void> {
        const { error } = await supabase.from('earnings').delete().eq('booking_id', bookingId);
        if (error) throw error;
    }
}

export default new EarningsRepository();
