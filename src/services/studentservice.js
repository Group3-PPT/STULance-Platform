import api from './api';
import axios from 'axios';

export const studentService = {
    // ==========================================
    // 1. DÀNH CHO SINH VIÊN (SELF-MANAGEMENT)
    // ==========================================
    
    /** Lấy hồ sơ học vấn của chính mình */
    getProfile: () => api.get('/v1/students/me').then(res => res.data),

    /** Cập nhật hồ sơ học vấn (studentCode, school, major, gpa, graduationYear, citizenId) */
    updateProfile: (data) => api.put('/v1/students/me', data).then(res => res.data),

    /** Lấy danh sách kỹ năng hiện tại trong hồ sơ của tôi */
    getMySkills: () => api.get('/v1/students/me/skills').then(res => res.data),

    /** Cập nhật danh sách ID kỹ năng (Chỉ gửi các ID của skill APPROVED) */
    updateMySkills: (skillIds) => api.put('/v1/students/me/skills', { skillIds }).then(res => res.data),

    /** Đề xuất kỹ năng mới chưa có trong hệ thống */
    suggestSkill: (skillName) => api.post('/v1/students/me/skills/suggest', { skillName }).then(res => res.data),


    // ==========================================
    // 2. DÀNH CHO PUBLIC (XEM HỒ SƠ)
    // ==========================================

    /** Xem hồ sơ công khai của một sinh viên (Dành cho doanh nghiệp xem Portfolio) */
    getPublicProfile: (studentId) => api.get(`/v1/students/${studentId}/public`).then(res => res.data),

    /** Lấy danh sách tất cả sinh viên (Dùng cho trang tìm kiếm ứng viên) */
    getAllStudents: () => {
        const role = localStorage.getItem('userRole');
        if (role === 'ADMIN' || role === 'pPDY5Dnk') {
            return api.get('/v1/students').then(res => res.data);
        }
        return studentService.getAllPublicStudents();
    },

    getAllPublicStudents: () => axios.get('/api/v1/students/public').then(res => res.data),


    // ==========================================
    // 3. DÀNH CHO ADMIN (QUẢN TRỊ)
    // ==========================================

    /** Admin lấy thông tin chi tiết một sinh viên bất kỳ */
    getStudentDetail: (studentId) => api.get(`/v1/students/${studentId}`).then(res => res.data),

    /** 
     * Admin cập nhật trạng thái xác thực sinh viên 
     * status: "VERIFIED", "REJECTED", "PENDING"
     */
    updateVerificationStatus: (studentId, status) => 
        api.patch(`/v1/students/${studentId}/verification-status`, { status }).then(res => res.data),
};