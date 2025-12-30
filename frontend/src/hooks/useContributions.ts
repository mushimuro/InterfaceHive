import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProjectContributions,
  getContribution,
  createContribution,
  acceptContribution,
  declineContribution,
  type Contribution,
  type ContributionListResponse,
  type ContributionCreateData,
} from '../api/contributions';

/**
 * Fetch all contributions for a project
 */
export const useProjectContributions = (projectId: string, params?: Record<string, any>) => {
  return useQuery<ContributionListResponse, Error>({
    queryKey: ['contributions', 'project', projectId, params],
    queryFn: () => getProjectContributions(projectId, params),
    enabled: !!projectId,
  });
};

/**
 * Fetch a single contribution by ID
 */
export const useContribution = (contributionId: string) => {
  return useQuery<Contribution, Error>({
    queryKey: ['contribution', contributionId],
    queryFn: () => getContribution(contributionId),
    enabled: !!contributionId,
  });
};

/**
 * Create a new contribution
 */
export const useCreateContribution = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    Contribution,
    Error,
    { projectId: string; data: Omit<ContributionCreateData, 'project'> }
  >({
    mutationFn: ({ projectId, data }) => createContribution(projectId, data),
    onSuccess: (_, variables) => {
      // Invalidate project contributions list
      queryClient.invalidateQueries({ queryKey: ['contributions', 'project', variables.projectId] });
      // Invalidate project detail to update contribution count
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
};

/**
 * Accept a contribution (host only)
 */
export const useAcceptContribution = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Contribution, Error, string>({
    mutationFn: acceptContribution,
    onSuccess: (contribution) => {
      // Invalidate contribution queries
      queryClient.invalidateQueries({ queryKey: ['contribution', contribution.id] });
      queryClient.invalidateQueries({ queryKey: ['contributions', 'project', contribution.project] });
      // Invalidate project to update stats
      queryClient.invalidateQueries({ queryKey: ['project', contribution.project] });
      // Invalidate user credits if applicable
      queryClient.invalidateQueries({ queryKey: ['user', contribution.contributor.id] });
    },
  });
};

/**
 * Decline a contribution (host only)
 */
export const useDeclineContribution = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Contribution, Error, string>({
    mutationFn: declineContribution,
    onSuccess: (contribution) => {
      // Invalidate contribution queries
      queryClient.invalidateQueries({ queryKey: ['contribution', contribution.id] });
      queryClient.invalidateQueries({ queryKey: ['contributions', 'project', contribution.project] });
      // Invalidate project to update stats
      queryClient.invalidateQueries({ queryKey: ['project', contribution.project] });
    },
  });
};

