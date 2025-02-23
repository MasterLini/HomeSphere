import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Automatically attach JWT token (if available) to each request
apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token'); // or from Vuex
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

export default apiClient;
