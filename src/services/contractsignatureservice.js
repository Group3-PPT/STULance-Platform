import api from './api';

export const contractSignatureService = {
    /** 
     * Lấy danh sách các chữ ký của một hợp đồng
     * Dùng để kiểm tra xem bên kia đã ký chưa
     * Endpoint: GET /api/v1/contracts/{contractId}/signatures
     */
    getContractSignatures: (contractId) => 
        api.get(`/v1/contracts/${contractId}/signatures`).then(res => res.data),

    /** 
     * Thực hiện ký hợp đồng điện tử
     * Endpoint: POST /api/v1/contracts/{contractId}/signatures
     * Body thường chứa: { "signatureData": "chuỗi_base64_ảnh_chữ_ký" hoặc "mã_otp" }
     */
    signContract: (contractId, signatureData) => 
        api.post(`/v1/contracts/${contractId}/signatures`, signatureData).then(res => res.data)
};