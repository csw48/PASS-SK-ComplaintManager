import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8000/api/',
    timeout: 5000, 
});

instance.interceptors.request.use(
    config => {
        console.log('Request sent:', config);
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    response => {
        console.log('Response received:', response);
        return response;
    },
    error => {
        console.error('Response error:', error);
        return Promise.reject(error);
    }
);

export default instance;