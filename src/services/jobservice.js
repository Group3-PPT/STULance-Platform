import api from './api';

export const jobService = {
    // ==========================================
    // 1. DÀNH CHO PUBLIC (Sinh viên & Khách)
    // ==========================================
    
    /** 
     * Lấy danh sách việc làm đã được duyệt công khai
     * Endpoint: GET /api/v1/jobs
     */
    getAllPublicJobs: () => api.get('/v1/jobs').then(res => res.data),

    /** 
     * Xem chi tiết một bài đăng tuyển dụng công khai
     * Endpoint: GET /api/v1/jobs/{jobId}
     */
    getPublicJobDetail: (jobId) => api.get(`/v1/jobs/${jobId}`).then(res => res.data),


    // ==========================================
    // 2. DÀNH CHO DOANH NGHIỆP (ENTERPRISE)
    // ==========================================

    /** 
     * Đăng tin tuyển dụng mới
     * Endpoint: POST /api/v1/jobs
     */
    postJob: (data) => api.post('/v1/jobs', data).then(res => res.data),

    /** 
     * Lấy danh sách tin tuyển dụng của doanh nghiệp đang đăng nhập
     * Endpoint: GET /api/v1/jobs/me
     */
    getMyJobs: () => api.get('/v1/jobs/me').then(res => res.data),

    /** 
     * Xem chi tiết tin tuyển dụng (Dành cho chủ sở hữu)
     * Endpoint: GET /api/v1/jobs/me/{jobId}
     */
    getMyJobDetail: (jobId) => api.get(`/v1/jobs/me/${jobId}`).then(res => res.data),

    /** 
     * Cập nhật nội dung bài đăng
     * Endpoint: PUT /api/v1/jobs/{jobId}
     */
    updateJob: (jobId, data) => api.put(`/v1/jobs/${jobId}`, data).then(res => res.data),

    /** 
     * Xóa bài đăng tuyển dụng
     * Endpoint: DELETE /api/v1/jobs/{jobId}
     */
    deleteJob: (jobId) => api.delete(`/v1/jobs/${jobId}`).then(res => res.data),


    // ==========================================
    // 3. DÀNH CHO ADMIN (QUẢN TRỊ VIÊN)
    // ==========================================

    /** 
     * Admin lấy toàn bộ danh sách việc làm hệ thống
     * Endpoint: GET /api/v1/jobs/admin
     */
    adminGetAllJobs: () => api.get('/v1/jobs/admin').then(res => res.data),

    /** 
     * Admin xem chi tiết tin tuyển dụng bất kỳ
     * Endpoint: GET /api/v1/jobs/admin/{jobId}
     */
    adminGetJobDetail: (jobId) => api.get(`/v1/jobs/admin/${jobId}`).then(res => res.data),

    /** 
     * Admin thay đổi trạng thái bài đăng (Duyệt/Từ chối)
     * Endpoint: PATCH /api/v1/jobs/admin/{jobId}/status
     * Body: { status: "APPROVED" | "REJECTED" }
     */
    adminUpdateStatus: (jobId, status) => 
        api.patch(`/v1/jobs/admin/${jobId}/status`, { status }).then(res => res.data),
};