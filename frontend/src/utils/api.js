// frontend/src/utils/api.js

const API_BASE_URL = "http://localhost:8000/api/v1";

// Helper function for making API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if it exists
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    
    // Handle network errors or non-JSON responses
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      if (!response.ok) {
        throw new Error(
          `Server error (${response.status}): Unable to connect to the backend. Please ensure the server is running.`
        );
      }
      throw new Error("Invalid response from server");
    }

    if (!response.ok) {
      // Extract error message from backend response
      const errorMessage = data.detail || data.message || "Something went wrong";
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    // Re-throw with more context if it's a network error
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Cannot connect to the server. Please ensure the backend is running on http://localhost:8000"
      );
    }
    throw error;
  }
}

// Auth API endpoints
export const authAPI = {
  // Register new user
  register: async (email, password, fullName, role = "customer") => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        role,
      }),
    });
  },

  // Login user
  login: async (email, password) => {
    try {
      // FastAPI OAuth2 expects form data, not JSON
      const formData = new URLSearchParams();
      formData.append("username", email); // Note: OAuth2 uses 'username' field
      formData.append("password", password);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error(
          "Cannot connect to the server. Please ensure the backend is running."
        );
      }

      if (!response.ok) {
        const errorMessage = data.detail || "Login failed. Please check your credentials.";
        throw new Error(errorMessage);
      }

      // Store token in localStorage
      localStorage.setItem("access_token", data.access_token);

      return data;
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Cannot connect to the server. Please ensure the backend is running on http://localhost:8000"
        );
      }
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem("access_token");
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("access_token");
  },

  // Get current user info (you'll need to implement this endpoint in backend)
  getCurrentUser: async () => {
    return apiRequest("/auth/me");
  },

  // Login with Google OAuth token
  loginWithGoogle: async (googleToken) => {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: googleToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Google login failed");
    }

    // Store token in localStorage
    localStorage.setItem("access_token", data.access_token);

    return data;
  },
};

// You can add more API modules here as needed
export const servicesAPI = {
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.providerId) searchParams.append("provider_id", params.providerId);
    if (params.categoryId) searchParams.append("category_id", params.categoryId);
    // Add other filters as needed
    const queryString = searchParams.toString();
    return apiRequest(`/services?${queryString}`);
  },

  getById: async (id) => {
    return apiRequest(`/services/${id}`);
  },

  getRecommended: async (limit = 6) => {
    return apiRequest(`/services/recommended?limit=${limit}`);
  },

  getProviderServices: async () => {
    return apiRequest("/services/provider/my-services");
  },

  createProviderService: async (serviceData) => {
    return apiRequest("/services/provider/my-services", {
      method: "POST",
      body: JSON.stringify(serviceData),
    });
  },

  updateProviderService: async (id, serviceData) => {
    return apiRequest(`/services/provider/my-services/${id}`, {
      method: "PUT",
      body: JSON.stringify(serviceData),
    });
  },

  deleteProviderService: async (id) => {
    return apiRequest(`/services/provider/my-services/${id}`, {
      method: "DELETE",
    });
  },
  getByProvider: async (providerId) => {
    return apiRequest(`/services/by-provider/${providerId}`);
  },
};

export const bookingsAPI = {
  create: async (bookingData) => {
    return apiRequest("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  },

  getUserBookings: async () => {
    return apiRequest("/bookings/me");
  },

  getProviderBookings: async () => {
    return apiRequest("/bookings/managed");
  },

  getAllBookings: async () => {
    return apiRequest("/bookings/all");
  },
};

export const adminAPI = {
  getStats: async () => {
    return apiRequest("/admin/stats");
  },

  getUsers: async (role = null) => {
    const query = role ? `?role=${role}` : "";
    return apiRequest(`/admin/users${query}`);
  },

  getUserDetails: async (userId) => {
    return apiRequest(`/admin/users/${userId}`);
  },

  updateUserRole: async (userId, role) => {
    return apiRequest(`/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
  },
};

export const providersAPI = {
  getProfileByUserId: async (userId) => {
    return apiRequest(`/providers/by-user/${userId}`);
  },
};

export const profilesAPI = {
  get: async (userId) => {
    return apiRequest(`/profiles/${userId}`);
  },
  update: async (userId, data) => {
    return apiRequest(`/profiles/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

export const favoritesAPI = {
  getAll: async () => {
    return apiRequest("/favorites");
  },

  add: async (serviceId) => {
    return apiRequest(`/favorites/${serviceId}`, {
      method: "POST",
    });
  },

  remove: async (serviceId) => {
    return apiRequest(`/favorites/${serviceId}`, {
      method: "DELETE",
    });
  },

  check: async (serviceId) => {
    return apiRequest(`/favorites/check/${serviceId}`);
  },
};

export const paymentsAPI = {
  createCheckout: async (serviceId, startTime) => {
    return apiRequest("/payments/create-checkout", {
      method: "POST",
      body: JSON.stringify({
        service_id: serviceId,
        start_time: startTime,
      }),
    });
  },
};

export default { authAPI, servicesAPI, bookingsAPI, favoritesAPI, paymentsAPI, providersAPI, adminAPI, profilesAPI };