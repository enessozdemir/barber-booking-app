import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type LoginFormState = {
  phone: string;
  // password is NOT stored in Redux for security reasons (local state only)
};

type RegisterFormState = {
  phone: string;
  email: string;
  fullName: string;
  // password and confirmPassword are NOT stored in Redux for security reasons (local state only)
};

type ForgotPasswordFormState = {
  phone: string;
  email: string;
};

type FormState = {
  login: LoginFormState;
  register: RegisterFormState;
  forgotPassword: ForgotPasswordFormState;
};

const initialState: FormState = {
  login: {
    phone: '',
  },
  register: {
    phone: '',
    email: '',
    fullName: '',
  },
  forgotPassword: {
    phone: '',
    email: '',
  },
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    // Login form actions
    setLoginPhone: (state, action: PayloadAction<string>) => {
      state.login.phone = action.payload;
    },
    resetLoginForm: (state) => {
      state.login = initialState.login;
    },
    // Register form actions
    setRegisterPhone: (state, action: PayloadAction<string>) => {
      state.register.phone = action.payload;
    },
    setRegisterEmail: (state, action: PayloadAction<string>) => {
      state.register.email = action.payload;
    },
    setRegisterFullName: (state, action: PayloadAction<string>) => {
      state.register.fullName = action.payload;
    },
    resetRegisterForm: (state) => {
      state.register = initialState.register;
    },
    // Forgot password form actions
    setForgotPasswordPhone: (state, action: PayloadAction<string>) => {
      state.forgotPassword.phone = action.payload;
    },
    setForgotPasswordEmail: (state, action: PayloadAction<string>) => {
      state.forgotPassword.email = action.payload;
    },
    resetForgotPasswordForm: (state) => {
      state.forgotPassword = initialState.forgotPassword;
    },
  },
});

export const {
  setLoginPhone,
  resetLoginForm,
  setRegisterPhone,
  setRegisterEmail,
  setRegisterFullName,
  resetRegisterForm,
  setForgotPasswordPhone,
  setForgotPasswordEmail,
  resetForgotPasswordForm,
} = formSlice.actions;

export default formSlice.reducer;

