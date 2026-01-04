import axios from 'axios';

// Create axios instance with base URL
const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to every request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const api = {
    auth: {
        login: async (username, password) => {
            // OAuth2 expects form data
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await apiClient.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return response.data;
        },
        register: async (userData) => {
            const response = await apiClient.post('/auth/register', userData);
            return response.data;
        },
        getMe: async () => {
            const response = await apiClient.get('/auth/me');
            return response.data;
        },
    },
    services: {
        list: async () => {
            const response = await apiClient.get('/services');
            return response.data;
        },
        getRecommended: async (limit = 6) => {
            const response = await apiClient.get(`/services/recommended?limit=${limit}`);
            return response.data;
        },
        getProviderServices: async () => {
            const response = await apiClient.get('/services/provider/my-services');
            return response.data;
        },
        createProviderService: async (serviceData) => {
            const response = await apiClient.post('/services/provider/my-services', serviceData);
            return response.data;
        },
    },
};

// Export apiClient as default for direct use
export default apiClient;
