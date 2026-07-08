import api from './api';

export const withdrawalService = {
    // --- User ---
    createWithdrawal: (data) => api.post('/v1/withdrawals', data).then(res => res.data),
    getMyWithdrawals: () => api.get('/v1/withdrawals/me').then(res => res.data),
    getMyWithdrawalDetail: (id) => api.get(`/v1/withdrawals/me/${id}`).then(res => res.data),
    cancelWithdrawal: (id) => api.patch(`/v1/withdrawals/me/${id}/cancel`).then(res => res.data),

    // --- Admin ---
    adminGetAllWithdrawals: () => api.get('/v1/withdrawals/admin').then(res => res.data),
    adminGetWithdrawalDetail: (id) => api.get(`/v1/withdrawals/admin/${id}`).then(res => res.data),
    adminApprove: (id) => api.patch(`/v1/withdrawals/admin/${id}/approve`).then(res => res.data),
    adminReject: (id, data) => api.patch(`/v1/withdrawals/admin/${id}/reject`, data).then(res => res.data),
};
