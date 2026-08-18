import api from './api';

export const cvService = {
    // --- CRUD ---
    create: (data) => api.post('/v1/cvs', data).then(res => res.data),
    getMyCvs: (params) => api.get('/v1/cvs/me', { params }).then(res => res.data),
    getPublicCv: (cvId) => api.get(`/v1/cvs/public/${cvId}`).then(res => res.data),

    /** Lấy CV công khai mặc định của một sinh viên */
    getStudentPublicCv: async (studentId) => {
        const profileRes = await api.get(`/v1/students/${studentId}/public`).then(res => res.data);
        const studentData = (profileRes && profileRes.data) ? profileRes.data : {};
        const cvList = studentData.cvs || [];
        const defaultCv = cvList.find(cv => cv.isDefault) || cvList[0];
        if (!defaultCv) return profileRes;
        return await api.get(`/v1/cvs/public/${defaultCv.cvId}`).then(res => res.data);
    },

    /** Lấy hồ sơ công khai của sinh viên */
    getStudentPublicProfile: (studentId) => api.get(`/v1/students/${studentId}/public`).then(res => res.data),

    // Lấy chi tiết 1 CV công khai để hiển thị
    getPublicCvDetail: (cvId) => api.get(`/v1/cvs/public/${cvId}`).then(res => res.data),
    getCvDetail: (cvId) => api.get(`/v1/cvs/${cvId}`).then(res => res.data),
    updateCv: (cvId, data) => api.put(`/v1/cvs/${cvId}`, data).then(res => res.data),
    deleteCv: (cvId) => api.delete(`/v1/cvs/${cvId}`).then(res => res.data),

    // --- Visibility & Default ---
    updateVisibility: (cvId, data) => api.patch(`/v1/cvs/${cvId}/visibility`, data).then(res => res.data),
    setDefault: (cvId) => api.patch(`/v1/cvs/${cvId}/default`).then(res => res.data),
};
