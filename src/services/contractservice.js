import api from './api';

export const contractService = {
    // ==========================================
    // 1. TẠO HỢP ĐỒNG
    // ==========================================
    createFromBid: (bidId, data) => api.post(`/v1/contracts/from-bid/${bidId}`, data).then(res => res.data),
    createFromServiceOrder: (orderId, data) => api.post(`/v1/contracts/from-service-order/${orderId}`, data).then(res => res.data),

    // ==========================================
    // 2. CẢ SINH VIÊN & DOANH NGHIỆP
    // ==========================================
    getMyContracts: (params) => api.get('/v1/contracts/me', { params }).then(res => res.data),
    getContractDetail: (contractId) => api.get(`/v1/contracts/${contractId}`).then(res => res.data),

    // --- Progress ---
    getProgress: (contractId) => api.get(`/v1/contracts/${contractId}/progress`).then(res => res.data),
    updateProgress: (contractId, data) => api.post(`/v1/contracts/${contractId}/progress`, data).then(res => res.data),

    // --- Deliveries ---
    getDeliveries: (contractId) => api.get(`/v1/contracts/${contractId}/deliveries`).then(res => res.data),
    submitDelivery: (contractId, data) => api.post(`/v1/contracts/${contractId}/deliveries`, data).then(res => res.data),

    // --- Actions ---
    cancelContract: (contractId) => api.patch(`/v1/contracts/${contractId}/cancel`).then(res => res.data),
    completeContract: (contractId) => api.patch(`/v1/contracts/${contractId}/complete`).then(res => res.data),
    disputeContract: (contractId, data) => api.patch(`/v1/contracts/${contractId}/dispute`, data).then(res => res.data),
    requestRevision: (contractId, data) => api.post(`/v1/contracts/${contractId}/request-revision`, data).then(res => res.data),

    // --- Cancellation Requests ---
    getCancellationRequests: (contractId) => api.get(`/v1/contracts/${contractId}/cancellation-requests`).then(res => res.data),
    createCancellationRequest: (contractId, data) => api.post(`/v1/contracts/${contractId}/cancellation-requests`, data).then(res => res.data),
    approveCancelRequest: (contractId) => api.patch(`/v1/contracts/${contractId}/cancellation-requests/approve`).then(res => res.data),
    rejectCancelRequest: (contractId) => api.patch(`/v1/contracts/${contractId}/cancellation-requests/reject`).then(res => res.data),

    // --- Evaluates ---
    getEvaluates: (contractId) => api.get(`/v1/contracts/${contractId}/evaluates`).then(res => res.data),
    submitEvaluate: (contractId, data) => api.post(`/v1/contracts/${contractId}/evaluates`, data).then(res => res.data),

    // ==========================================
    // 3. ADMIN
    // ==========================================
    adminGetAllContracts: (params) => api.get('/v1/contracts/admin', { params }).then(res => res.data),
    adminGetContractDetail: (contractId) => api.get(`/v1/contracts/admin/${contractId}`).then(res => res.data),
    adminResolveDispute: (contractId, data) => api.patch(`/v1/contracts/admin/${contractId}/resolve-dispute`, data).then(res => res.data),
};
