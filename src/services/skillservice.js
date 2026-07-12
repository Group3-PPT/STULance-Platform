import api from './api';

export const skillService = {
    getApprovedSkills: (params) => api.get('/v1/skills', { params }).then(r => r.data),
    getPendingSkills: (params) => api.get('/v1/skills/pending', { params }).then(r => r.data),
    approveSkill: (id) => api.patch(`/v1/skills/${id}/approve`).then(r => r.data),
    rejectSkill: (id) => api.patch(`/v1/skills/${id}/reject`).then(r => r.data),
    mergeSkill: (sourceId, targetId) => api.patch(`/v1/skills/${sourceId}/merge`, { targetSkillId: targetId }).then(r => r.data),
    adminCreateSkill: (name) => api.post('/v1/skills', { skillName: name }).then(r => r.data),
    updateSkill: (id, name) => api.put(`/v1/skills/${id}`, { skillName: name }).then(r => r.data),
    deleteSkill: (id) => api.delete(`/v1/skills/${id}`).then(r => r.data)
};