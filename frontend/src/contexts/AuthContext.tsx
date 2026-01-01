import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiClient from '../api/client';

interface User {
  id: string;
  email: string;
  display_name: string;
  email_verified: boolean;
  bio?: string;
  skills?: string[];
  github_url?: string;
  portfolio_url?: string;
  total_credits: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, display_name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (accessToken && refreshToken) {
        try {
          // Fetch user profile
          await refreshUser();
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login/`, {
        email,
        password,
      });

      // Store tokens (backend wraps response in { success, message, data })
      localStorage.setItem('access_token', data.data.access);
      localStorage.setItem('refresh_token', data.data.refresh);
      
      // Set user from login response
      setUser(data.data.user);

      // Redirect to home
      navigate('/');
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.detail || 'Login failed');
      }
      throw new Error('Network error. Please try again.');
    }
  };

  const register = async (email: string, password: string, display_name: string) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/register/`, {
        email,
        password,
        display_name,
      });

      // Registration successful, redirect to verification page
      navigate('/auth/verify-email-sent', { state: { email } });
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.field_errors) {
          // Handle field-specific errors
          const firstError = Object.values(errorData.field_errors)[0];
          throw new Error(Array.isArray(firstError) ? firstError[0] : 'Registration failed');
        }
        throw new Error(errorData.detail || 'Registration failed');
      }
      throw new Error('Network error. Please try again.');
    }
  };

  const logout = () => {
    // Clear tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);

    // Optionally call logout endpoint to blacklist token
    apiClient.post('/auth/logout/').catch(() => {
      // Ignore errors, already logged out locally
    });

    // Redirect to login
    navigate('/auth/login');
  };

  const refreshUser = async () => {
    try {
      const { data } = await apiClient.get('/auth/me/');
      setUser(data.data || data);
    } catch (error) {
      // If fetching user fails, logout
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

