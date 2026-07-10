import api from './api';

let refreshTimer = null;
const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 phút
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const authService = {
    login: async (credentials) => {
        const response = await api.post('/v1/auth/login', credentials);
        const result = response.data.data;
        if (result && (result.accessToken || result.token)) {
            await authService.startSession(
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
            console.warn("Không có refreshToken, bỏ qua refresh.");
            return null;
        }

        try {
            const res = await api.post('/v1/auth/refresh-token', { refreshToken: oldRefreshToken });
            const data = res.data.data || res.data;
            if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
                if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('tokenRefreshedAt', Date.now().toString());
                localStorage.setItem('lastActivity', Date.now().toString());
                window.dispatchEvent(new Event("token-refreshed"));
                console.log("Refresh token thành công!");
                authService.scheduleRefresh();
                return data.accessToken;
            }
            return null;
        } catch (err) {
            console.error("Refresh token lỗi:", err.response?.status);
            if (err.response?.status === 401 || err.response?.status === 400) {
                console.error("Refresh token hết hạn/invalid, logout.");
                authService.handleSessionExpired();
            }
            return null;
        }
    },

    fetchAndStoreUserId: async () => {
        try {
            const role = localStorage.getItem('userRole');
            let userId = null;

            if (role === 'STUDENT') {
                const res = await api.get('/v1/students/me');
                userId = res.data?.data?.userId || res.data?.userId || res.data?.data?.studentId || res.data?.studentId;
            } else if (role === 'ENTERPRISE') {
                const res = await api.get('/v1/enterprises/me');
                userId = res.data?.data?.userId || res.data?.userId || res.data?.data?.enterpriseId || res.data?.enterpriseId;
            } else if (role === 'ADMIN') {
                const res = await api.get('/v1/profiles/me');
                userId = res.data?.data?.userId || res.data?.userId || res.data?.data?.adminId || res.data?.adminId;
            }

            if (userId) {
                localStorage.setItem('userId', userId);
                console.log("UserId đã được lưu:", userId);
                return userId;
            }

            const res = await api.get('/v1/profiles/me');
            userId = res.data?.data?.userId || res.data?.userId;
            if (userId) {
                localStorage.setItem('userId', userId);
                console.log("UserId từ profiles/me:", userId);
                return userId;
            }
        } catch (err) {
            console.error("Lỗi lấy userId:", err.response?.status);
        }
        return null;
    },

    startSession: async (accessToken, refreshToken, role) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userRole', role);
        localStorage.setItem('lastActivity', Date.now().toString());
        localStorage.setItem('tokenRefreshedAt', Date.now().toString());

        window.dispatchEvent(new Event("local-storage-update"));
        authService.scheduleRefresh();

        await authService.fetchAndStoreUserId();
    },

    scheduleRefresh: () => {
        if (refreshTimer) {
            clearTimeout(refreshTimer);
            refreshTimer = null;
        }

        const token = localStorage.getItem('accessToken');
        const rfToken = localStorage.getItem('refreshToken');
        if (!token || !rfToken) return;

        console.log(`Token sẽ refresh sau ${REFRESH_INTERVAL / 60000} phút.`);
        refreshTimer = setTimeout(async () => {
            console.log("Đang refresh token...");
            await authService.refreshAccessToken();
        }, REFRESH_INTERVAL);
    },

    ensureUserId: async () => {
        let userId = localStorage.getItem('userId');
        if (userId) return userId;
        return await authService.fetchAndStoreUserId();
    },

    initAuth: async () => {
        const token = localStorage.getItem('accessToken');
        const rfToken = localStorage.getItem('refreshToken');
        const lastActivity = localStorage.getItem('lastActivity');

        if (!token || !rfToken) return;

        if (lastActivity && (Date.now() - Number(lastActivity)) > SESSION_MAX_AGE) {
            console.log("Phiên đã hết hạn (quá 7 ngày).");
            authService.handleSessionExpired();
            return;
        }

        authService.scheduleRefresh();

        if (!localStorage.getItem('userId')) {
            await authService.fetchAndStoreUserId();
        }
    },

    handleSessionExpired: () => {
        if (refreshTimer) {
            clearTimeout(refreshTimer);
            refreshTimer = null;
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
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
    acceptPolicy: (data) => api.post('/v1/auth/accept-policy', data).then(r => r.data),
};

window.addEventListener("token-refreshed", () => {
    authService.scheduleRefresh();
});

window.addEventListener("storage", (e) => {
    if (e.key === 'accessToken' && !e.newValue) {
        authService.handleSessionExpired();
    }
});
