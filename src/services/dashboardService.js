import api from './api';

export const dashboardService = {
    getStudentDashboard: () => api.get('/v1/dashboard/student').then(res => res.data),
    getEnterpriseDashboard: () => api.get('/v1/dashboard/enterprise').then(res => res.data),
    getAdminDashboard: () => api.get('/v1/dashboard/admin').then(res => res.data),
};
