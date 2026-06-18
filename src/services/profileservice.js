import api from './api';

export const profileService = {
    // Lấy thông tin cơ bản
    getBasicProfile: () => api.get('/v1/profiles/me').then(res => res.data),
    
    // Cập nhật thông tin cơ bản
    updateBasicProfile: (data) => api.put('/v1/profiles/me', data).then(res => res.data),
    
    // Cập nhật Avatar (Gửi link ảnh)
    updateAvatar: (avatarUrl) => api.put('/v1/profiles/me/avatar', { avatarUrl }).then(res => res.data)
};