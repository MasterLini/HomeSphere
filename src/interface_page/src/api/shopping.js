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
    console.log('[DEBUG] Preparing shopping list request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL
    });

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[DEBUG] Added auth token to shopping list request');
    } else {
      console.warn('[DEBUG] No auth token available for shopping list request');
    }

    return config;
  },
  (error) => {
    console.error('[DEBUG] Shopping list request interceptor error:', {
      message: error.message,
      config: error.config
    });
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('[DEBUG] Shopping list response received:', {
      url: response.config.url,
      status: response.status,
      dataPresent: !!response.data
    });
    return response;
  },
  (error) => {
    console.error('[DEBUG] Shopping list response error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const getShoppingLists = async () => {
  console.log('[DEBUG] Fetching shopping lists');
  try {
    const response = await api.get('/shopping/lists');
    console.log('[DEBUG] Shopping lists fetch response:', {
      status: response.status,
      dataLength: Array.isArray(response.data) ? response.data.length : 'not an array',
      data: response.data
    });
    return response.data;
  } catch (error) {
    console.error('[DEBUG] Error fetching shopping lists:', error);
    throw error;
  }
};

export const createShoppingList = async (listData) => {
  console.log('[DEBUG] Creating shopping list with data:', listData);
  try {
    const response = await api.post('/shopping/lists', listData);
    console.log('[DEBUG] Shopping list creation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[DEBUG] Error creating shopping list:', error);
    throw error;
  }
};

export const updateShoppingList = async (listId, listData) => {
  console.log('[DEBUG] Updating shopping list:', { listId, data: listData });
  try {
    const response = await api.put(`/shopping/lists/${listId}`, listData);
    console.log('[DEBUG] Shopping list update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[DEBUG] Error updating shopping list:', error);
    throw error;
  }
};

export const deleteShoppingList = async (listId) => {
  console.log('[DEBUG] Deleting shopping list:', listId);
  try {
    const response = await api.delete(`/shopping/lists/${listId}`);
    console.log('[DEBUG] Shopping list deletion response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[DEBUG] Error deleting shopping list:', error);
    throw error;
  }
};

export const addShoppingItem = async (listId, itemData) => {
  console.log('[DEBUG] Adding shopping item:', { listId, data: itemData });
  try {
    const response = await api.post(`/shopping/lists/${listId}/items`, itemData);
    console.log('[DEBUG] Shopping item addition response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[DEBUG] Error adding shopping item:', error);
    throw error;
  }
};

export const updateShoppingItem = async (listId, itemId, itemData) => {
  console.log('[DEBUG] Updating shopping item:', { listId, itemId, data: itemData });
  try {
    const response = await api.put(`/shopping/lists/${listId}/items/${itemId}`, itemData);
    console.log('[DEBUG] Shopping item update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[DEBUG] Error updating shopping item:', error);
    throw error;
  }
};

export const deleteShoppingItem = async (listId, itemId) => {
  console.log('[DEBUG] Deleting shopping item:', { listId, itemId });
  try {
    const response = await api.delete(`/shopping/lists/${listId}/items/${itemId}`);
    console.log('[DEBUG] Shopping item deletion response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[DEBUG] Error deleting shopping item:', error);
    throw error;
  }
};