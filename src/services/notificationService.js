import api from './api';

export const notificationService = {
    getMyNotifications: () => api.get('/v1/notifications/me').then(res => res.data),
    markAsRead: (notificationId) => api.patch(`/v1/notifications/${notificationId}/read`).then(res => res.data),
    markAllAsRead: () => api.patch('/v1/notifications/me/read-all').then(res => res.data),
    adminSendNotification: (data) => api.post('/v1/notifications/admin/send', data).then(res => res.data),
};
