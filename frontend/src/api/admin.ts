/**
 * Admin API client functions for moderation actions.
 * 
 * All endpoints require admin privileges.
 */
import apiClient from './client';

export interface SoftDeleteRequest {
  reason: string;
}

export interface SoftDeleteResponse {
  success: boolean;
  message: string;
  data: {
    project_id?: string;
    contribution_id?: string;
    status: string;
    log_id: string;
  };
}

export interface BanUserRequest {
  reason: string;
}

export interface BanUserResponse {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    is_active: boolean;
    log_id: string;
  };
}

export interface ReverseCreditRequest {
  reason: string;
}

export interface ReverseCreditResponse {
  success: boolean;
  message: string;
  data: {
    original_entry_id: string;
    reversal_entry_id: string;
    amount_reversed: number;
    log_id: string;
  };
}

/**
 * Soft delete a project (sets status to CLOSED).
 */
export const softDeleteProject = async (
  projectId: string,
  data: SoftDeleteRequest
): Promise<SoftDeleteResponse> => {
  const response = await apiClient.post(
    `/admin/projects/${projectId}/soft-delete/`,
    data
  );
  return response.data;
};

/**
 * Soft delete a contribution (sets status to DECLINED).
 */
export const softDeleteContribution = async (
  contributionId: string,
  data: SoftDeleteRequest
): Promise<SoftDeleteResponse> => {
  const response = await apiClient.post(
    `/admin/contributions/${contributionId}/soft-delete/`,
    data
  );
  return response.data;
};

/**
 * Ban a user (sets is_active=False).
 */
export const banUser = async (
  userId: string,
  data: BanUserRequest
): Promise<BanUserResponse> => {
  const response = await apiClient.post(`/admin/users/${userId}/ban/`, data);
  return response.data;
};

/**
 * Unban a user (sets is_active=True).
 */
export const unbanUser = async (
  userId: string,
  data: BanUserRequest
): Promise<BanUserResponse> => {
  const response = await apiClient.post(`/admin/users/${userId}/unban/`, data);
  return response.data;
};

/**
 * Reverse a credit transaction.
 */
export const reverseCredit = async (
  entryId: string,
  data: ReverseCreditRequest
): Promise<ReverseCreditResponse> => {
  const response = await apiClient.post(
    `/admin/credits/${entryId}/reverse/`,
    data
  );
  return response.data;
};

