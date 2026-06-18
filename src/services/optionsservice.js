// src/services/optionsservice.js
import api from './api';

export const optionsService = {
    /**
     * Lấy danh sách các trạng thái của kỹ năng
     * Trả về: [{ value: "PENDING", label: "Chờ duyệt" }, ...]
     * Endpoint: GET /api/v1/options/skill-statuses
     */
    getSkillStatuses: async () => {
        try {
            const response = await api.get('/v1/options/skill-statuses');
            return response.data;
        } catch (error) {
            console.error("Lỗi lấy skill statuses:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách các trạng thái xác minh sinh viên
     * Trả về: [{ value: "VERIFIED", label: "Đã xác minh" }, ...]
     * Endpoint: GET /api/v1/options/verification-statuses
     */
    getVerificationStatuses: async () => {
        try {
            const response = await api.get('/v1/options/verification-statuses');
            return response.data;
        } catch (error) {
            console.error("Lỗi lấy verification statuses:", error);
            throw error;
        }
    }
};