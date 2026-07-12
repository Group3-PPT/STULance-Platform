import api from './api';

export const profileService = {
    getBasicProfile: () => api.get('/v1/profiles/me').then(res => res.data),
    updateBasicProfile: (data) => api.put('/v1/profiles/me', data).then(res => res.data),
    updateAvatar: (avatarUrl) => api.put('/v1/profiles/me/avatar', { avatarUrl }).then(res => res.data),
    getPublicProfile: (userId) => api.get(`/v1/profiles/${userId}/public`).then(res => res.data),
};