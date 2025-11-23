import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

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
    byDay: Array<{
        date: string;
        earnings: number;
        expenses: number;
        profit: number;
    }>;
}

export interface YearlyFinancialSummary {
    year: string;
    earnings: number;
    expenses: number;
    profit: number;
    byMonth: Array<{
        month: number;
        earnings: number;
        expenses: number;
        profit: number;
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
    loading: boolean;
    error: string | null;
}

const initialState: FinancialState = {
    dailySummary: null,
    monthlySummary: null,
    yearlySummary: null,
    earnings: [],
    expenses: [],
    loading: false,
    error: null,
};

// Async Thunks
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
    },
});

export const { clearFinancialError } = financialSlice.actions;
export default financialSlice.reducer;
