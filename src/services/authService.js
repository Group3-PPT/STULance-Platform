import api from './api';

let refreshTimer = null;
const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 phút
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 ngày

export const authService = {
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

    refreshAccessToken: async () => {
        const oldRefreshToken = localStorage.getItem('refreshToken');
        if (!oldRefreshToken) {
            authService.handleSessionExpired();
            return null;
        }

        try {
            const res = await api.post('/v1/auth/refresh-token', { refreshToken: oldRefreshToken });
            const data = res.data.data || res.data;
            if (data.accessToken) {
                authService.startSession(data.accessToken, data.refreshToken, localStorage.getItem('userRole'));
                return data.accessToken;
            }
            return null;
        } catch (err) {
            console.error("Refresh token failed:", err);
            if (err.response?.status === 401 || err.response?.status === 400) {
                authService.handleSessionExpired();
            }
            return null;
        }
    },

    startSession: (accessToken, refreshToken, role) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userRole', role);
        localStorage.setItem('lastActivity', Date.now().toString());
        localStorage.setItem('tokenRefreshedAt', Date.now().toString());

        window.dispatchEvent(new Event("local-storage-update"));
        authService.scheduleRefresh();
    },

    scheduleRefresh: () => {
        if (refreshTimer) clearTimeout(refreshTimer);

        const refreshedAt = localStorage.getItem('tokenRefreshedAt');
        if (!refreshedAt) return;

        const elapsed = Date.now() - Number(refreshedAt);
        const remaining = REFRESH_INTERVAL - elapsed;

        if (remaining <= 0) {
            // Đã quá 14 phút → refresh ngay
            console.log("Hệ thống: Token hết hạn, đang refresh ngay...");
            authService.refreshAccessToken();
        } else {
            // Còn lại X phút → đợi rồi refresh
            console.log(`Hệ thống: Sẽ refresh token sau ${Math.ceil(remaining / 60000)} phút.`);
            refreshTimer = setTimeout(() => {
                authService.refreshAccessToken();
            }, remaining);
        }
    },

    initAuth: () => {
        const token = localStorage.getItem('accessToken');
        const rfToken = localStorage.getItem('refreshToken');
        const lastActivity = localStorage.getItem('lastActivity');

        if (!token || !rfToken) return;

        // Kiểm tra 7 ngày hết hạn
        if (lastActivity && (Date.now() - Number(lastActivity)) > SESSION_MAX_AGE) {
            console.log("Hệ thống: Phiên đã hết hạn (quá 7 ngày).");
            authService.handleSessionExpired();
            return;
        }

        // Tính thời gian còn lại và schedule refresh
        authService.scheduleRefresh();
    },

    handleSessionExpired: () => {
        if (refreshTimer) clearTimeout(refreshTimer);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('lastActivity');
        localStorage.removeItem('tokenRefreshedAt');
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

window.addEventListener("token-refreshed", () => {
    authService.scheduleRefresh();
});

window.addEventListener("storage", (e) => {
    if (e.key === 'accessToken' && !e.newValue) {
        authService.handleSessionExpired();
    }
});
