import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import { useAuth } from '../useAuth';
import authReducer from '../../store/authSlice';

vi.mock('axios');

describe('useAuth', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore({
      reducer: { auth: authReducer },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  it('initializes with default state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.state.user).toBeNull();
    expect(result.current.state.accessToken).toBeNull();
    expect(result.current.state.initialized).toBe(false);
  });

  it('login sets user and token', async () => {
    const mockResponse = {
      data: {
        user: { id: '1', full_name: 'Test User', phone: '5551234567' },
        accessToken: 'test-token',
      },
    };
    vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('5551234567', 'password123');
    });

    expect(vi.mocked(axios.post)).toHaveBeenCalledWith('/auth/login', {
      phone: '5551234567',
      password: 'password123',
    });
    expect(result.current.state.user).toEqual(mockResponse.data.user);
    expect(result.current.state.accessToken).toBe('test-token');
  });
});
