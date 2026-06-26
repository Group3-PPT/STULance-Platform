import api from './api';

export const savedItemsService = {
    // ==========================================
    // 1. QUẢN LÝ VIỆC LÀM ĐÃ LƯU (SAVED JOBS)
    // ==========================================
    
    /** Lưu một công việc vào danh sách yêu thích */
    saveJob: (jobId) => 
        api.post(`/v1/saved-items/jobs/${jobId}`).then(res => res.data),

    /** Bỏ lưu công việc */
    unsaveJob: (jobId) => 
        api.delete(`/v1/saved-items/jobs/${jobId}`).then(res => res.data),

    /** Lấy danh sách tất cả công việc tôi đã lưu */
    getMySavedJobs: () => 
        api.get('/v1/saved-items/jobs/me').then(res => res.data),


    // ==========================================
    // 2. QUẢN LÝ DỊCH VỤ ĐÃ LƯU (SAVED SERVICES)
    // ==========================================

    /** Lưu một dịch vụ sinh viên vào danh sách yêu thích */
    saveService: (serviceId) => 
        api.post(`/v1/saved-items/student-services/${serviceId}`).then(res => res.data),

    /** Bỏ lưu dịch vụ */
    unsaveService: (serviceId) => 
        api.delete(`/v1/saved-items/student-services/${serviceId}`).then(res => res.data),

    /** Lấy danh sách tất cả dịch vụ tôi đã lưu */
    getMySavedServices: () => 
        api.get('/v1/saved-items/student-services/me').then(res => res.data),


    // ==========================================
    // 3. TIỆN ÍCH (UTILITIES)
    // ==========================================

    /** 
     * Dọn dẹp danh sách đã lưu 
     * Xóa các mục không còn khả dụng (Tin tuyển dụng hết hạn, dịch vụ bị ẩn...)
     */
    clearUnavailableItems: () => 
        api.delete('/v1/saved-items/me/unavailable').then(res => res.data),
};