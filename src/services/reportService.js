import api from './api';

export const reportService = {
    // --- User ---
    createReport: (data) => api.post('/v1/reports', data).then(res => res.data),
    getMyReports: () => api.get('/v1/reports/me').then(res => res.data),
    getMyReportDetail: (reportId) => api.get(`/v1/reports/me/${reportId}`).then(res => res.data),

    // --- Admin ---
    adminGetAllReports: () => api.get('/v1/reports/admin').then(res => res.data),
    adminGetReportDetail: (reportId) => api.get(`/v1/reports/admin/${reportId}`).then(res => res.data),
    adminUpdateStatus: (reportId, data) => api.patch(`/v1/reports/admin/${reportId}/status`, data).then(res => res.data),
};
