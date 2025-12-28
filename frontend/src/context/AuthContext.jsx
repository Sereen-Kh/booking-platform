import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/services/api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you'd fetch the user profile here
      setUser({ email: 'user@example.com', role: 'customer' }); 
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.auth.login({ username: email, password });
    localStorage.setItem('token', data.access_token);
    setUser({ email, role: 'customer' }); // Simplify for now
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isActive: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
