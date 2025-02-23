import axios from 'axios';
import { getAuthHeader } from './auth';

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';

/**
 * Get user profile
 * @returns {Promise<Object>}
 */
export const getProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get profile');
  }
};

/**
 * Update user profile
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
export const updateProfile = async (userData) => {
  try {
    const response = await axios.put(`${API_URL}/users/profile`, userData, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

/**
 * Get user's family
 * @returns {Promise<Object>}
 */
export const getUserFamily = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/family`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get family information');
  }
};

/**
 * Get user settings
 * @returns {Promise<Object>}
 */
export const getUserSettings = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/settings`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get user settings');
  }
};

/**
 * Update user settings
 * @param {Object} settings
 * @returns {Promise<Object>}
 */
export const updateUserSettings = async (settings) => {
  try {
    const response = await axios.put(`${API_URL}/users/settings`, settings, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update settings');
  }
};

export default {
  getProfile,
  updateProfile,
  getUserFamily,
  getUserSettings,
  updateUserSettings
};