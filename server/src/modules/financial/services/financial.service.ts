import earningsService from '../../earnings/services/earnings.service';
import expensesService from '../../expenses/services/expenses.service';

export interface DailyFinancialSummary {
    date: string;
    earnings: number;
    expenses: number;
    profit: number;
}

export interface MonthlyFinancialSummary {
    year: number;
    month: number;
    earnings: number;
    expenses: number;
    profit: number;
    byDay: DailyFinancialSummary[];
}

export interface YearlyFinancialSummary {
    year: number;
    earnings: number;
    expenses: number;
    profit: number;
    byMonth: { month: number; earnings: number; expenses: number; profit: number }[];
}

class FinancialService {
    /**
     * Get daily financial summary for a barber
     */
    async getDailySummary(barberId: string, date: string): Promise<DailyFinancialSummary> {
        const earningsSummary = await earningsService.getDailySummary(barberId, date);
        const expensesSummary = await expensesService.getDailySummary(barberId, date);

        const earnings = earningsSummary.total;
        const expenses = expensesSummary.total;
        const profit = earnings - expenses;

        return { date, earnings, expenses, profit };
    }

    /**
     * Get monthly financial summary for a barber
     */
    async getMonthlySummary(barberId: string, year: number, month: number): Promise<MonthlyFinancialSummary> {
        const earningsSummary = await earningsService.getMonthlySummary(barberId, year, month);
        const expensesSummary = await expensesService.getMonthlySummary(barberId, year, month);

        const earnings = earningsSummary.total;
        const expenses = expensesSummary.total;
        const profit = earnings - expenses;

        // Calculate by day
        const earningsByDay = new Map<string, number>();
        earningsSummary.byDay.forEach(d => earningsByDay.set(d.date, d.amount));

        const expensesByDay = new Map<string, number>();
        expensesSummary.items.forEach(e => {
            const current = expensesByDay.get(e.date) || 0;
            expensesByDay.set(e.date, current + Number(e.amount));
        });

        const allDates = new Set([...earningsByDay.keys(), ...expensesByDay.keys()]);
        const byDay: DailyFinancialSummary[] = Array.from(allDates).map(date => ({
            date,
            earnings: earningsByDay.get(date) || 0,
            expenses: expensesByDay.get(date) || 0,
            profit: (earningsByDay.get(date) || 0) - (expensesByDay.get(date) || 0),
        })).sort((a, b) => a.date.localeCompare(b.date));

        return { year, month, earnings, expenses, profit, byDay };
    }

    /**
     * Get yearly financial summary for a barber
     */
    async getYearlySummary(barberId: string, year: number): Promise<YearlyFinancialSummary> {
        const earningsSummary = await earningsService.getYearlySummary(barberId, year);
        const expensesSummary = await expensesService.getYearlySummary(barberId, year);

        const earnings = earningsSummary.total;
        const expenses = expensesSummary.total;
        const profit = earnings - expenses;

        // Calculate by month
        const earningsByMonth = new Map<number, number>();
        earningsSummary.byMonth.forEach(m => earningsByMonth.set(m.month, m.amount));

        const expensesByMonth = new Map<number, number>();
        expensesSummary.items.forEach(e => {
            const month = parseInt(e.date.split('-')[1], 10);
            const current = expensesByMonth.get(month) || 0;
            expensesByMonth.set(month, current + Number(e.amount));
        });

        const byMonth = [];
        for (let m = 1; m <= 12; m++) {
            const monthEarnings = earningsByMonth.get(m) || 0;
            const monthExpenses = expensesByMonth.get(m) || 0;
            byMonth.push({
                month: m,
                earnings: monthEarnings,
                expenses: monthExpenses,
                profit: monthEarnings - monthExpenses,
            });
        }

        return { year, earnings, expenses, profit, byMonth };
    }
}

export default new FinancialService();
