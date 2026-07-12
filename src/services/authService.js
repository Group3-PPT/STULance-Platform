import api from './api';

let refreshTimer = null;
const REFRESH_INTERVAL = 14 * 60 * 1000;
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const storage = {
    getAccess: () => localStorage.getItem('accessToken'),
    setAccess: (v) => localStorage.setItem('accessToken', v),
    getRefresh: () => sessionStorage.getItem('refreshToken'),
    setRefresh: (v) => sessionStorage.setItem('refreshToken', v),
    getRole: () => localStorage.getItem('userRole'),
    setRole: (v) => localStorage.setItem('userRole', v),
    getUserId: () => localStorage.getItem('userId'),
    setUserId: (v) => localStorage.setItem('userId', v),
    getLastActivity: () => localStorage.getItem('lastActivity'),
    setLastActivity: (v) => localStorage.setItem('lastActivity', v),
    clear: () => {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('lastActivity');
        localStorage.removeItem('tokenRefreshedAt');
    }
};

export const authService = {
    login: async (credentials) => {
        const response = await api.post('/v1/auth/login', credentials);
        const result = response.data.data;
        if (result && (result.accessToken || result.token)) {
            await authService.startSession(
                result.accessToken || result.token,
                result.refreshToken,
                result.roleName || result.roleId || result.role
            );
        }
        return response;
    },

    refreshAccessToken: async () => {
        const oldRefreshToken = storage.getRefresh();
        if (!oldRefreshToken) {
            return null;
        }

        try {
            const res = await api.post('/v1/auth/refresh-token', { refreshToken: oldRefreshToken });
            const data = res.data.data || res.data;
            if (data.accessToken) {
                storage.setAccess(data.accessToken);
                if (data.refreshToken) storage.setRefresh(data.refreshToken);
                localStorage.setItem('tokenRefreshedAt', Date.now().toString());
                storage.setLastActivity(Date.now().toString());
                window.dispatchEvent(new Event("token-refreshed"));
                authService.scheduleRefresh();
                return data.accessToken;
            }
            return null;
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 400) {
                authService.handleSessionExpired();
            }
            return null;
        }
    },

    fetchAndStoreUserId: async () => {
        try {
            const role = storage.getRole();
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
                storage.setUserId(userId);
                return userId;
            }

            const res = await api.get('/v1/profiles/me');
            userId = res.data?.data?.userId || res.data?.userId;
            if (userId) {
                storage.setUserId(userId);
            }
            return userId;
        } catch (err) {
            console.error("Lỗi lấy userId:", err.response?.status);
        }
        return null;
    },

    startSession: async (accessToken, refreshToken, role) => {
        storage.setAccess(accessToken);
        storage.setRefresh(refreshToken);
        storage.setRole(role);
        storage.setLastActivity(Date.now().toString());
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

        const token = storage.getAccess();
        const rfToken = storage.getRefresh();
        if (!token || !rfToken) return;

        refreshTimer = setTimeout(async () => {
            await authService.refreshAccessToken();
        }, REFRESH_INTERVAL);
    },

    ensureUserId: async () => {
        let userId = storage.getUserId();
        if (userId) return userId;
        return await authService.fetchAndStoreUserId();
    },

    initAuth: async () => {
        const token = storage.getAccess();
        const rfToken = storage.getRefresh();
        const lastActivity = storage.getLastActivity();

        if (!token || !rfToken) return;

        if (lastActivity && (Date.now() - Number(lastActivity)) > SESSION_MAX_AGE) {
            authService.handleSessionExpired();
            return;
        }

        authService.scheduleRefresh();

        if (!storage.getUserId()) {
            await authService.fetchAndStoreUserId();
        }
    },

    handleSessionExpired: () => {
        if (refreshTimer) {
            clearTimeout(refreshTimer);
            refreshTimer = null;
        }
        storage.clear();
        window.dispatchEvent(new Event("local-storage-update"));
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    },

    logout: async () => {
        const refreshToken = storage.getRefresh();
        try {
            if (refreshToken) await api.post('/v1/auth/logout', { refreshToken });
        } finally {
            authService.handleSessionExpired();
        }
    },

    register: (data) => api.post('/v1/auth/register', data),
    verifyOtp: (data) => api.post('/v1/auth/verify-otp', data),
    resendOtp: (data) => api.post('/v1/auth/resend-otp', data).then(r => r.data),
    forgotPassword: (data) => api.post('/v1/auth/forgot-password', data).then(r => r.data),
    resetPassword: (data) => api.post('/v1/auth/reset-password', data).then(r => r.data),
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
