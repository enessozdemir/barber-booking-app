import earningsService from '../../earnings/services/earnings.service';
import expensesService from '../../expenses/services/expenses.service';
import dailyStatsService from '../daily-stats/daily-stats.service';

export interface DailyFinancialSummary {
    date: string;
    earnings: {
        total: number;
        cash: number;
        creditCard: number;
        count: number;
    };
    expenses: {
        total: number;
        personal: number;
        business: number;
        count: number;
    };
    netProfit: number;
}

export interface MonthlyFinancialSummary {
    year: number;
    month: number;
    earnings: number;
    expenses: number;
    profit: number;
    byDay: Array<{ date: string; earnings: number; expenses: number; profit: number; cash: number; creditCard: number }>;
    items?: any[]; // Expense items for detailed tracking
    cash: number;
    creditCard: number;
}

export interface YearlyFinancialSummary {
    year: number;
    earnings: number;
    expenses: number;
    profit: number;
    byMonth: { month: number; earnings: number; expenses: number; profit: number; cash: number; creditCard: number }[];
    cash: number;
    creditCard: number;
}

class FinancialService {
    /**
     * Get daily financial summary for a barber
     */
    async getDailySummary(barberId: string, date: string): Promise<DailyFinancialSummary> {
        const earningsSummary = await earningsService.getDailySummary(barberId, date);
        const expensesSummary = await expensesService.getDailySummary(barberId, date);

        const earningsTotal = earningsSummary.total;
        const expensesTotal = expensesSummary.total;

        // Calculate expenses breakdown by type
        const personalExpenses = expensesSummary.items
            .filter(e => e.type === 'personal')
            .reduce((sum, e) => sum + Number(e.amount), 0);
        const businessExpenses = expensesSummary.items
            .filter(e => e.type === 'business')
            .reduce((sum, e) => sum + Number(e.amount), 0);

        return {
            date,
            earnings: {
                total: earningsTotal,
                cash: 0, // Not tracked separately yet
                creditCard: 0, // Not tracked separately yet
                count: earningsSummary.items.length,
            },
            expenses: {
                total: expensesTotal,
                personal: personalExpenses,
                business: businessExpenses,
                count: expensesSummary.items.length,
            },
            netProfit: earningsTotal, // For personal view, profit = earnings (expenses not deducted)
        };
    }

    /**
     * Get monthly financial summary for a barber
     */
    async getMonthlySummary(barberId: string, year: number, month: number): Promise<MonthlyFinancialSummary> {
        const earningsSummary = await earningsService.getMonthlySummary(barberId, year, month);
        const expensesSummary = await expensesService.getMonthlySummary(barberId, year, month);

        const earnings = earningsSummary.total;
        const expenses = expensesSummary.total;
        const profit = earnings; // For personal view, profit = earnings (expenses not deducted)

        // Calculate by day
        const earningsByDay = new Map<string, number>();
        earningsSummary.byDay.forEach(d => earningsByDay.set(d.date, d.amount));

        const expensesByDay = new Map<string, number>();
        expensesSummary.items.forEach(e => {
            const current = expensesByDay.get(e.date) || 0;
            expensesByDay.set(e.date, current + Number(e.amount));
        });

        const allDates = new Set([...earningsByDay.keys(), ...expensesByDay.keys()]);
        const byDay = Array.from(allDates).map(date => {
            const earnings = earningsByDay.get(date) || 0;
            return {
                date,
                earnings,
                expenses: expensesByDay.get(date) || 0,
                profit: earnings, // For personal view, profit = earnings only
                cash: earnings, // Personal summary assumes all cash for now
                creditCard: 0
            };
        }).sort((a, b) => a.date.localeCompare(b.date));

        return {
            year,
            month,
            earnings,
            expenses,
            profit,
            byDay,
            cash: earnings,
            creditCard: 0
        };
    }

