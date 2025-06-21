import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api'; // On utilise notre service API

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Si on a un token, on vérifie sa validité en récupérant le profil
          const response = await authService.getProfile();
          setUser(response.data.user); // On stocke l'utilisateur complet
        } catch (error) {
          console.error('Session invalide :', error);
          // Le token est invalide, on nettoie
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData) => {
    setUser(userData.user);
    localStorage.setItem('token', userData.token);
    // On peut aussi stocker l'user, mais getProfile est plus sûr
    localStorage.setItem('user', JSON.stringify(userData.user)); 
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    login(response.data);
    return response.data;
  };

  const loginUser = async (credentials) => {
    const response = await authService.login(credentials);
    login(response.data);
    return response.data;
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    register,
    loginUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 