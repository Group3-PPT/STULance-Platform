import api from './api';

let refreshTimer = null;
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 ngày

export const authService = {
    // 1. Đăng nhập
    login: async (credentials) => {
        const response = await api.post('/v1/auth/login', credentials);
        const result = response.data.data;
        if (result && (result.accessToken || result.token)) {
            authService.startSession(
                result.accessToken || result.token, 
                result.refreshToken, 
                result.roleId || result.role
            );
        }
        return response;
    },

    // 2. Gia hạn Token âm thầm
    refreshAccessToken: async () => {
        const oldRefreshToken = localStorage.getItem('refreshToken');
        if (!oldRefreshToken) return null;

        try {
            const res = await api.post('/v1/auth/refresh-token', { refreshToken: oldRefreshToken });
            const data = res.data.data || res.data;
            authService.startSession(data.accessToken, data.refreshToken, localStorage.getItem('userRole'));
            return data.accessToken;
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 400) {
                authService.handleSessionExpired();
            }
            return null;
        }
    },

    // 3. Khởi động Timer 14 phút
    startSession: (accessToken, refreshToken, role) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userRole', role);
        localStorage.setItem('lastActivity', Date.now().toString());

        window.dispatchEvent(new Event("local-storage-update"));
        if (refreshTimer) clearTimeout(refreshTimer);

        // Thiết lập đổi token sau 14 phút
        refreshTimer = setTimeout(() => {
            authService.refreshAccessToken();
        }, 14 * 60 * 1000);
    },

    // 4. FIX LỖI F5: Chỉ thiết lập lại Timer, không force refresh API ngay lập tức
    initAuth: () => {
        const token = localStorage.getItem('accessToken');
        const rfToken = localStorage.getItem('refreshToken');
        const lastActivity = localStorage.getItem('lastActivity');

        if (token && rfToken) {
            // Kiểm tra nếu đã quá 7 ngày không hoạt động → force logout
            if (lastActivity && (Date.now() - Number(lastActivity)) > SESSION_MAX_AGE) {
                console.log("Hệ thống: Phiên đã hết hạn (quá 7 ngày).");
                authService.handleSessionExpired();
                return;
            }

            // Khởi động lại Timer 14p dựa trên token hiện có
            if (refreshTimer) clearTimeout(refreshTimer);
            refreshTimer = setTimeout(() => {
                authService.refreshAccessToken();
            }, 14 * 60 * 1000);

            console.log("Hệ thống: Đã khôi phục bộ đếm gia hạn (F5).");
        }
    },

    handleSessionExpired: () => {
        if (refreshTimer) clearTimeout(refreshTimer);
        localStorage.clear();
        window.dispatchEvent(new Event("local-storage-update"));
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    },

    logout: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            if (refreshToken) await api.post('/v1/auth/logout', { refreshToken });
        } finally {
            authService.handleSessionExpired();
        }
    },

    register: (data) => api.post('/v1/auth/register', data),
    verifyOtp: (data) => api.post('/v1/auth/verify-otp', data),
    changePassword: (data) => api.post('/v1/auth/change-password', data).then(r => r.data),
};

// Lắng nghe sự kiện để đồng bộ Timer
window.addEventListener("token-refreshed", () => {
    authService.initAuth();
});