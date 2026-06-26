import api from './api';

export const roleService = {
    /** 
     * Lấy danh sách các vai trò được phép hiển thị ở trang đăng ký
     * Thường trả về: [ { "roleId": "...", "roleName": "STUDENT" }, { "roleId": "...", "roleName": "ENTERPRISE" } ]
     * Endpoint: GET /api/v1/roles/register-options
     */
    getRegisterOptions: () => 
        api.get('/v1/roles/register-options').then(res => res.data),

    /** 
     * Lấy danh sách tất cả các vai trò có trong hệ thống (Dành cho Admin)
     * Endpoint: GET /api/v1/roles
     */
    getAllRoles: () => 
        api.get('/v1/roles').then(res => res.data),

    /** 
     * Xem thông tin chi tiết của một vai trò
     * Endpoint: GET /api/v1/roles/{roleId}
     */
    getRoleDetail: (roleId) => 
        api.get(`/v1/roles/${roleId}`).then(res => res.data),

    /** 
     * Tạo một vai trò mới (Dành cho Admin)
     * Endpoint: POST /api/v1/roles
     */
    createRole: (roleData) => 
        api.post('/v1/roles', roleData).then(res => res.data),

    /** 
     * Cập nhật thông tin vai trò
     * Endpoint: PUT /api/v1/roles/{roleId}
     */
    updateRole: (roleId, roleData) => 
        api.put(`/v1/roles/${roleId}`, roleData).then(res => res.data),

    /** 
     * Xóa một vai trò khỏi hệ thống
     * Endpoint: DELETE /api/v1/roles/{roleId}
     */
    deleteRole: (roleId) => 
        api.delete(`/v1/roles/${roleId}`).then(res => res.data),
};