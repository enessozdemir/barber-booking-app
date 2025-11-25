import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import LoginForm from '../LoginForm';
import authReducer from '../../store/authSlice';
import formReducer from '../../store/formSlice';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../hooks/useLoginForm', () => ({
  useLoginForm: () => ({
    phone: '',
    password: '',
    handlePhoneChange: vi.fn(),
    handlePasswordChange: vi.fn(),
    handleSubmit: vi.fn((e) => e.preventDefault()),
    handleForgotPassword: vi.fn(),
  }),
}));

describe('LoginForm', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    store = configureStore({
      reducer: {
        auth: authReducer,
        form: formReducer,
      },
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    );
  };

  it('renders login form', () => {
    renderWithProviders(<LoginForm />);
    
    expect(screen.getByPlaceholderText(/5xx xxx xx xx/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/6 Haneli PIN/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Giriş Yap/i })).toBeInTheDocument();
  });

  it('renders forgot password link', () => {
    renderWithProviders(<LoginForm />);
    
    expect(screen.getByText(/Şifremi unuttum/i)).toBeInTheDocument();
  });

  it('renders register redirect message', () => {
    renderWithProviders(<LoginForm />);
    
    expect(screen.getByText(/Hesabınız yok mu/i)).toBeInTheDocument();
    expect(screen.getByText(/Kayıt Ol/i)).toBeInTheDocument();
  });

  it('has correct form structure', () => {
    renderWithProviders(<LoginForm />);
    
    const form = screen.getByRole('button', { name: /Giriş Yap/i }).closest('form');
    expect(form).toBeInTheDocument();
  });
});
