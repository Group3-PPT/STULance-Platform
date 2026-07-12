import api from './api';

export const contractSignatureService = {
    getContractSignatures: (contractId) =>
        api.get(`/v1/contracts/${contractId}/signatures`).then(res => res.data),

    signContract: (contractId, signatureBlob, signerRole) => {
        const formData = new FormData();
        formData.append('SignatureImageFile', signatureBlob, 'signature.png');
        return api.post(`/v1/contracts/${contractId}/signatures`, formData, {
            params: { SignerRole: signerRole },
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data);
    }
};
