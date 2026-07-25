import { rawApi } from './api';

export const notificationService = {
    getMyNotifications: (params) => rawApi.get('/v1/notifications/me', { params }).then(res => res.data),
    markAsRead: (notificationId) => rawApi.patch(`/v1/notifications/${notificationId}/read`).then(res => res.data),
    markAllAsRead: () => rawApi.patch('/v1/notifications/me/read-all').then(res => res.data),
    adminSendNotification: (data) => rawApi.post('/v1/notifications/admin/send', data).then(res => res.data),
};
