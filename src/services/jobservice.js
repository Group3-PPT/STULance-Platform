import api from './api';

export const jobService = {
    // Enterprise: Đăng tin
    postJob: (data) => api.post('/v1/jobs', data).then(res => res.data),
    
    // Enterprise: Lấy tin của tôi
    getMyJobs: () => api.get('/v1/jobs/me').then(res => res.data),
    
    // Admin: Lấy tất cả tin
    adminGetAllJobs: () => api.get('/v1/jobs/admin').then(res => res.data),
    
    // Admin: Duyệt/Từ chối tin
    adminUpdateStatus: (jobId, status) => 
        api.patch(`/v1/jobs/admin/${jobId}/status`, { status }).then(res => res.data),

    // Các hàm khác
    deleteJob: (id) => api.delete(`/v1/jobs/${id}`).then(res => res.data),
    updateJob: (id, data) => api.put(`/v1/jobs/${id}`, data).then(res => res.data)
};