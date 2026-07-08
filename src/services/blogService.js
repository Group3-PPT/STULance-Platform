import api from './api';

export const blogService = {
    getAll: () => api.get('/v1/blogs').then(res => res.data),
    getById: (id) => api.get(`/v1/blogs/${id}`).then(res => res.data),
};
