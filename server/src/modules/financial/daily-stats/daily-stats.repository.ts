import { supabase } from "../../../config/supabase";

export interface DailyStats {
    date: string;
    pos_amount: number;
    created_at?: string;
    updated_at?: string;
}

class DailyStatsRepository {
    async upsert(stats: DailyStats): Promise<DailyStats> {
        const { data, error } = await supabase
            .from('daily_stats')
            .upsert(stats, { onConflict: 'date' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getByDate(date: string): Promise<DailyStats | null> {
        const { data, error } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('date', date)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
        return data;
    }

    async getByDateRange(startDate: string, endDate: string): Promise<DailyStats[]> {
        const { data, error } = await supabase
            .from('daily_stats')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate);

        if (error) throw error;
        return data || [];
    }

    async getYearlyStats(year: number): Promise<DailyStats[]> {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const { data, error } = await supabase
            .from('daily_stats')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate);

        if (error) throw error;
        return data || [];
    }
}

export default new DailyStatsRepository();
