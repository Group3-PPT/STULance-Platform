import api from './api';

export const serviceOrderService = {
    // ==========================================
    // 1. DÀNH CHO NGƯỜI MUA (BUYER - Có thể là Enterprise hoặc Student)
    // ==========================================
    
    /** 
     * Đặt mua một gói dịch vụ sinh viên 
     * Endpoint: POST /api/v1/service-orders/services/{serviceId}
     */
    createOrder: (serviceId, data) => 
        api.post(`/v1/service-orders/services/${serviceId}`, data).then(res => res.data),

    /** Lấy tất cả đơn hàng mà tôi đã mua */
    getMyBuyerOrders: (params) => 
        api.get('/v1/service-orders/buyer/me', { params }).then(res => res.data),

    getEnterpriseOrders: (params) => 
        api.get('/v1/service-orders/enterprise/me', { params }).then(res => res.data),

    getStudentBuyerOrders: (params) => 
        api.get('/v1/service-orders/student/me', { params }).then(res => res.data),


    // ==========================================
    // 2. DÀNH CHO NGƯỜI BÁN (PROVIDER - Sinh viên cung cấp dịch vụ)
    // ==========================================

    /** Lấy danh sách các đơn hàng khách đã đặt dịch vụ của mình */
    getMyProviderOrders: (params) => 
        api.get('/v1/service-orders/provider/me', { params }).then(res => res.data),

    /** Chấp nhận thực hiện đơn hàng */
    acceptOrder: (orderId) => 
        api.patch(`/v1/service-orders/${orderId}/accept`).then(res => res.data),

    /** Từ chối đơn hàng */
    rejectOrder: (orderId) => 
        api.patch(`/v1/service-orders/${orderId}/reject`).then(res => res.data),


    // ==========================================
    // 3. CHUNG (COMMON)
    // ==========================================

    /** Xem chi tiết một đơn hàng cụ thể */
    getOrderDetail: (orderId) => 
        api.get(`/v1/service-orders/${orderId}`).then(res => res.data),

    /** Hủy đơn hàng (Tùy thuộc vào trạng thái đơn hàng) */
    cancelOrder: (orderId) => 
        api.patch(`/v1/service-orders/${orderId}/cancel`).then(res => res.data),


    // ==========================================
    // 4. DÀNH CHO ADMIN
    // ==========================================

    /** Admin lấy toàn bộ danh sách đơn hàng dịch vụ hệ thống */
    adminGetAllOrders: (params) => 
        api.get('/v1/service-orders/admin', { params }).then(res => res.data),

    /** Admin xem chi tiết đơn hàng */
    adminGetOrderDetail: (orderId) => 
        api.get(`/v1/service-orders/admin/${orderId}`).then(res => res.data),

    /** Admin cưỡng chế hủy đơn hàng khi có vi phạm */
    adminCancelOrder: (orderId) => 
        api.patch(`/v1/service-orders/admin/${orderId}/cancel`).then(res => res.data),
};