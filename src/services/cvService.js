import api from './api';

export const cvService = {
    // --- Student ---
    getMyCvs: (params) => api.get('/v1/cvs/me', { params }).then(res => res.data),
    getCvDetail: (cvId) => api.get(`/v1/cvs/${cvId}`).then(res => res.data),
    createCv: (data) => api.post('/v1/cvs', data).then(res => res.data),
    updateCv: (cvId, data) => api.put(`/v1/cvs/${cvId}`, data).then(res => res.data),
    deleteCv: (cvId) => api.delete(`/v1/cvs/${cvId}`).then(res => res.data),
    setDefaultCv: (cvId) => api.patch(`/v1/cvs/${cvId}/default`).then(res => res.data),
    updateVisibility: (cvId, data) => api.patch(`/v1/cvs/${cvId}/visibility`, data).then(res => res.data),

    // --- Public ---
    getPublicCv: (cvId) => api.get(`/v1/cvs/public/${cvId}`).then(res => res.data),
};
