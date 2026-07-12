import api from './api';

export const reportService = {
    // --- User ---
    createReport: (data) => api.post('/v1/reports', data).then(res => res.data),
    getMyReports: (params) => api.get('/v1/reports/me', { params }).then(res => res.data),
    getMyReportDetail: (reportId) => api.get(`/v1/reports/me/${reportId}`).then(res => res.data),

    // --- Admin ---
    adminGetAllReports: (params) => api.get('/v1/reports/admin', { params }).then(res => res.data),
    adminGetReportDetail: (reportId) => api.get(`/v1/reports/admin/${reportId}`).then(res => res.data),
    adminUpdateStatus: (reportId, data) => api.patch(`/v1/reports/admin/${reportId}/status`, data).then(res => res.data),
};
