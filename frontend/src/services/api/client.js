const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = {
    fetch: async (endpoint, options = {}) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'An unexpected error occurred');
        }

        return response.json();
    },

    auth: {
        register: (data) => api.fetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
        login: (data) => {
            // OAuth2 expects form data
            const formData = new URLSearchParams();
            formData.append('username', data.username);
            formData.append('password', data.password);
            return api.fetch('/auth/login', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
        },
        getMe: () => api.fetch('/auth/me'),
    },

    services: {
        list: (params = '') => api.fetch(`/services?${params}`),
        get: (id) => api.fetch(`/services/${id}`),
        listCategories: () => api.fetch('/services/categories'),
        getRecommended: (limit = 6) => api.fetch(`/services/recommended?limit=${limit}`),
        getProviderServices: () => api.fetch('/services/provider/my-services'),
        createProviderService: (data) => api.fetch('/services/provider/my-services', { method: 'POST', body: JSON.stringify(data) }),
    },

    bookings: {
        create: (data) => api.fetch('/bookings', { method: 'POST', body: JSON.stringify(data) }),
        listMe: () => api.fetch('/bookings/me'),
    },

    availability: {
        get: (providerId, date) => api.fetch(`/availability/${providerId}?start_date=${date}`),
    },

    providers: {
        list: (params = '') => api.fetch(`/providers?${params}`),
        get: (id) => api.fetch(`/providers/${id}`),
    },

    reviews: {
        list: (serviceId) => api.fetch(`/reviews/${serviceId}`),
        create: (data) => api.fetch('/reviews', { method: 'POST', body: JSON.stringify(data) }),
    }
};
