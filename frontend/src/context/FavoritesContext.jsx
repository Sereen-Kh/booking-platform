import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { favoritesAPI } from '@/utils/api';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [loading, setLoading] = useState(false);

    // Fetch favorites when user logs in
    useEffect(() => {
        if (user) {
            loadFavorites();
        } else {
            setFavorites([]);
            setFavoriteIds(new Set());
        }
    }, [user]);

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const data = await favoritesAPI.getAll();
            setFavorites(data || []);
            setFavoriteIds(new Set((data || []).map(s => s.id)));
        } catch (error) {
            console.error('Failed to load favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const addFavorite = useCallback(async (serviceId) => {
        try {
            await favoritesAPI.add(serviceId);
            setFavoriteIds(prev => new Set([...prev, serviceId]));
            // Optionally reload full list
            loadFavorites();
            return true;
        } catch (error) {
            console.error('Failed to add favorite:', error);
            return false;
        }
    }, []);

    const removeFavorite = useCallback(async (serviceId) => {
        try {
            await favoritesAPI.remove(serviceId);
            setFavoriteIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(serviceId);
                return newSet;
            });
            setFavorites(prev => prev.filter(s => s.id !== serviceId));
            return true;
        } catch (error) {
            console.error('Failed to remove favorite:', error);
            return false;
        }
    }, []);

    const toggleFavorite = useCallback(async (serviceId) => {
        if (favoriteIds.has(serviceId)) {
            return removeFavorite(serviceId);
        } else {
            return addFavorite(serviceId);
        }
    }, [favoriteIds, addFavorite, removeFavorite]);

    const isFavorite = useCallback((serviceId) => {
        return favoriteIds.has(serviceId);
    }, [favoriteIds]);

    return (
        <FavoritesContext.Provider value={{
            favorites,
            favoriteIds,
            loading,
            addFavorite,
            removeFavorite,
            toggleFavorite,
            isFavorite,
            refreshFavorites: loadFavorites,
        }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
