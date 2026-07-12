import api from './api';

export const adminService = {
    // ==========================================
    // 1. QUẢN LÝ NGƯỜI DÙNG & XÁC THỰC
    // ==========================================
    
    /** Duyệt xác thực sinh viên (Tích xanh) */
    verifyStudent: (studentId, status) => 
        api.patch(`/v1/students/${studentId}/verification-status`, { status }).then(res => res.data),

    /** Duyệt xác thực doanh nghiệp (Tích xanh) */
    verifyEnterprise: (enterpriseId, status) => 
        api.patch(`/v1/enterprises/${enterpriseId}/verification-status`, { status }).then(res => res.data),


    // ==========================================
    // 2. QUẢN LÝ BÀI ĐĂNG VIỆC LÀM (JOBS)
    // ==========================================

    /** Lấy tất cả tin tuyển dụng hệ thống */
    getAllJobs: (params) => api.get('/v1/jobs/admin', { params }).then(res => res.data),

    /** Xem chi tiết tin tuyển dụng dưới quyền Admin */
    getJobDetail: (jobId) => api.get(`/v1/jobs/admin/${jobId}`).then(res => res.data),

    /** Duyệt hoặc Từ chối bài đăng việc làm (APPROVED/REJECTED) */
    updateJobStatus: (jobId, status) => 
        api.patch(`/v1/jobs/admin/${jobId}/status`, { status }).then(res => res.data),


    // ==========================================
    // 3. QUẢN LÝ DỊCH VỤ SINH VIÊN (STUDENT SERVICES)
    // ==========================================

    /** Lấy tất cả gói dịch vụ sinh viên đang rao bán */
    getAllStudentServices: (params) => api.get('/v1/student-services/admin', { params }).then(res => res.data),

    /** Duyệt hoặc Khóa gói dịch vụ (APPROVED/REJECTED/HIDDEN) */
    updateServiceStatus: (serviceId, status) => 
        api.patch(`/v1/student-services/admin/${serviceId}/status`, { status }).then(res => res.data),


    // ==========================================
    // 4. QUẢN LÝ DANH MỤC KỸ NĂNG (SKILLS)
    // ==========================================

    /** Xem các kỹ năng đang chờ duyệt */
    getPendingSkills: (params) => api.get('/v1/skills/pending', { params }).then(res => res.data),

    /** Duyệt kỹ năng sinh viên đề xuất */
    approveSkill: (skillId) => api.patch(`/v1/skills/${skillId}/approve`).then(res => res.data),

    /** Gộp các kỹ năng trùng lặp (VD: Js -> JavaScript) */
    mergeSkill: (sourceId, targetId) => 
        api.patch(`/v1/skills/${sourceId}/merge`, { targetSkillId: targetId }).then(res => res.data),

    /** Admin tạo/sửa/xóa kỹ năng trong danh mục hệ thống */
    createSkill: (name) => api.post('/v1/skills', { skillName: name }).then(res => res.data),
    updateSkill: (id, name) => api.put(`/v1/skills/${id}`, { skillName: name }).then(res => res.data),
    deleteSkill: (id) => api.delete(`/v1/skills/${id}`).then(res => res.data),


    // ==========================================
    // 5. QUẢN LÝ GIAO DỊCH & HỢP ĐỒNG (CONTRACTS)
    // ==========================================

    /** Theo dõi toàn bộ hợp đồng trên sàn */
    getAllContracts: (params) => api.get('/v1/contracts/admin', { params }).then(res => res.data),

    /** Phân xử tranh chấp hợp đồng giữa DN và SV */
    resolveContractDispute: (contractId, resolutionData) => 
        api.patch(`/v1/contracts/admin/${contractId}/resolve-dispute`, resolutionData).then(res => res.data),

    /** Hủy hợp đồng cưỡng chế */
    cancelContractAdmin: (contractId) => api.patch(`/v1/contracts/admin/${contractId}/cancel`).then(res => res.data),


    // ==========================================
    // 6. QUẢN LÝ ĐƠN HÀNG DỊCH VỤ (SERVICE ORDERS)
    // ==========================================

    /** Xem toàn bộ đơn đặt hàng dịch vụ */
    getAllServiceOrders: (params) => api.get('/v1/service-orders/admin', { params }).then(res => res.data),

    /** Hủy đơn hàng dịch vụ cưỡng chế */
    cancelServiceOrderAdmin: (orderId) => api.patch(`/v1/service-orders/admin/${orderId}/cancel`).then(res => res.data),
};