import axios from 'axios';
import { store } from '../../app/store';
import { setAccessToken, logout as logoutAction } from '../store/authSlice';
import type { AxiosRequestConfig } from 'axios';
import type { RootState } from '../../app/store';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true, // ensure browser sends cookies (HttpOnly refresh token)
});

// Attach access token
API.interceptors.request.use((config) => {
  const state = store.getState() as RootState;
  const token = state.auth?.accessToken ?? null;
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor to handle 401 -> try refresh
let isRefreshing = false;
type FailedRequest = { resolve: (token?: string | null) => void; reject: (err: unknown) => void };
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom: FailedRequest) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config as AxiosRequestConfig & { _retry?: boolean };
    if (err.response && err.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) originalRequest.headers.Authorization = 'Bearer ' + (token ?? '');
            return API(originalRequest as AxiosRequestConfig);
          })
          .catch((e) => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
          // attempt refresh — backend reads HttpOnly cookie and rotates it; it returns new accessToken
          const response = await axios.post(`${API.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
          const { accessToken } = response.data;
          store.dispatch(setAccessToken(accessToken));
    if (originalRequest.headers) originalRequest.headers.Authorization = 'Bearer ' + accessToken;
    processQueue(null, accessToken);
        isRefreshing = false;
        return API(originalRequest);
      } catch (e) {
        processQueue(e, null);
        isRefreshing = false;
        store.dispatch(logoutAction());
        return Promise.reject(e);
      }
    }
    return Promise.reject(err);
  },
);

export default API;
