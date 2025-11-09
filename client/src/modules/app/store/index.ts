import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../auth/store/authSlice';
import formReducer from '../../auth/store/formSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    form: formReducer,
  },
  // Disable Redux DevTools in production for security
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
