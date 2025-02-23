import apiClient from './index';

export const register = user => apiClient.post('/auth/register', user);
export const login = credentials => apiClient.post('/auth/login', credentials);
export const verifyEmail = token => apiClient.get(`/auth/verify-email/${token}`);
export const editProfile = data => apiClient.put('/auth/edit', data);
export const logout = () => apiClient.post('/auth/logout');
export const requestPasswordReset = email => apiClient.post('/auth/request-password-reset', { email });
export const resetPassword = (token, newPassword) => apiClient.post(`/auth/reset-password/${token}`, { password: newPassword });
export const getUserInfo = () => apiClient.get('/auth/me');
