import api from './api';
import axios from 'axios';

const X_API_KEY = "STULANCE_SECRET_API_KEY_2026";

export const contractSignatureService = {
    getContractSignatures: (contractId) => 
        api.get(`/v1/contracts/${contractId}/signatures`).then(res => res.data),

    signContract: (contractId, signatureBlob, signerRole) => {
        const formData = new FormData();
        formData.append('SignatureImageFile', signatureBlob, 'signature.png');
        const token = localStorage.getItem('accessToken');
        return axios.post(`/api/v1/contracts/${contractId}/signatures`, formData, {
            params: { SignerRole: signerRole },
            headers: {
                'X-API-KEY': X_API_KEY,
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        }).then(res => res.data);
    }
};
