import { supabase } from '../../../config/supabase';

export interface Expense {
    id: string;
    barber_id: string | null;
    amount: number;
    date: string;
    category: string;
    description: string;
    type: 'personal' | 'business';
    created_at: string;
    updated_at: string;
}

export interface CreateExpenseDTO {
    barber_id?: string;
    amount: number;
    date: string;
    category: string;
    description: string;
    type: 'personal' | 'business';
}

export interface UpdateExpenseDTO {
    amount?: number;
    category?: string;
    description?: string;
    type?: 'personal' | 'business';
}

class ExpensesRepository {
    /**
     * Create a new expense record
     */
    async create(data: CreateExpenseDTO): Promise<Expense> {
        const { data: expense, error } = await supabase
            .from('expenses')
            .insert({
                barber_id: data.barber_id || null,
                amount: data.amount,
                date: data.date,
                category: data.category,
                description: data.description,
                type: data.type,
            })
            .select()
            .single();

        if (error) throw error;
        return expense;
    }

    /**
     * Get expenses by barber and date
     */
    async getByBarberAndDate(barberId: string, date: string): Promise<Expense[]> {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('barber_id', barberId)
            .eq('date', date)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Get expenses by barber and date range
     */
    async getByBarberAndDateRange(
        barberId: string,
        startDate: string,
        endDate: string
    ): Promise<Expense[]> {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('barber_id', barberId)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    /**
     * Get business expenses by date
     */
    async getBusinessByDate(date: string): Promise<Expense[]> {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('type', 'business')
            .eq('date', date)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Get business expenses by date range
     */
    async getBusinessByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('type', 'business')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    /**
     * Update an expense
     */
    async update(id: string, data: UpdateExpenseDTO): Promise<Expense> {
        const { data: expense, error } = await supabase
            .from('expenses')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return expense;
    }

    /**
     * Delete an expense
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) throw error;
    }

    /**
     * Get expense by ID
     */
    async getById(id: string): Promise<Expense | null> {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }
}

export default new ExpensesRepository();
