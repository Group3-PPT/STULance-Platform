import api from './api';

export const studentService = {
    // 1. Lấy hồ sơ học vấn
    getProfile: () => api.get('/v1/students/me').then(res => res.data),

    // 2. Cập nhật hồ sơ học vấn
    updateProfile: (data) => api.put('/v1/students/me', data).then(res => res.data),

    // 3. LẤY KỸ NĂNG CỦA TÔI (Hàm này đang bị thiếu dẫn đến lỗi)
    getMySkills: () => api.get('/v1/students/me/skills').then(res => res.data),

    // 4. Cập nhật danh sách kỹ năng (truyền mảng ID)
    updateMySkills: (skillIds) => api.put('/v1/students/me/skills', { skillIds }).then(res => res.data),

    // 5. Đề xuất kỹ năng mới
    suggestSkill: (skillName) => api.post('/v1/students/me/skills/suggest', { skillName }).then(res => res.data),

    // 6. Lấy hồ sơ công khai
    getPublicProfile: (id) => api.get(`/v1/students/${id}`).then(res => res.data),
};