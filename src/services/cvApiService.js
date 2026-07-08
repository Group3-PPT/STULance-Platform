import api from './api';

export const cvService = {
    // --- CRUD ---
    create: (data) => api.post('/v1/cvs', data).then(res => res.data),
    getMyCvs: () => api.get('/v1/cvs/me').then(res => res.data),
    getPublicCv: (cvId) => api.get(`/v1/cvs/public/${cvId}`).then(res => res.data),
    getCvDetail: (cvId) => api.get(`/v1/cvs/${cvId}`).then(res => res.data),
    updateCv: (cvId, data) => api.put(`/v1/cvs/${cvId}`, data).then(res => res.data),
    deleteCv: (cvId) => api.delete(`/v1/cvs/${cvId}`).then(res => res.data),

    // --- Visibility & Default ---
    updateVisibility: (cvId, data) => api.patch(`/v1/cvs/${cvId}/visibility`, data).then(res => res.data),
    setDefault: (cvId) => api.patch(`/v1/cvs/${cvId}/default`).then(res => res.data),
};
