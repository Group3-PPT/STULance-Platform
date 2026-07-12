import api from './api';

export const optionsService = {
    // 1. Nhóm Quyền & Người dùng
    getSystemRoles: () => api.get('/v1/options/system-roles').then(res => res.data),
    getUserStatuses: () => api.get('/v1/options/user-statuses').then(res => res.data),
    getVerificationStatuses: () => api.get('/v1/options/verification-statuses').then(res => res.data),

    // 2. Nhóm Kỹ năng & Công việc
    getSkillStatuses: () => api.get('/v1/options/skill-statuses').then(res => res.data),
    getJobStatuses: () => api.get('/v1/options/job-statuses').then(res => res.data),
    getJobRequesterTypes: () => api.get('/v1/options/job-requester-types').then(res => res.data),

    // 3. Nhóm Đấu thầu & Hợp đồng
    getBidStatuses: () => api.get('/v1/options/bid-statuses').then(res => res.data),
    getContractStatuses: () => api.get('/v1/options/contract-statuses').then(res => res.data),
    getContractSignerRoles: () => api.get('/v1/options/contract-signer-roles').then(res => res.data),
    getContractDisputeResolutions: () => api.get('/v1/options/contract-dispute-resolutions').then(res => res.data),

    // 4. Nhóm Dịch vụ & Đơn hàng
    getStudentServiceStatuses: () => api.get('/v1/options/student-service-statuses').then(res => res.data),
    getServiceOrderStatuses: () => api.get('/v1/options/service-order-statuses').then(res => res.data),
    getServiceOrderBuyerTypes: () => api.get('/v1/options/service-order-buyer-types').then(res => res.data),

    // 5. Nhóm Thanh toán
    getPaymentStatuses: () => api.get('/v1/options/payment-statuses').then(res => res.data),
    getPaymentMethods: () => api.get('/v1/options/payment-methods').then(res => res.data),

    // 6. Nhóm Báo cáo & Rút tiền
    getReportStatuses: () => api.get('/v1/options/report-statuses').then(res => res.data),
    getWithdrawalStatuses: () => api.get('/v1/options/withdrawal-statuses').then(res => res.data),
};