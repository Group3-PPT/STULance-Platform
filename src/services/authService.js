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
    // ... các hàm login/logout cũ
    changePassword: (data) => api.post('/v1/auth/change-password', data).then(res => res.data),

    logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
        // 1. Gửi yêu cầu thu hồi Token lên Server Azure
        if (refreshToken) {
            // Sử dụng instance 'api' đã cấu hình sẵn X-API-KEY và Interceptor
            await api.post('/v1/auth/logout', { refreshToken });
        }
    } catch (error) {
        // Nếu Server lỗi (ví dụ token hết hạn rồi không logout được), 
        // chúng ta vẫn tiếp tục thực hiện xóa ở Local.
        console.error("Server logout error:", error);
    } finally {
        // 2. XÓA SẠCH TẤT CẢ KEY ĐÃ LƯU
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole'); // QUAN TRỌNG: Phải xóa role để Navbar chuyển về khách
        
        // Nếu bạn có lưu thêm key nào khác (ví dụ 'token'), hãy xóa nốt:
        localStorage.removeItem('token');

        // 3. PHÁT TÍN HIỆU CẬP NHẬT CHO NAVBAR (Nếu Navbar đang lắng nghe event này)
        window.dispatchEvent(new Event("local-storage-update"));

        // 4. CHUYỂN HƯỚNG VỀ TRANG LOGIN
        // Sử dụng window.location.href để "ép" trình duyệt load lại từ đầu, 
        // giúp xóa sạch các biến rác trong bộ nhớ (State cũ).
        window.location.href = '/login';
    }
}
};