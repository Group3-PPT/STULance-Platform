import api from './api';

export const paymentService = {
    /** 
     * Tạo mã QR VNPAY để nạp tiền vào ví
     * Endpoint: POST /api/v1/payments/deposit
     */
    createDeposit: (amount) => 
        api.post('/v1/payments/deposit', { amount }).then(res => res.data),

    /** 
     * Tạo mã QR VNPAY để thanh toán cho một hợp đồng cụ thể
     * Endpoint: POST /api/v1/contracts/{contractId}/payments/vnpay-qr
     * Response: Thường trả về một URL để chuyển hướng sang VNPAY
     */
    createVnpayQr: (contractId) => 
        api.post(`/v1/contracts/${contractId}/payments/vnpay-qr`).then(res => res.data),

    /** 
     * Lấy lịch sử giao dịch của tôi (Nạp tiền, Thanh toán, Nhận tiền)
     * Endpoint: GET /api/v1/payments/me
     */
    getMyPayments: () => api.get('/v1/payments/me').then(res => res.data),

    /** 
     * Xem chi tiết một giao dịch cụ thể
     * Endpoint: GET /api/v1/payments/{paymentId}
     */
    getPaymentDetail: (paymentId) => 
        api.get(`/v1/payments/${paymentId}`).then(res => res.data),

    /** 
     * Xử lý kết quả trả về từ VNPAY (Dùng cho trang Return của Frontend)
     * Endpoint: GET /api/v1/payments/vnpay/return
     * params: Toàn bộ query string mà VNPAY gửi về trên URL
     */
    handleVnpayReturn: (params) => 
        api.get('/v1/payments/vnpay/return', { params }).then(res => res.data),

    /** 
     * Endpoint IPN để Backend nhận thông báo từ VNPAY (Thường dùng server-to-server)
     * Tuy nhiên vẫn khai báo nếu Frontend cần giả lập hoặc kiểm tra
     */
    handleVnpayIpn: (params) => 
        api.get('/v1/payments/vnpay/ipn', { params }).then(res => res.data),
};