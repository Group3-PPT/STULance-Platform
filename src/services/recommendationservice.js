import api from './api';

export const recommendationService = {
    /** Lấy danh sách đề xuất việc làm/dịch vụ phù hợp cho user hiện tại */
    getMyRecommendations: () => 
        api.get('/v1/recommendations/me').then(res => res.data),
};
