import axios from 'axios';

const backendUrl = `http://${process.env.VUE_APP_SERVER_IP}:${process.env.VUE_APP_SERVER_PORT}`;

// Create axios instance with default config
const api = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token and logging
api.interceptors.request.use(
  (config) => {
    console.log('[DEBUG] Preparing user request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL
    });

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[DEBUG] Added auth token to user request');
    } else {
      console.warn('[DEBUG] No auth token available for user request');
    }

    return config;
  },
  (error) => {
    console.error('[DEBUG] User request interceptor error:', {
      message: error.message,
      config: error.config
    });
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('[DEBUG] User response received:', {
      url: response.config.url,
      status: response.status,
      dataPresent: !!response.data
    });
    return response;
  },
  (error) => {
    console.error('[DEBUG] User response error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// User profile management
export const getUserInfo = async () => {
  console.log('[DEBUG] Fetching user info');
  try {
    const response = await api.get('/users/me');
    console.log('[DEBUG] User info received:', response.data);
    return response.data;
  } catch (error) {
    console.error('[DEBUG] Error fetching user info:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData) => {
  console.log('[DEBUG] Updating user profile:', userData);
  try {
    const response = await api.put('/users/me', userData);
    console.log('[DEBUG] Profile update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[DEBUG] Error updating user profile:', error);
    throw error;
  }
};

export const updateUserPassword = async (passwordData) => {
  console.log('[DEBUG] Updating user password');
  try {
    const response = await api.put('/users/me/password', passwordData);
    console.log('[DEBUG] Password update successful');
    return response.data;
  } catch (error) {
    console.error('[DEBUG] Error updating password:', error);
    throw error;
  }
};

export const deleteUserAccount = async () => {
  console.log('[DEBUG] Deleting user account');
  try {
    const response = await api.delete('/users/me');
    console.log('[DEBUG] Account deletion successful');
    return response.data;
  } catch (error) {
    console.error('[DEBUG] Error deleting user account:', error);
    throw error;
  }
};

// Family management
export const getFamilyMembers = async (familyId) => {
  console.log('[DEBUG] Fetching family members for family:', familyId);
  try {
    const response = await api.get(`/users/family/${familyId}`);
    console.log('[DEBUG] Family members received:', response.data);
    return response.data;
  } catch (error) {
    console.error('[DEBUG] Error fetching family members:', error);
    throw error;
  }
};

export const addFamilyMember = async (userId, role) => {
  console.log('[DEBUG] Adding family member:', { userId, role });
  try {
    const response = await api.post('/family/members', { userId, role });
    console.log('[DEBUG] Family member added:', response.data);
    return response.data;
  } catch (error) {
    console.error('[DEBUG] Error adding family member:', error);
    throw error;
  }
};

export const updateFamilyMemberRole = async (userId, role) => {
  console.log('[DEBUG] Updating family member role:', { userId, role });
  try {
    const response = await api.put(`/family/members/${userId}/role`, { role });
    console.log('[DEBUG] Family member role updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('[DEBUG] Error updating family member role:', error);
    throw error;
  }
};

export const removeFamilyMember = async (userId) => {
  console.log('[DEBUG] Removing family member:', userId);
  try {
    const response = await api.delete(`/family/members/${userId}`);
    console.log('[DEBUG] Family member removed:', response.data);
    return response.data;
  } catch (error) {
    console.error('[DEBUG] Error removing family member:', error);
    throw error;
  }
};

// User search
export const searchUsers = async (query) => {
  console.log('[DEBUG] Searching users:', query);
  try {
    const response = await api.get('/users/search', { params: { q: query } });
    console.log('[DEBUG] User search results:', response.data);
    return response.data;
  } catch (error) {
    console.error('[DEBUG] Error searching users:', error);
    throw error;
  }
};

// Profile image
export const uploadProfileImage = async (imageFile) => {
  console.log('[DEBUG] Uploading profile image');
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/users/me/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('[DEBUG] Profile image uploaded:', response.data);
    return response.data;
  } catch (error) {
    console.error('[DEBUG] Error uploading profile image:', error);
    throw error;
  }
};
