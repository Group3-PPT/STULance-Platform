import api from './api';

export const bidService = {
    // ==========================================
    // 1. DÀNH CHO SINH VIÊN (STUDENT)
    // ==========================================
    
    /** Lấy danh sách các công việc mình đã ứng tuyển */
    getMyBids: (params) => api.get('/v1/bids/me', { params }).then(res => res.data),

    /** Xem chi tiết một đơn ứng tuyển của mình */
    getMyBidDetail: (bidId) => api.get(`/v1/bids/me/${bidId}`).then(res => res.data),

    /** 
     * Đặt thầu/Ứng tuyển vào một dự án 
     * Body thường gồm: bidAmount, message, expectedDays...
     */
    createBid: (jobId, data) => api.post(`/v1/bids/jobs/${jobId}`, data).then(res => res.data),

    /** Chỉnh sửa lại giá thầu hoặc nội dung ứng tuyển */
    updateBid: (bidId, data) => api.put(`/v1/bids/${bidId}`, data).then(res => res.data),

    /** Rút đơn ứng tuyển (khi doanh nghiệp chưa duyệt) */
    withdrawBid: (bidId) => api.patch(`/v1/bids/${bidId}/withdraw`).then(res => res.data),


    // ==========================================
    // 2. DÀNH CHO DOANH NGHIỆP (ENTERPRISE)
    // ==========================================

    /** Xem danh sách tất cả các ứng viên đã ứng tuyển vào 1 dự án của mình */
    getJobBids: (jobId, params) => api.get(`/v1/bids/jobs/${jobId}`, { params }).then(res => res.data),

    /** Chấp nhận một sinh viên (Giao dự án) */
    acceptBid: (bidId) => api.patch(`/v1/bids/${bidId}/accept`).then(res => res.data),

    /** Từ chối đơn ứng tuyển của sinh viên */
    rejectBid: (bidId) => api.patch(`/v1/bids/${bidId}/reject`).then(res => res.data),


    // ==========================================
    // 3. DÀNH CHO ADMIN
    // ==========================================

    /** Lấy toàn bộ danh sách đấu thầu trên hệ thống */
    adminGetAllBids: (params) => api.get('/v1/bids/admin', { params }).then(res => res.data),

    /** Xem chi tiết thầu bất kỳ */
    adminGetBidDetail: (bidId) => api.get(`/v1/bids/admin/${bidId}`).then(res => res.data),

    /** Hủy bỏ một đơn thầu do vi phạm hoặc tranh chấp */
    adminCancelBid: (bidId) => api.patch(`/v1/bids/admin/${bidId}/cancel`).then(res => res.data),
};