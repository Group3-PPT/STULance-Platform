import api from './api';

export const jobservice = {
    getAllJobs: (params) => api.get('/jobs', { params }),
    getJobById: (id) => api.get(`/jobs/${id}`),
    postJob: (jobData) => api.post('/jobs', jobData),
     getMyJobs: () => api.get('/v1/jobs/me').then(res => res.data),

    // Lấy chi tiết 1 bài đăng (để sửa)
    // Endpoint: GET /api/v1/jobs/me/{jobId}
    getMyJobDetail: (jobId) => api.get(`/v1/jobs/me/${jobId}`).then(res => res.data),

    // Xóa bài đăng
    // Endpoint: DELETE /api/v1/jobs/{jobId}
    deleteJob: (jobId) => api.delete(`/v1/jobs/${jobId}`).then(res => res.data),
    
    // Cập nhật bài đăng
    // Endpoint: PUT /api/v1/jobs/{jobId}
    updateJob: (jobId, data) => api.put(`/v1/jobs/${jobId}`, data).then(res => res.data)
};