    /**
     * Get yearly financial summary for a barber
     */
    async getYearlySummary(barberId: string, year: number): Promise<YearlyFinancialSummary> {
        const earningsSummary = await earningsService.getYearlySummary(barberId, year);
        const expensesSummary = await expensesService.getYearlySummary(barberId, year);

        const earnings = earningsSummary.total;
        const expenses = expensesSummary.total;
        const profit = earnings; // For personal view, profit = earnings (expenses not deducted)

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
                profit: monthEarnings, // For personal view, profit = earnings only
                cash: monthEarnings,
                creditCard: 0
            });
        }

        return {
            year,
            earnings,
            expenses,
            profit,
            byMonth,
            cash: earnings,
            creditCard: 0
        };
    }
    /**
     * Get business daily financial summary
     */
    async getBusinessDailySummary(date: string): Promise<DailyFinancialSummary> {
        const earningsSummary = await earningsService.getBusinessDailySummary(date);
        const expensesSummary = await expensesService.getBusinessDailySummary(date);
        const dailyStats = await dailyStatsService.getDailyStats(date);

        const earnings = earningsSummary.total;
        const posAmount = dailyStats ? Number(dailyStats.pos_amount) : 0;
        const cashAmount = earnings - posAmount;

        const expenses = expensesSummary.total;
        const profit = earnings - expenses;

        return {
            date, // Added date to match interface
            earnings: { // Wrapped earnings in object to match interface
                total: earnings,
                cash: cashAmount,
                creditCard: posAmount,
                count: 0, // Placeholder
            },
            expenses: { // Wrapped expenses in object to match interface
                total: expenses,
                personal: 0, // Business summary only includes business expenses
                business: expenses,
                count: expensesSummary.items.length,
            },
            netProfit: profit, // Renamed profit to netProfit to match interface
        };
    }

    /**
     * Get business monthly financial summary
     */
    async getBusinessMonthlySummary(year: number, month: number): Promise<MonthlyFinancialSummary> {
        const earningsSummary = await earningsService.getBusinessMonthlySummary(year, month);
        const expensesSummary = await expensesService.getBusinessMonthlySummary(year, month);

        const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString().split('T')[0];
        const endDate = new Date(Date.UTC(year, month, 0)).toISOString().split('T')[0];
        const dailyStats = await dailyStatsService.getStatsByDateRange(startDate, endDate);

        const earnings = earningsSummary.total;
        const expenses = expensesSummary.total;
        const profit = earnings - expenses;

        const posTotal = dailyStats.reduce((sum, stat) => sum + Number(stat.pos_amount), 0);
        const cashTotal = earnings - posTotal;

        // Calculate daily breakdown
        const byDay: { date: string; earnings: number; expenses: number; profit: number; cash: number; creditCard: number }[] = [];
        const daysInMonth = new Date(Date.UTC(year, month, 0)).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(Date.UTC(year, month - 1, day)).toISOString().split('T')[0];
            const dayEarnings = earningsSummary.byDay.find(d => d.date === date)?.amount || 0;
            const dayExpenses = expensesSummary.items
                .filter(e => e.date === date)
                .reduce((sum, e) => sum + Number(e.amount), 0);

            const dayPos = dailyStats.find(s => s.date === date)?.pos_amount || 0;
            const dayCash = dayEarnings - Number(dayPos);
            const dayProfit = dayEarnings - dayExpenses;

            byDay.push({
                date,
                earnings: dayEarnings,
                expenses: dayExpenses,
                profit: dayProfit,
                cash: dayCash,
                creditCard: Number(dayPos)
            });
        }

        return {
            year,
            month,
            earnings,
            expenses,
            profit,
            byDay,
            items: expensesSummary.items,
            cash: cashTotal,
            creditCard: posTotal
        };
    }

    /**
     * Get business yearly financial summary
     */
    async getBusinessYearlySummary(year: number): Promise<YearlyFinancialSummary> {
        const earningsSummary = await earningsService.getBusinessYearlySummary(year);
        const expensesSummary = await expensesService.getBusinessYearlySummary(year);

        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        const dailyStats = await dailyStatsService.getStatsByDateRange(startDate, endDate);

        const earnings = earningsSummary.total;
        const expenses = expensesSummary.total;
        const profit = earnings - expenses;

        const posTotal = dailyStats.reduce((sum, stat) => sum + Number(stat.pos_amount), 0);
        const cashTotal = earnings - posTotal;

        // Calculate monthly breakdown
        const byMonth: { month: number; earnings: number; expenses: number; profit: number; cash: number; creditCard: number }[] = [];

        for (let month = 1; month <= 12; month++) {
            const monthEarnings = earningsSummary.byMonth.find(m => m.month === month)?.amount || 0;
            const monthExpenses = expensesSummary.items
                .filter(e => {
                    const expenseMonth = new Date(e.date).getUTCMonth() + 1;
                    return expenseMonth === month;
                })
                .reduce((sum, e) => sum + Number(e.amount), 0);

            // Calculate monthly stats from daily stats
            const monthPos = dailyStats
                .filter(s => {
                    const statMonth = new Date(s.date).getUTCMonth() + 1;
                    return statMonth === month;
                })
                .reduce((sum, s) => sum + Number(s.pos_amount), 0);

            const monthCash = monthEarnings - monthPos;
            const monthProfit = monthEarnings - monthExpenses;

            byMonth.push({
                month,
                earnings: monthEarnings,
                expenses: monthExpenses,
                profit: monthProfit,
                cash: monthCash,
                creditCard: monthPos
            });
        }

        return {
            year,
            earnings,
            expenses,
            profit,
            byMonth,
            cash: cashTotal,
            creditCard: posTotal
        };
    }
}

export default new FinancialService();
