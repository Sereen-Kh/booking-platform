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
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Login failed");
    }

    // Store token in localStorage
    localStorage.setItem("access_token", data.access_token);
    
    return data;
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
};

// You can add more API modules here as needed
export const servicesAPI = {
  getAll: async () => {
    return apiRequest("/services");
  },
  
  getById: async (id) => {
    return apiRequest(`/services/${id}`);
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
    return apiRequest("/bookings/my-bookings");
  },
};

export default { authAPI, servicesAPI, bookingsAPI };