import { supabase } from "../../../config/supabase";

export class DailyEarningsRepository {
    async createEarning(earningData: any) {
        const { data, error } = await supabase
            .from("daily_earnings")
            .insert(earningData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async findEarningsByBarber(barberId: string, date?: string) {
        let query = supabase
            .from("daily_earnings")
            .select("*")
            .eq("barber_id", barberId);

        if (date) {
            query = query.eq("date", date);
        }

        query = query.order("date", { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    async findEarningsByBarberAndDateRange(barberId: string, startDate: string, endDate: string) {
        const { data, error } = await supabase
            .from("daily_earnings")
            .select("amount")
            .eq("barber_id", barberId)
            .gte("date", startDate)
            .lte("date", endDate);

        if (error) throw error;
        return data;
    }
}

export default new DailyEarningsRepository();
