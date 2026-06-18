import api from './api';

export const enterpriseService = {
    // Xem hồ sơ của chính mình (Dành cho doanh nghiệp khi đăng nhập)
    getMe: () => api.get('/v1/enterprises/me').then(res => res.data),

    // Xem hồ sơ công khai của một doanh nghiệp bất kỳ (Dành cho Sinh viên/Khách)
    getPublicProfile: (enterpriseId) => api.get(`/v1/enterprises/${enterpriseId}/public`).then(res => res.data),

    // Các hàm khác...
    updateMe: (formData) => api.put('/v1/enterprises/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data)
};