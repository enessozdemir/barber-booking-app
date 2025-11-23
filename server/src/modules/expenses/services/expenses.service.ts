import expensesRepository, { CreateExpenseDTO, UpdateExpenseDTO, Expense } from '../repositories/expenses.repository';
import { AppError } from '../../auth/utils/AppError';

export interface DailyExpenseSummary {
    personal: number;
    business: number;
    total: number;
    items: Expense[];
}

export interface MonthlyExpenseSummary {
    personal: number;
    business: number;
    total: number;
    items: Expense[];
}

export interface YearlyExpenseSummary {
    personal: number;
    business: number;
    total: number;
    items: Expense[];
}

class ExpensesService {
    /**
     * Create a new expense
     */
    async create(data: CreateExpenseDTO): Promise<Expense> {
        return await expensesRepository.create(data);
    }

    /**
     * Get all business expenses for a date (now returns ALL expenses for business view)
     */
    async getBusinessExpenses(date: string): Promise<Expense[]> {
        return await expensesRepository.getAllByDate(date);
    }

    /**
     * Get daily expense summary for a barber
     */
    async getDailySummary(barberId: string, date: string): Promise<DailyExpenseSummary> {
        const personalItems = await expensesRepository.getByBarberAndDate(barberId, date);
        const businessItems = await expensesRepository.getBusinessByDate(date);

        const personal = personalItems.reduce((sum, e) => sum + Number(e.amount), 0);
        const business = businessItems.reduce((sum, e) => sum + Number(e.amount), 0);
        const total = personal + business;

        const items = [...personalItems, ...businessItems].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return { personal, business, total, items };
    }

    /**
     * Get monthly expense summary for a barber
     */
    async getMonthlySummary(barberId: string, year: number, month: number): Promise<MonthlyExpenseSummary> {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const personalItems = await expensesRepository.getByBarberAndDateRange(barberId, startDate, endDate);
        const businessItems = await expensesRepository.getBusinessByDateRange(startDate, endDate);

        const personal = personalItems.reduce((sum, e) => sum + Number(e.amount), 0);
        const business = businessItems.reduce((sum, e) => sum + Number(e.amount), 0);
        const total = personal + business;

        const items = [...personalItems, ...businessItems].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        return { personal, business, total, items };
    }

    /**
     * Get yearly expense summary for a barber
     */
    async getYearlySummary(barberId: string, year: number): Promise<YearlyExpenseSummary> {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const personalItems = await expensesRepository.getByBarberAndDateRange(barberId, startDate, endDate);
        const businessItems = await expensesRepository.getBusinessByDateRange(startDate, endDate);

        const personal = personalItems.reduce((sum, e) => sum + Number(e.amount), 0);
        const business = businessItems.reduce((sum, e) => sum + Number(e.amount), 0);
        const total = personal + business;

        const items = [...personalItems, ...businessItems].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        return { personal, business, total, items };
    }

    /**
     * Update an expense
     */
    async update(id: string, barberId: string, data: UpdateExpenseDTO): Promise<Expense> {
        const expense = await expensesRepository.getById(id);

        if (!expense) {
            throw new Error('Expense not found');
        }

        // Only allow updating own expenses or business expenses
        if (expense.barber_id && expense.barber_id !== barberId) {
            throw new Error('Unauthorized to update this expense');
        }

        return await expensesRepository.update(id, data);
    }

    /**
     * Delete an expense
     */
    async delete(id: string, barberId: string): Promise<void> {
        const expense = await expensesRepository.getById(id);

        if (!expense) {
            throw new Error('Expense not found');
        }

        // Only allow deleting own expenses or business expenses
        if (expense.barber_id && expense.barber_id !== barberId) {
            throw new Error('Unauthorized to delete this expense');
        }

        await expensesRepository.delete(id);
    }

    /**
     * Get business daily summary (all expenses)
     */
    async getBusinessDailySummary(date: string): Promise<DailyExpenseSummary> {
        const items = await expensesRepository.getAllByDate(date);
        const total = items.reduce((sum, e) => sum + Number(e.amount), 0);
        const personal = items.filter(i => i.type === 'personal').reduce((sum, e) => sum + Number(e.amount), 0);
        const business = items.filter(i => i.type === 'business').reduce((sum, e) => sum + Number(e.amount), 0);

        return { personal, business, total, items };
    }

    /**
     * Get business monthly summary (all expenses)
     */
    async getBusinessMonthlySummary(year: number, month: number): Promise<MonthlyExpenseSummary> {
        const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString().split('T')[0];
        const endDate = new Date(Date.UTC(year, month, 0)).toISOString().split('T')[0];

        const items = await expensesRepository.getAllByDateRange(startDate, endDate);
        const total = items.reduce((sum, e) => sum + Number(e.amount), 0);
        const personal = items.filter(i => i.type === 'personal').reduce((sum, e) => sum + Number(e.amount), 0);
        const business = items.filter(i => i.type === 'business').reduce((sum, e) => sum + Number(e.amount), 0);

        return { personal, business, total, items };
    }

    /**
     * Get business yearly summary (all expenses)
     */
    async getBusinessYearlySummary(year: number): Promise<YearlyExpenseSummary> {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const items = await expensesRepository.getAllByDateRange(startDate, endDate);
        const total = items.reduce((sum, e) => sum + Number(e.amount), 0);
        const personal = items.filter(i => i.type === 'personal').reduce((sum, e) => sum + Number(e.amount), 0);
        const business = items.filter(i => i.type === 'business').reduce((sum, e) => sum + Number(e.amount), 0);

        return { personal, business, total, items };
    }
}

export default new ExpensesService();
