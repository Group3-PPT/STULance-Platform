import axios from 'axios';

const API_BASE_URL = "/api";
const X_API_KEY = "STULANCE_SECRET_API_KEY_2026";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': X_API_KEY
    },
    timeout: 30000,
});

const rawApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': X_API_KEY
    },
    timeout: 15000,
});

rawApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

let failedQueue = [];

const clearAuth = () => {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('tokenRefreshedAt');
    localStorage.removeItem('loginAttempts');
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        localStorage.setItem('lastActivity', Date.now().toString());
        refreshAttempts = 0;
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (!error.response) {
            return Promise.reject(error);
        }

        if (error.response.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (originalRequest.url.includes('/refresh-token') || originalRequest.url.includes('/login')) {
            clearAuth();
            window.dispatchEvent(new Event("local-storage-update"));
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            }).catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const oldRefreshToken = sessionStorage.getItem('refreshToken');
        if (!oldRefreshToken) {
            isRefreshing = false;
            clearAuth();
            window.dispatchEvent(new Event("local-storage-update"));
            return Promise.reject(error);
        }

        try {
            const res = await rawApi.post('/v1/auth/refresh-token',
                { refreshToken: oldRefreshToken }
            );

            const data = res.data.data || res.data;
            const { accessToken, refreshToken } = data;

            if (!accessToken) throw new Error("No accessToken in response");

            localStorage.setItem('accessToken', accessToken);
            if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('tokenRefreshedAt', Date.now().toString());
            localStorage.setItem('lastActivity', Date.now().toString());

            window.dispatchEvent(new Event("token-refreshed"));

            processQueue(null, accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            refreshAttempts = 0;
            return api(originalRequest);

        } catch (refreshError) {
            processQueue(refreshError, null);
            refreshAttempts++;

            const status = refreshError.response?.status;
            console.error(`Refresh attempt ${refreshAttempts} failed:`, status || refreshError.message);

            if (status === 401 || status === 400 || refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
                console.error("Refresh token hết hạn hoặc quá số lần thử, logout.");
                clearAuth();
                window.dispatchEvent(new Event("local-storage-update"));
            } else {
                console.error("Refresh lỗi server:", status, "- KHÔNG logout, sẽ thử lại ở request tiếp.");
            }
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export { rawApi };
export default api;
