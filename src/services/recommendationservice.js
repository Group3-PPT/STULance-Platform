import api from './api';

export const recommendationService = {
    /** Lấy danh sách đề xuất việc làm/dịch vụ phù hợp cho user hiện tại */
    getMyRecommendations: (params) =>
        api.get('/v1/recommendations/me', { params }).then(res => res.data),
};
