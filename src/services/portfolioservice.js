import api from './api';

export const portfolioService = {
    // Lấy danh sách dự án của tôi (Dành cho trang quản lý)
    // Endpoint: GET /api/v1/portfolios/me
    getMyPortfolios: () => api.get('/v1/portfolios/me').then(res => res.data),

    // Thêm dự án mới
    // Endpoint: POST /api/v1/portfolios
    // Body: { title, description, projectUrl, imageUrl }
    createPortfolio: (data) => api.post('/v1/portfolios', data).then(res => res.data),

    // Cập nhật dự án
    // Endpoint: PUT /api/v1/portfolios/{portfolioId}
    updatePortfolio: (id, data) => api.put(`/v1/portfolios/${id}`, data).then(res => res.data),

    // Xóa dự án
    // Endpoint: DELETE /api/v1/portfolios/{portfolioId}
    deletePortfolio: (id) => api.delete(`/v1/portfolios/${id}`).then(res => res.data),

    // Xem dự án của sinh viên khác (Dành cho nhà tuyển dụng)
    // Endpoint: GET /api/v1/portfolios/student/{studentId}
    getStudentPortfolios: (studentId) => api.get(`/v1/portfolios/student/${studentId}`).then(res => res.data)

    
};