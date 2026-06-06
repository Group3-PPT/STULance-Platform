import api from './api';

export const jobService = {
    getAllJobs: (params) => api.get('/jobs', { params }),
    getJobById: (id) => api.get(`/jobs/${id}`),
    postJob: (jobData) => api.post('/jobs', jobData),
};