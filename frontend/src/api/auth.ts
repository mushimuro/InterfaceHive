import apiClient from './client';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface RegisterData {
  email: string;
  password: string;
  confirm_password: string;
  display_name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    email: string;
    display_name: string;
    bio?: string;
    skills?: string[];
    github_url?: string;
    portfolio_url?: string;
    email_verified: boolean;
    total_credits: number;
    created_at: string;
  };
}

/**
 * Register a new user account
 */
export const register = async (data: RegisterData) => {
  const response = await axios.post(`${API_BASE}/auth/register/`, data);
  return response.data;
};

/**
 * Login with email and password
 */
export const login = async (data: LoginData): Promise<LoginResponse> => {
  const response = await axios.post(`${API_BASE}/auth/login/`, data);
  return response.data.data;
};

/**
 * Verify email with token
 */
export const verifyEmail = async (token: string) => {
  const response = await axios.post(`${API_BASE}/auth/verify-email/`, { token });
  return response.data;
};

/**
 * Resend verification email
 */
export const resendVerification = async (email: string) => {
  const response = await axios.post(`${API_BASE}/auth/resend-verification/`, { email });
  return response.data;
};

/**
 * Refresh access token
 */
export const refreshToken = async (refresh: string) => {
  const response = await axios.post(`${API_BASE}/auth/token/refresh/`, { refresh });
  return response.data;
};

/**
 * Logout (blacklist refresh token)
 */
export const logout = async (refreshToken: string) => {
  const response = await apiClient.post('/auth/logout/', { refresh: refreshToken });
  return response.data;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me/');
  return response.data.data;
};

/**
 * Update user profile
 */
export const updateProfile = async (data: Partial<{
  display_name: string;
  bio: string;
  skills: string[];
  github_url: string;
  portfolio_url: string;
}>) => {
  const response = await apiClient.patch('/auth/profile/', data);
  return response.data.data;
};

