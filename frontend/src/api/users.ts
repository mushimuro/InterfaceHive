import apiClient from './client';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  display_name: string;
  bio: string;
  skills: string[];
  github_url: string;
  portfolio_url: string;
  email_verified: boolean;
  total_credits: number;
  created_at: string;
  updated_at: string;
}

export interface PublicUserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  skills: string[];
  github_url: string;
  portfolio_url: string;
  total_credits: number;
  created_at: string;
}

export interface UpdateProfileData {
  display_name?: string;
  bio?: string;
  skills?: string[];
  github_url?: string;
  portfolio_url?: string;
}

/**
 * Get authenticated user's profile
 */
export const getMyProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get('/auth/me/');
  return response.data.data;
};

/**
 * Update authenticated user's profile
 */
export const updateMyProfile = async (data: UpdateProfileData): Promise<UserProfile> => {
  const response = await apiClient.patch('/auth/me/', data);
  return response.data.data;
};

/**
 * Get public user profile by ID
 */
export const getUserProfile = async (userId: string): Promise<PublicUserProfile> => {
  const response = await apiClient.get(`/auth/users/${userId}/`);
  return response.data.data;
};

