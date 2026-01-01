import apiClient from './client';

export interface Project {
  id: string;
  title: string;
  description: string;
  what_it_does?: string;
  inputs_dependencies?: string;
  desired_outputs: string;
  status: 'draft' | 'open' | 'closed';
  difficulty?: 'easy' | 'intermediate' | 'advanced';
  estimated_time?: string;
  github_url?: string;
  host: {
    id: string;
    email: string;
    display_name: string;
    total_credits: number;
  };
  tags: string[];
  contribution_count: number;
  accepted_contributors?: Array<{
    id: string;
    display_name: string;
    total_credits: number;
  }>;
  created_at: string;
  updated_at: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  what_it_does?: string;
  inputs_dependencies?: string;
  desired_outputs: string;
  difficulty?: 'easy' | 'intermediate' | 'advanced';
  estimated_time?: string;
  github_url?: string;
  tags?: string[];
  status?: 'draft' | 'open' | 'closed';
}

export interface ProjectFilters {
  search?: string;
  status?: 'open' | 'closed' | 'draft';
  difficulty?: 'easy' | 'intermediate' | 'advanced';
  tags?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

/**
 * Get paginated list of projects
 */
export const getProjects = async (filters?: ProjectFilters) => {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }

  const response = await apiClient.get(`/projects/?${params.toString()}`);
  return response.data;
};

/**
 * Get single project details
 */
export const getProject = async (id: string): Promise<Project> => {
  const response = await apiClient.get(`/projects/${id}/`);
  return response.data.data;
};

/**
 * Create a new project
 */
export const createProject = async (data: ProjectFormData): Promise<Project> => {
  const response = await apiClient.post('/projects/', data);
  return response.data.data;
};

/**
 * Update an existing project
 */
export const updateProject = async (id: string, data: Partial<ProjectFormData>): Promise<Project> => {
  const response = await apiClient.patch(`/projects/${id}/`, data);
  return response.data.data;
};

/**
 * Close a project
 */
export const closeProject = async (id: string) => {
  const response = await apiClient.post(`/projects/${id}/close/`);
  return response.data;
};

/**
 * Delete a project (soft delete)
 */
export const deleteProject = async (id: string) => {
  const response = await apiClient.delete(`/projects/${id}/`);
  return response.data;
};

/**
 * Get projects created by current user
 */
export const getMyProjects = async (filters?: Pick<ProjectFilters, 'status' | 'page' | 'page_size'>) => {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const response = await apiClient.get(`/projects/my-projects/?${params.toString()}`);
  return response.data;
};

/**
 * Get all available project tags
 */
export const getProjectTags = async () => {
  const response = await apiClient.get('/projects/tags/');
  return response.data.data || response.data;
};

