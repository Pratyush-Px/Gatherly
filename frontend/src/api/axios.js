import axios from 'axios';

// Create an instance of axios with your backend URL
const api = axios.create({
    baseURL: 'http://localhost:5000/api', 
});

// Automatically add the JWT token to headers if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;