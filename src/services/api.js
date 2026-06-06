import axios from 'axios';

const API_BASE_URL = "/api"; 

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Biến kiểm soát trạng thái refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// 1. Request Interceptor: Gắn Access Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken'); // Đổi tên cho rõ ràng
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. Response Interceptor: Xử lý lỗi 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và không phải là request đang cố refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            if (isRefreshing) {
                // Đang refresh rồi, đợi thôi
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                handleLocalLogout();
                return Promise.reject(error);
            }

            try {
                // Gọi API refresh token (Sử dụng axios gốc để tránh interceptor này)
                const res = await axios.post(`${API_BASE_URL}/v1/auth/refresh-token`, {
                    refreshToken: refreshToken
                });

                const { accessToken, refreshToken: newRefreshToken } = res.data.data; // Giả sử backend trả về data.data

                // Lưu token mới
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                // Chạy tiếp các request đang đợi
                processQueue(null, accessToken);

                // Thực hiện lại request hiện tại
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
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

// Hàm logout tại chỗ
function handleLocalLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
}

export default api;