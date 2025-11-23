import earningsRepository, { CreateEarningDTO, Earning, EarningWithBarber } from '../repositories/earnings.repository';

export interface DailyEarningSummary {
    total: number;
    bookings: number;
    walkIns: number;
    items: Earning[];
}

export interface MonthlyEarningSummary {
    total: number;
    byDay: { date: string; amount: number }[];
    items: Earning[];
}

export interface YearlyEarningSummary {
    total: number;
    byMonth: { month: number; amount: number }[];
    items: Earning[];
}

export interface BusinessDailySummary {
    total: number;
    byBarber: { barberId: string; name: string; amount: number }[];
}

class EarningsService {
    /**
     * Create a walk-in earning
     */
    async createWalkIn(barberId: string, amount: number, date: string, note?: string): Promise<Earning> {
        return await earningsRepository.createWalkIn(barberId, amount, date, note);
    }

    async updateEarning(id: string, updates: { amount?: number; note?: string; date?: string }) {
        return await earningsRepository.updateEarning(id, updates);
    }

    /**
     * Get daily earning summary for a barber
     */
    async getDailySummary(barberId: string, date: string): Promise<DailyEarningSummary> {
        const items = await earningsRepository.getByBarberAndDate(barberId, date);

        const total = items.reduce((sum, e) => sum + Number(e.amount), 0);
        const bookings = items.filter(e => e.type === 'booking').reduce((sum, e) => sum + Number(e.amount), 0);
        const walkIns = items.filter(e => e.type === 'walk_in').reduce((sum, e) => sum + Number(e.amount), 0);

        return { total, bookings, walkIns, items };
    }

    /**
     * Get monthly earning summary for a barber
     */
    async getMonthlySummary(barberId: string, year: number, month: number): Promise<MonthlyEarningSummary> {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const items = await earningsRepository.getByBarberAndDateRange(barberId, startDate, endDate);

        const total = items.reduce((sum, e) => sum + Number(e.amount), 0);

        // Group by day
        const byDayMap = new Map<string, number>();
        items.forEach(e => {
            const current = byDayMap.get(e.date) || 0;
            byDayMap.set(e.date, current + Number(e.amount));
        });

        const byDay = Array.from(byDayMap.entries()).map(([date, amount]) => ({ date, amount }));

        return { total, byDay, items };
    }

    /**
     * Get yearly earning summary for a barber
     */
    async getYearlySummary(barberId: string, year: number): Promise<YearlyEarningSummary> {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const items = await earningsRepository.getByBarberAndDateRange(barberId, startDate, endDate);

        const total = items.reduce((sum, e) => sum + Number(e.amount), 0);

        // Group by month
        const byMonthMap = new Map<number, number>();
        items.forEach(e => {
            const month = parseInt(e.date.split('-')[1], 10);
            const current = byMonthMap.get(month) || 0;
            byMonthMap.set(month, current + Number(e.amount));
        });

        const byMonth = Array.from(byMonthMap.entries()).map(([month, amount]) => ({ month, amount }));

        return { total, byMonth, items };
    }

    /**
     * Get business daily summary (all barbers)
     */
    async getBusinessDailySummary(date: string): Promise<BusinessDailySummary> {
        const items = await earningsRepository.getAllByDate(date);

        const total = items.reduce((sum, e) => sum + Number(e.amount), 0);

        // Group by barber
        const byBarberMap = new Map<string, { name: string; amount: number }>();
        items.forEach(e => {
            const name = e.barbers?.users?.full_name || 'Unknown';
            const current = byBarberMap.get(e.barber_id);
            if (current) {
                current.amount += Number(e.amount);
            } else {
                byBarberMap.set(e.barber_id, { name, amount: Number(e.amount) });
            }
        });

        const byBarber = Array.from(byBarberMap.entries()).map(([barberId, data]) => ({
            barberId,
            name: data.name,
            amount: data.amount,
        }));

        return { total, byBarber };
    }

    /**
     * Get all business earnings for a date
     */
    async getBusinessEarnings(date: string): Promise<EarningWithBarber[]> {
        return await earningsRepository.getAllByDate(date);
    }

    /**
     * Get business monthly summary (all barbers)
     */
    async getBusinessMonthlySummary(year: number, month: number): Promise<BusinessDailySummary & { byDay: { date: string; amount: number }[] }> {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const items = await earningsRepository.getAllByDateRange(startDate, endDate);

        const total = items.reduce((sum, e) => sum + Number(e.amount), 0);

        // Group by barber
        const byBarberMap = new Map<string, { name: string; amount: number }>();
        // Group by day
        const byDayMap = new Map<string, number>();

        items.forEach(e => {
            // Barber grouping
            const name = e.barbers?.users?.full_name || 'Unknown';
            const currentBarber = byBarberMap.get(e.barber_id);
            if (currentBarber) {
                currentBarber.amount += Number(e.amount);
            } else {
                byBarberMap.set(e.barber_id, { name, amount: Number(e.amount) });
            }

            // Day grouping
            const currentDay = byDayMap.get(e.date) || 0;
            byDayMap.set(e.date, currentDay + Number(e.amount));
        });

        const byBarber = Array.from(byBarberMap.entries()).map(([barberId, data]) => ({
            barberId,
            name: data.name,
            amount: data.amount,
        }));

        const byDay = Array.from(byDayMap.entries()).map(([date, amount]) => ({ date, amount }));

        return { total, byBarber, byDay };
    }

    /**
     * Get business yearly summary (all barbers)
     */
    async getBusinessYearlySummary(year: number): Promise<BusinessDailySummary & { byMonth: { month: number; amount: number }[] }> {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const items = await earningsRepository.getAllByDateRange(startDate, endDate);

        const total = items.reduce((sum, e) => sum + Number(e.amount), 0);

        // Group by barber
        const byBarberMap = new Map<string, { name: string; amount: number }>();
        // Group by month
        const byMonthMap = new Map<number, number>();

        items.forEach(e => {
            // Barber grouping
            const name = e.barbers?.users?.full_name || 'Unknown';
            const currentBarber = byBarberMap.get(e.barber_id);
            if (currentBarber) {
                currentBarber.amount += Number(e.amount);
            } else {
                byBarberMap.set(e.barber_id, { name, amount: Number(e.amount) });
            }

            // Month grouping
            const month = parseInt(e.date.split('-')[1], 10);
            const currentMonth = byMonthMap.get(month) || 0;
            byMonthMap.set(month, currentMonth + Number(e.amount));
        });

        const byBarber = Array.from(byBarberMap.entries()).map(([barberId, data]) => ({
            barberId,
            name: data.name,
            amount: data.amount,
        }));

        const byMonth = Array.from(byMonthMap.entries()).map(([month, amount]) => ({ month, amount }));

        return { total, byBarber, byMonth };
    }
}

export default new EarningsService();
