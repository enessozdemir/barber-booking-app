import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';
import type { Barber } from '../../../types/barber';

// Types
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
    month: string;
    earnings: number;
    expenses: number;
    profit: number;
    cash: number;
    creditCard: number;
    byDay: Array<{
        date: string;
        earnings: number;
        expenses: number;
        profit: number;
        cash: number;
        creditCard: number;
    }>;
    items?: Expense[]; // Expense items for detailed tracking
}

export interface YearlyFinancialSummary {
    year: string;
    earnings: number;
    expenses: number;
    profit: number;
    cash: number;
    creditCard: number;
    byMonth: Array<{
        month: number;
        earnings: number;
        expenses: number;
        profit: number;
        cash: number;
        creditCard: number;
    }>;
}

export interface Earning {
    id: string;
    amount: number;
    date: string;
    type: 'booking' | 'walk_in';
    note: string | null;
    booking_id: string | null;
    created_at: string;
}

export interface Expense {
    id: string;
    barber_id: string | null;
    amount: number;
    date: string;
    category: string;
    description: string;
    type: 'personal' | 'business';
    created_at: string;
}

interface FinancialState {
    dailySummary: DailyFinancialSummary | null;
    monthlySummary: MonthlyFinancialSummary | null;
    yearlySummary: YearlyFinancialSummary | null;
    earnings: Earning[];
    expenses: Expense[];
    barbers: Barber[];
    loading: boolean;
    error: string | null;
}

const initialState: FinancialState = {
    dailySummary: null,
    monthlySummary: null,
    yearlySummary: null,
    earnings: [],
    expenses: [],
    barbers: [],
    loading: false,
    error: null,
};

// Async Thunks
export const fetchBarbers = createAsyncThunk(
    'financial/fetchBarbers',
    async (_, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get('/barbers', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.barbers || [];
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'Berberler alınamadı');
            }
            return rejectWithValue('Berberler alınamadı');
        }
    }
);

export const fetchBarberDailySummary = createAsyncThunk(
    'financial/fetchBarberDailySummary',
    async ({ barberId, date }: { barberId: string; date: string }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`/financial/summary/barber/${barberId}/daily/${date}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'Berber günlük özeti alınamadı');
            }
            return rejectWithValue('Berber günlük özeti alınamadı');
        }
    }
);

export const fetchBarberMonthlySummary = createAsyncThunk(
    'financial/fetchBarberMonthlySummary',
    async ({ barberId, year, month }: { barberId: string; year: number; month: number }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`/financial/summary/barber/${barberId}/monthly/${year}/${month}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'Berber aylık özeti alınamadı');
            }
            return rejectWithValue('Berber aylık özeti alınamadı');
        }
    }
);

export const fetchBarberYearlySummary = createAsyncThunk(
    'financial/fetchBarberYearlySummary',
    async ({ barberId, year }: { barberId: string; year: number }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`/financial/summary/barber/${barberId}/yearly/${year}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'Berber yıllık özeti alınamadı');
            }
            return rejectWithValue('Berber yıllık özeti alınamadı');
        }
    }
);

export const fetchBarberEarnings = createAsyncThunk(
    'financial/fetchBarberEarnings',
    async ({ barberId, date }: { barberId: string; date: string }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`/earnings/barber/${barberId}/daily/${date}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.data.items || [];
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'Berber kazançları alınamadı');
            }
            return rejectWithValue('Berber kazançları alınamadı');
        }
    }
);

export const fetchBarberExpenses = createAsyncThunk(
    'financial/fetchBarberExpenses',
    async ({ barberId, date }: { barberId: string; date: string }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`/expenses/barber/${barberId}/daily/${date}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.data.items || [];
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'Berber giderleri alınamadı');
            }
            return rejectWithValue('Berber giderleri alınamadı');
        }
    }
);

export const fetchDailySummary = createAsyncThunk(
    'financial/fetchDailySummary',
    async (date: string, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`/financial/summary/daily/${date}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'Günlük özet alınamadı');
            }
            return rejectWithValue('Günlük özet alınamadı');
        }
    }
);

