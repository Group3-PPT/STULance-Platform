import api from './api';

export const userService = {
    // --- Self ---
    getMe: () => api.get('/v1/users/me').then(res => res.data),

    // --- Admin ---
    adminGetAllUsers: (params) => api.get('/v1/users', { params }).then(res => res.data),
    adminGetEnterpriseUsers: (params) => api.get('/v1/users/enterprise', { params }).then(res => res.data),
    adminGetStudentUsers: (params) => api.get('/v1/users/student', { params }).then(res => res.data),
    adminGetUserDetail: (userId) => api.get(`/v1/users/${userId}`).then(res => res.data),
    adminUpdateUserStatus: (userId, status, reason) =>
        api.patch(`/v1/users/${userId}/status`, { status, reason }).then(res => res.data),
    getUserByUsername: (userName) => api.get(`/v1/users/name/${userName}`).then(res => res.data),
};
