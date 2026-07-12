import api from './api';

export const studentServiceService = {
    // --- DÀNH CHO PUBLIC (Khách & Người mua) ---
    /** 
     * Lấy danh sách dịch vụ (Hỗ trợ Search/Filter)
     * params: { keyword, category, minPrice, maxPrice }
     */
   getAllPublic: (params) => api.get('/v1/student-services', { params }).then(res => res.data),

    getDetail: (id) => api.get(`/v1/student-services/${id}`).then(res => res.data),

    createOrder: (serviceId, data) => api.post(`/v1/service-orders/services/${serviceId}`, data).then(res => res.data),


    // --- DÀNH CHO SINH VIÊN (Người bán) ---
    /** Lấy danh sách dịch vụ của chính mình */
    getMyServices: (params) => api.get('/v1/student-services/me', { params }).then(res => res.data),

    /** Tạo dịch vụ mới */
    createService: (data) => api.post('/v1/student-services', data).then(res => res.data),

    /** Cập nhật dịch vụ */
    updateService: (id, data) => api.put(`/v1/student-services/${id}`, data).then(res => res.data),

    /** Xóa mềm dịch vụ (Chuyển sang DELETED) */
    deleteService: (id) => api.delete(`/v1/student-services/${id}`).then(res => res.data),


    // --- DÀNH CHO ADMIN (Quản trị viên) ---
    /** Admin lấy toàn bộ danh sách dịch vụ hệ thống */
    adminGetAll: (params) => api.get('/v1/student-services/admin', { params }).then(res => res.data),

    /** Admin xem chi tiết dịch vụ bất kỳ */
    adminGetDetail: (id) => api.get(`/v1/student-services/admin/${id}`).then(res => res.data),

    /** 
     * Admin cập nhật trạng thái 
     * status: "ACTIVE", "HIDDEN", "BLOCKED", "DELETED"
     */
    adminUpdateStatus: (id, status) => 
        api.patch(`/v1/student-services/admin/${id}/status`, { status }).then(res => res.data),
};