export const fetchMonthlySummary = createAsyncThunk(
    'financial/fetchMonthlySummary',
    async ({ year, month }: { year: number; month: number }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`/financial/summary/monthly/${year}/${month}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'Aylık özet alınamadı');
            }
            return rejectWithValue('Aylık özet alınamadı');
        }
    }
);

export const fetchYearlySummary = createAsyncThunk(
    'financial/fetchYearlySummary',
    async ({ year }: { year: number }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`/financial/summary/yearly/${year}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'Yıllık özet alınamadı');
            }
            return rejectWithValue('Yıllık özet alınamadı');
        }
    }
);

export const fetchBusinessDailySummary = createAsyncThunk(
    'financial/fetchBusinessDailySummary',
    async (date: string, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`/financial/summary/business/daily/${date}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'İşletme günlük özeti alınamadı');
            }
            return rejectWithValue('İşletme günlük özeti alınamadı');
        }
    }
);

export const fetchBusinessMonthlySummary = createAsyncThunk(
    'financial/fetchBusinessMonthlySummary',
    async ({ year, month }: { year: number; month: number }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`/financial/summary/business/monthly/${year}/${month}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'İşletme aylık özeti alınamadı');
            }
            return rejectWithValue('İşletme aylık özeti alınamadı');
        }
    }
);

export const fetchBusinessYearlySummary = createAsyncThunk(
    'financial/fetchBusinessYearlySummary',
    async ({ year }: { year: number }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`/financial/summary/business/yearly/${year}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'İşletme yıllık özeti alınamadı');
            }
            return rejectWithValue('İşletme yıllık özeti alınamadı');
        }
    }
);

export const fetchEarnings = createAsyncThunk(
    'financial/fetchEarnings',
    async (date: string, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`/earnings/daily/${date}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.data.items || [];
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'Kazançlar alınamadı');
            }
            return rejectWithValue('Kazançlar alınamadı');
        }
    }
);

export const fetchExpenses = createAsyncThunk(
    'financial/fetchExpenses',
    async (date: string, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`/expenses/daily/${date}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.data.items || [];
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'Giderler alınamadı');
            }
            return rejectWithValue('Giderler alınamadı');
        }
    }
);

export const fetchBusinessEarnings = createAsyncThunk(
    'financial/fetchBusinessEarnings',
    async (date: string, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`/earnings/business/items/${date}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.data.items || [];
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'İşletme kazançları alınamadı');
            }
            return rejectWithValue('İşletme kazançları alınamadı');
        }
    }
);

