import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  closeProject,
  deleteProject,
  getMyProjects,
  getProjectTags,
  type ProjectFilters,
  type ProjectFormData,
} from '../api/projects';

/**
 * Hook to fetch paginated list of projects
 */
export const useProjects = (filters?: ProjectFilters) => {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => getProjects(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch single project details
 */
export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => getProject(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to create a new project
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProjectFormData) => createProject(data),
    onSuccess: () => {
      // Invalidate project lists
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
    },
  });
};

/**
 * Hook to update an existing project
 */
export const useUpdateProject = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<ProjectFormData>) => updateProject(id, data),
    onSuccess: (updatedProject) => {
      // Update cached project
      queryClient.setQueryData(['projects', id], updatedProject);
      
      // Invalidate project lists
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
    },
  });
};

/**
 * Hook to close a project
 */
export const useCloseProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => closeProject(id),
    onSuccess: (_, id) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
    },
  });
};

/**
 * Hook to delete a project
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: (_, id) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
    },
  });
};

/**
 * Hook to fetch user's own projects
 */
export const useMyProjects = (filters?: Pick<ProjectFilters, 'status' | 'page' | 'page_size'>) => {
  return useQuery({
    queryKey: ['my-projects', filters],
    queryFn: () => getMyProjects(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch all project tags
 */
export const useProjectTags = () => {
  return useQuery({
    queryKey: ['project-tags'],
    queryFn: getProjectTags,
    staleTime: 10 * 60 * 1000, // 10 minutes (tags don't change often)
  });
};

