import api from './api';

export const contractService = {
    // ==========================================
    // 1. TẠO HỢP ĐỒNG (DÀNH CHO DOANH NGHIỆP)
    // ==========================================
    
    /** Tạo hợp đồng từ một đơn thầu đã chọn */
    createFromBid: (bidId) => api.post(`/v1/contracts/from-bid/${bidId}`).then(res => res.data),

    /** Tạo hợp đồng từ một đơn đặt hàng dịch vụ sinh viên */
    createFromServiceOrder: (orderId) => api.post(`/v1/contracts/from-service-order/${orderId}`).then(res => res.data),


    // ==========================================
    // 2. DÀNH CHO CẢ SINH VIÊN & DOANH NGHIỆP
    // ==========================================

    /** Lấy danh sách hợp đồng của tôi (Đang làm, đã xong, tranh chấp) */
    getMyContracts: () => api.get('/v1/contracts/me').then(res => res.data),

    /** Xem chi tiết nội dung hợp đồng, điều khoản và tiến độ */
    getContractDetail: (contractId) => api.get(`/v1/contracts/${contractId}`).then(res => res.data),

    /** Hủy bỏ hợp đồng (Thỏa thuận giữa 2 bên) */
    cancelContract: (contractId) => api.patch(`/v1/contracts/${contractId}/cancel`).then(res => res.data),

    /** Xác nhận hoàn thành công việc và giải ngân tiền cho SV */
    completeContract: (contractId) => api.patch(`/v1/contracts/${contractId}/complete`).then(res => res.data),

    /** Khiếu nại/Báo cáo tranh chấp khi có vấn đề xảy ra */
    disputeContract: (contractId) => api.patch(`/v1/contracts/${contractId}/dispute`).then(res => res.data),


    // ==========================================
    // 3. DÀNH CHO ADMIN (QUẢN TRỊ VIÊN)
    // ==========================================

    /** Admin theo dõi toàn bộ hợp đồng trên hệ thống */
    adminGetAllContracts: () => api.get('/v1/contracts/admin').then(res => res.data),

    /** Admin xem chi tiết hợp đồng để xử lý tranh chấp */
    adminGetContractDetail: (contractId) => api.get(`/v1/contracts/admin/${contractId}`).then(res => res.data),

    /** 
     * Admin phân xử tranh chấp 
     * Body thường chứa phương án giải quyết (ví dụ: hoàn tiền bao nhiêu %)
     */
    adminResolveDispute: (contractId, data) => 
        api.patch(`/v1/contracts/admin/${contractId}/resolve-dispute`, data).then(res => res.data),
};