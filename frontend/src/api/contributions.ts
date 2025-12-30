import apiClient from './client';

export interface Contribution {
  id: string;
  project: string;
  project_title: string;
  contributor: {
    id: string;
    display_name: string;
    email: string;
    total_credits: number;
  };
  title?: string;
  body: string;
  links?: string[];
  attachments?: string[];
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  decided_by?: string;
  decided_by_name?: string;
  decided_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ContributionCreateData {
  project: string;
  title?: string;
  body: string;
  links?: string[];
  attachments?: string[];
}

export interface ContributionListResponse {
  status_code: number;
  message: string;
  data: Contribution[];
  count: number;
  next: string | null;
  previous: string | null;
}

/**
 * Get all contributions for a specific project
 */
export const getProjectContributions = async (
  projectId: string,
  params?: Record<string, any>
): Promise<ContributionListResponse> => {
  const response = await apiClient.get(`/contributions/projects/${projectId}/contributions/`, { params });
  return response.data;
};

/**
 * Get a single contribution by ID
 */
export const getContribution = async (contributionId: string): Promise<Contribution> => {
  const response = await apiClient.get(`/contributions/${contributionId}/`);
  return response.data.data;
};

/**
 * Submit a new contribution to a project
 */
export const createContribution = async (
  projectId: string,
  data: Omit<ContributionCreateData, 'project'>
): Promise<Contribution> => {
  const response = await apiClient.post(
    `/contributions/projects/${projectId}/contributions/create/`,
    data
  );
  return response.data.data;
};

/**
 * Accept a contribution (host only)
 */
export const acceptContribution = async (contributionId: string): Promise<Contribution> => {
  const response = await apiClient.post(`/contributions/${contributionId}/accept/`);
  return response.data.data;
};

/**
 * Decline a contribution (host only)
 */
export const declineContribution = async (contributionId: string): Promise<Contribution> => {
  const response = await apiClient.post(`/contributions/${contributionId}/decline/`);
  return response.data.data;
};

