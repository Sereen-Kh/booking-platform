import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authAPI.isAuthenticated()) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          authAPI.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      await authAPI.login(email, password);
      // After login, fetch the full user profile
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (name, email, password, role = 'customer') => {
    try {
      await authAPI.register(email, password, name, role);
      // Auto-login after register
      return login(email, password);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  }

  const loginWithGoogle = async (googleToken) => {
    try {
      await authAPI.loginWithGoogle(googleToken);
      // After Google login, fetch the full user profile
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    }
  }

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, isActive: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
