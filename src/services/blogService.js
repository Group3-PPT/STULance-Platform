import api from './api';

export const blogService = {
    getAll: (params) => api.get('/v1/blogs', { params }).then(res => res.data),
    getById: (id) => api.get(`/v1/blogs/${id}`).then(res => res.data),
};
