import axios from "axios";
import { store } from "../modules/app/store";
import { setAccessToken, setUser, logout as logoutAction } from "../modules/auth/store/authSlice";
import type { AxiosRequestConfig } from "axios";
import type { RootState } from "../modules/app/store";

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";
axios.defaults.withCredentials = true; // ensure browser sends cookies (HttpOnly refresh token)

// Request interceptor to attach access token
axios.interceptors.request.use((config) => {
    const state = store.getState() as RootState;
    const token = state.auth?.accessToken ?? null;
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle 401 -> try refresh
let isRefreshing = false;
type FailedRequest = {
    resolve: (token?: string | null) => void;
    reject: (err: unknown) => void;
};
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom: FailedRequest) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

axios.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalRequest = err.config as AxiosRequestConfig & {
            _retry?: boolean;
        };

        // Skip refresh for auth endpoints (login, register, refresh itself)
        const url = originalRequest.url || '';
        const skipRefreshUrls = ['/auth/login', '/auth/register', '/auth/refresh'];
        const shouldSkipRefresh = skipRefreshUrls.some(skipUrl => url.includes(skipUrl));

        if (
            err.response &&
            err.response.status === 401 &&
            !originalRequest._retry &&
            !shouldSkipRefresh
        ) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers)
                            originalRequest.headers.Authorization = "Bearer " + (token ?? "");
                        return axios(originalRequest as AxiosRequestConfig);
                    })
                    .catch((e) => Promise.reject(e));
            }

            originalRequest._retry = true;
            isRefreshing = true;
            try {
                // attempt refresh — backend reads HttpOnly cookie and rotates it; it returns new accessToken
                const response = await axios.post(
                    "/auth/refresh",
                    {},
                    { withCredentials: true }
                );
                const { accessToken, user } = response.data;
                store.dispatch(setAccessToken(accessToken));
                if (user) {
                    store.dispatch(setUser(user));
                }
                if (originalRequest.headers)
                    originalRequest.headers.Authorization = "Bearer " + accessToken;
                processQueue(null, accessToken);
                isRefreshing = false;
                return axios(originalRequest);
            } catch (e) {
                processQueue(e, null);
                isRefreshing = false;
                store.dispatch(logoutAction());
                return Promise.reject(e);
            }
        }
        return Promise.reject(err);
    }
);

export default function setupAxios() {
    // Axios is already configured via interceptors above
    // This function is called to ensure the setup runs
}
