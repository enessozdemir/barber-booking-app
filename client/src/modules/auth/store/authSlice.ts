import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type User = {
  id: string;
  phone: string;
  full_name?: string;
  role?: string;
};

type AuthState = {
  user?: User | null;
  accessToken?: string | null;
  loading: boolean;
  initialized: boolean;
  error?: string | null;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  loading: false,
  initialized: false,
  error: null,
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    setAccessToken(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setInitialized(state, action: PayloadAction<boolean>) {
      state.initialized = action.payload;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.error = null;
    },
  },
});

export const { setLoading, setUser, setAccessToken, setError, setInitialized, logout } = slice.actions;
export default slice.reducer;
