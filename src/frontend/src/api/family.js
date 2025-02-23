import apiClient from './index';

export const createFamily = payload =>
    apiClient.post('/family/create', payload);
export const joinFamily = joinCode =>
    apiClient.post('/family/join', { joinCode });
export const inviteToFamily = email =>
    apiClient.post('/family/invite', { email });
export const promoteMember = userId =>
    apiClient.post('/family/promote', { userId });
export const demoteMember = userId =>
    apiClient.post('/family/demote', { userId });
export const getFamilyMembers = familyId =>
    apiClient.get(`/family/${familyId}/members`);
export const removeFamilyMember = userId =>
    apiClient.delete(`/family/member/${userId}`);
