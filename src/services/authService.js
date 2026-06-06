import api from './api';

export const authService = {
    login: async (credentials) => {
        const response = await api.post('/v1/auth/login', credentials);
        if (response.data?.data) {
            const { accessToken, refreshToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
        }
        return response;
    },

    register: async (userData) => {
        return await api.post('/v1/auth/register', userData);
    },

    verifyOtp: (otpData) => api.post('/auth/verify-otp', otpData),

    logout: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            // Cố gắng báo cho Backend thu hồi token
            if (refreshToken) {
                await api.post('/v1/auth/logout', { refreshToken });
            }
        } catch (error) {
            console.error("Server logout error:", error);
        } finally {
            // Dù server lỗi hay gì, local vẫn phải xóa sạch
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
        }
    }
};