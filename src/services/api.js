import axios from 'axios';

const API_BASE_URL = "/api"; 
const X_API_KEY = "STULANCE_SECRET_API_KEY_2026"; 

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': X_API_KEY
    }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
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
        // Cập nhật thời gian hoạt động trên mỗi request thành công
        localStorage.setItem('lastActivity', Date.now().toString());
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // Nếu chính API refresh bị 401 -> Logout thật sự
            if (originalRequest.url.includes('/refresh-token')) {
                handleLocalLogout();
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

            const oldRefreshToken = localStorage.getItem('refreshToken');
            if (!oldRefreshToken) {
                handleLocalLogout();
                return Promise.reject(error);
            }

            try {
                // Gọi API refresh dùng axios gốc
                const res = await axios.post(`${API_BASE_URL}/v1/auth/refresh-token`, 
                    { refreshToken: oldRefreshToken },
                    { headers: { 'X-API-KEY': X_API_KEY } }
                );

                const data = res.data.data || res.data;
                const { accessToken, refreshToken } = data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('tokenRefreshedAt', Date.now().toString());
                
                // Đồng bộ lại timer 14p ở authService
                window.dispatchEvent(new Event("token-refreshed"));

                processQueue(null, accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                
                // QUAN TRỌNG: Chỉ logout nếu Server confirm Token sai (401/400)
                // Nếu lỗi 502/500 (Server bận), KHÔNG logout, để user thử lại sau
                if (refreshError.response?.status === 401 || refreshError.response?.status === 400) {
                    handleLocalLogout();
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

function handleLocalLogout() {
    if (window.location.pathname !== '/login') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('lastActivity');
        localStorage.removeItem('tokenRefreshedAt');
        window.dispatchEvent(new Event("local-storage-update"));
        window.location.href = '/login';
    }
}

export default api;