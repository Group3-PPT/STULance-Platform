import api from './api';
import axios from 'axios';

export const enterpriseService = {
    // --- DÀNH CHO DOANH NGHIỆP (Self-management) ---

    /**
     * Xem hồ sơ của chính doanh nghiệp đang đăng nhập
     * Endpoint: GET /api/v1/enterprises/me
     */
    getMe: () => api.get('/v1/enterprises/me').then(res => res.data),

    /**
     * Cập nhật thông tin hồ sơ doanh nghiệp
     * Endpoint: PUT /api/v1/enterprises/me
     * Lưu ý: Sử dụng FormData để gửi kèm LogoFile
     */
    updateMe: (formData) => api.put('/v1/enterprises/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data),


    // --- DÀNH CHO PUBLIC (Sinh viên/Khách xem) ---

    /**
     * Xem trang hồ sơ công khai của doanh nghiệp
     * Endpoint: GET /api/v1/enterprises/{enterpriseId}/public
     */
    getPublicProfile: (enterpriseId) => api.get(`/v1/enterprises/${enterpriseId}/public`).then(res => res.data),

    /**
     * Lấy danh sách tất cả doanh nghiệp (Dùng cho trang chủ/tìm kiếm)
     * Endpoint: GET /api/v1/enterprises/public
     */
    getAllEnterprises: () => {
        const role = localStorage.getItem('userRole');
        if (role === 'ADMIN' || role === 'pPDY5Dnk') {
            return api.get('/v1/enterprises').then(res => res.data);
        }
        return enterpriseService.getAllPublicEnterprises();
    },

    getAllPublicEnterprises: () => axios.get('/api/v1/enterprises/public').then(res => res.data),


    // --- DÀNH CHO ADMIN (Hệ thống quản trị) ---

    /**
     * Lấy thông tin chi tiết một doanh nghiệp bất kỳ theo ID
     * Endpoint: GET /api/v1/enterprises/{enterpriseId}
     */
    getEnterpriseById: (enterpriseId) => api.get(`/v1/enterprises/${enterpriseId}`).then(res => res.data),

    /**
     * Phê duyệt hoặc thay đổi trạng thái xác thực doanh nghiệp
     * Endpoint: PATCH /api/v1/enterprises/{enterpriseId}/verification-status
     * Body: { "status": "VERIFIED" | "REJECTED" | "PENDING" }
     */
    updateVerificationStatus: (enterpriseId, status) => 
        api.patch(`/v1/enterprises/${enterpriseId}/verification-status`, { status }).then(res => res.data)
};