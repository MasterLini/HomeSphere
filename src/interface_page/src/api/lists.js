import axios from 'axios';

// Log environment variables
console.log('[DEBUG] API Environment:', {
  SERVER_IP: process.env.VUE_APP_SERVER_IP,
  SERVER_PORT: process.env.VUE_APP_SERVER_PORT,
  NODE_ENV: process.env.NODE_ENV
});

const backendUrl = `http://${process.env.VUE_APP_SERVER_IP || 'localhost'}:${process.env.VUE_APP_SERVER_PORT || '3000'}`;
console.log('[DEBUG] Using backend URL:', backendUrl);

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
    console.log('[DEBUG] Preparing request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL
    });

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[DEBUG] Added auth token to request');
    } else {
      console.warn('[DEBUG] No auth token available for request');
    }

    return config;
  },
  (error) => {
    console.error('[DEBUG] Request interceptor error:', {
      message: error.message,
      config: error.config
    });
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('[DEBUG] Response received:', {
      url: response.config.url,
      status: response.status,
      dataPresent: !!response.data
    });
    return response;
  },
  (error) => {
    console.error('[DEBUG] Response error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const getTodoLists = async () => {
  console.log('[DEBUG] Fetching todo lists');
  try {
    const token = localStorage.getItem('token');
    console.log('[DEBUG] Auth token status:', token ? 'Present' : 'Missing');

    const response = await api.get('/todo/lists');
    console.log('[DEBUG] Todo lists fetch response:', {
      status: response.status,
      dataLength: Array.isArray(response.data) ? response.data.length : 'not an array',
      data: response.data
    });

    if (!response.data) {
      console.warn('[DEBUG] No data received from todo lists fetch');
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('[DEBUG] Error fetching todo lists:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    throw error;
  }
};

export const createTodoList = async (listData) => {
  console.log('[DEBUG] Creating todo list with data:', listData);
  try {
    const token = localStorage.getItem('token');
    console.log('[DEBUG] Using auth token:', token ? 'Present' : 'Missing');

    const response = await api.post('/todo/lists', listData);
    console.log('[DEBUG] Todo list creation response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response.data;
  } catch (error) {
    console.error('[DEBUG] Error creating todo list:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    throw error;
  }
};

export const updateTodoList = async (listId, listData) => {
  try {
    const response = await api.put(`/todo/lists/${listId}`, listData);
    return response.data;
  } catch (error) {
    console.error('Error updating todo list:', error);
    throw error;
  }
};

export const deleteTodoList = async (listId) => {
  try {
    const response = await api.delete(`/todo/lists/${listId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting todo list:', error);
    throw error;
  }
};

export const getTodoItems = async (listId) => {
  try {
    const response = await api.get(`/todo/lists/${listId}/items`);
    return response.data;
  } catch (error) {
    console.error('Error fetching todo items:', error);
    throw error;
  }
};

export const createTodoItem = async (listId, itemData) => {
  try {
    const response = await api.post(`/todo/lists/${listId}/items`, itemData);
    return response.data;
  } catch (error) {
    console.error('Error creating todo item:', error);
    throw error;
  }
};

export const updateTodoItem = async (listId, itemId, itemData) => {
  try {
    const response = await api.put(`/todo/lists/${listId}/items/${itemId}`, itemData);
    return response.data;
  } catch (error) {
    console.error('Error updating todo item:', error);
    throw error;
  }
};

export const deleteTodoItem = async (listId, itemId) => {
  try {
    const response = await api.delete(`/todo/lists/${listId}/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting todo item:', error);
    throw error;
  }
};