export const fetchBusinessExpenses = createAsyncThunk(
    'financial/fetchBusinessExpenses',
    async (date: string, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`/expenses/business/items/${date}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.data.items || [];
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'İşletme giderleri alınamadı');
            }
            return rejectWithValue('İşletme giderleri alınamadı');
        }
    }
);

export const updateDailyPosAmount = createAsyncThunk(
    'financial/updateDailyPosAmount',
    async ({ date, amount }: { date: string; amount: number }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.post('/daily-stats/pos', { date, amount }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { date, amount: response.data.data.pos_amount };
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || 'POS tutarı güncellenemedi');
            }
            return rejectWithValue('POS tutarı güncellenemedi');
        }
    }
);

const financialSlice = createSlice({
    name: 'financial',
    initialState,
    reducers: {
        clearFinancialError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Daily Summary
        builder.addCase(fetchDailySummary.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchDailySummary.fulfilled, (state, action: PayloadAction<DailyFinancialSummary>) => {
            state.loading = false;
            state.dailySummary = action.payload;
        });
        builder.addCase(fetchDailySummary.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Monthly Summary
        builder.addCase(fetchMonthlySummary.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchMonthlySummary.fulfilled, (state, action: PayloadAction<MonthlyFinancialSummary>) => {
            state.loading = false;
            state.monthlySummary = action.payload;
        });
        builder.addCase(fetchMonthlySummary.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Yearly Summary
        builder.addCase(fetchYearlySummary.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchYearlySummary.fulfilled, (state, action: PayloadAction<YearlyFinancialSummary>) => {
            state.loading = false;
            state.yearlySummary = action.payload;
        });
        builder.addCase(fetchYearlySummary.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Business Daily Summary
        builder.addCase(fetchBusinessDailySummary.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchBusinessDailySummary.fulfilled, (state, action: PayloadAction<DailyFinancialSummary>) => {
            state.loading = false;
            state.dailySummary = action.payload;
        });
        builder.addCase(fetchBusinessDailySummary.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Business Monthly Summary
        builder.addCase(fetchBusinessMonthlySummary.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchBusinessMonthlySummary.fulfilled, (state, action: PayloadAction<MonthlyFinancialSummary>) => {
            state.loading = false;
            state.monthlySummary = action.payload;
        });
        builder.addCase(fetchBusinessMonthlySummary.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Business Yearly Summary
        builder.addCase(fetchBusinessYearlySummary.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchBusinessYearlySummary.fulfilled, (state, action: PayloadAction<YearlyFinancialSummary>) => {
            state.loading = false;
            state.yearlySummary = action.payload;
        });
        builder.addCase(fetchBusinessYearlySummary.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Earnings
        builder.addCase(fetchEarnings.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchEarnings.fulfilled, (state, action: PayloadAction<Earning[]>) => {
            state.loading = false;
            state.earnings = action.payload;
        });
        builder.addCase(fetchEarnings.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Expenses
        builder.addCase(fetchExpenses.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<Expense[]>) => {
            state.loading = false;
            state.expenses = action.payload;
        });
        builder.addCase(fetchExpenses.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Business Earnings
        builder.addCase(fetchBusinessEarnings.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchBusinessEarnings.fulfilled, (state, action: PayloadAction<Earning[]>) => {
            state.loading = false;
            state.earnings = action.payload;
        });
        builder.addCase(fetchBusinessEarnings.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Business Expenses
        builder.addCase(fetchBusinessExpenses.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchBusinessExpenses.fulfilled, (state, action: PayloadAction<Expense[]>) => {
            state.loading = false;
            state.expenses = action.payload;
        });
        builder.addCase(fetchBusinessExpenses.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Fetch Barbers
        builder.addCase(fetchBarbers.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchBarbers.fulfilled, (state, action: PayloadAction<Barber[]>) => {
            state.loading = false;
            state.barbers = action.payload;
        });
        builder.addCase(fetchBarbers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Barber Daily Summary
        builder.addCase(fetchBarberDailySummary.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchBarberDailySummary.fulfilled, (state, action: PayloadAction<DailyFinancialSummary>) => {
            state.loading = false;
            state.dailySummary = action.payload;
        });
        builder.addCase(fetchBarberDailySummary.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Barber Monthly Summary
        builder.addCase(fetchBarberMonthlySummary.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchBarberMonthlySummary.fulfilled, (state, action: PayloadAction<MonthlyFinancialSummary>) => {
            state.loading = false;
            state.monthlySummary = action.payload;
        });
        builder.addCase(fetchBarberMonthlySummary.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Barber Yearly Summary
        builder.addCase(fetchBarberYearlySummary.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchBarberYearlySummary.fulfilled, (state, action: PayloadAction<YearlyFinancialSummary>) => {
            state.loading = false;
            state.yearlySummary = action.payload;
        });
        builder.addCase(fetchBarberYearlySummary.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Barber Earnings
        builder.addCase(fetchBarberEarnings.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchBarberEarnings.fulfilled, (state, action: PayloadAction<Earning[]>) => {
            state.loading = false;
            state.earnings = action.payload;
        });
        builder.addCase(fetchBarberEarnings.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Barber Expenses
        builder.addCase(fetchBarberExpenses.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchBarberExpenses.fulfilled, (state, action: PayloadAction<Expense[]>) => {
            state.loading = false;
            state.expenses = action.payload;
        });
        builder.addCase(fetchBarberExpenses.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
        // Update POS Amount
        builder.addCase(updateDailyPosAmount.fulfilled, (state, action) => {
            const { amount } = action.payload;
            if (state.dailySummary) {
                const total = state.dailySummary.earnings.total;
                state.dailySummary.earnings.creditCard = Number(amount);
                state.dailySummary.earnings.cash = total - Number(amount);
            }
        });
    },
});

export const { clearFinancialError } = financialSlice.actions;
export default financialSlice.reducer;
