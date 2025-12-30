import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyProfile,
  updateMyProfile,
  getUserProfile,
  type UserProfile,
  type PublicUserProfile,
  type UpdateProfileData,
} from '../api/users';

/**
 * Fetch authenticated user's profile
 */
export const useMyProfile = () => {
  return useQuery<UserProfile, Error>({
    queryKey: ['profile', 'my'],
    queryFn: getMyProfile,
  });
};

/**
 * Update authenticated user's profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation<UserProfile, Error, UpdateProfileData>({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      // Invalidate profile queries
      queryClient.invalidateQueries({ queryKey: ['profile', 'my'] });
      // Also invalidate auth context user data if applicable
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

/**
 * Fetch public user profile by ID
 */
export const useUserProfile = (userId?: string) => {
  return useQuery<PublicUserProfile, Error>({
    queryKey: ['profile', 'user', userId],
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId,
  });
};

