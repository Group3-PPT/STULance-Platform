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
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và không phải là request đang cố refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // Trường hợp 1: Nếu URL bị lỗi chính là URL refresh token -> Logout luôn để tránh loop
            if (originalRequest.url.includes('/refresh-token')) {
                console.error("RefreshToken đã hết hạn hoặc không hợp lệ. Đang Logout...");
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
                console.log("--- Đang thực hiện Refresh Token... ---");
                
                // GỌI API REFRESH (Dùng axios gốc và phải có X-API-KEY)
                const res = await axios.post(`${API_BASE_URL}/v1/auth/refresh-token`, 
                    { refreshToken: oldRefreshToken },
                    { headers: { 'X-API-KEY': X_API_KEY } } // QUAN TRỌNG: Phải có key ở đây
                );

                const data = res.data.data || res.data;
                const { accessToken, refreshToken } = data;

                if (!accessToken) throw new Error("Server không trả về accessToken mới");

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                processQueue(null, accessToken);
                
                // Thực hiện lại request ban đầu với token mới
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                console.error("!!! Lỗi khi đang Refresh Token:", refreshError.response?.data || refreshError.message);
                processQueue(refreshError, null);
                handleLocalLogout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

function handleLocalLogout() {
    localStorage.clear();
    // Tránh reload liên tục nếu đang ở trang login
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
}

export default api;