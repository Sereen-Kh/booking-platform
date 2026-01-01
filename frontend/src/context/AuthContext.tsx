import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/utils/api';

interface User {
    id: string;
    email: string;
    full_name?: string;
    role?: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isActive: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (name: string, email: string, password: string, role?: string) => Promise<User>;
    loginWithGoogle: (token: string) => Promise<User>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
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

    const login = async (email: string, password: string) => {
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

    const register = async (name: string, email: string, password: string, role = 'customer') => {
        try {
            await authAPI.register(email, password, name, role);
            // Auto-login after register
            return login(email, password);
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    }

    const loginWithGoogle = async (googleToken: string) => {
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
