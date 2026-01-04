import apiClient from './client';

export type ResourceCategory = 'github' | 'figma' | 'diagram' | 'docs' | 'other';

export interface ProjectResource {
    id: string;
    project: string;
    user: {
        id: string;
        display_name: string;
    };
    title: string;
    url: string;
    category: ResourceCategory;
    created_at: string;
}

export interface ProjectNote {
    id: string;
    project: string;
    user: {
        id: string;
        display_name: string;
    };
    content: string;
    created_at: string;
    updated_at: string;
}

export interface ResourceFormData {
    title: string;
    url: string;
    category: ResourceCategory;
}

export interface NoteFormData {
    content: string;
}

/**
 * Get resources for a project
 */
export const getProjectResources = async (projectId: string): Promise<ProjectResource[]> => {
    const response = await apiClient.get(`/projects/${projectId}/resources/`);
    return response.data.data || response.data;
};

/**
 * Add a resource to a project
 */
export const addProjectResource = async (projectId: string, data: ResourceFormData): Promise<ProjectResource> => {
    const response = await apiClient.post(`/projects/${projectId}/resources/`, data);
    return response.data.data || response.data;
};

/**
 * Delete a resource
 */
export const deleteProjectResource = async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/resources/${id}/`);
};

/**
 * Get notes for a project
 */
export const getProjectNotes = async (projectId: string): Promise<ProjectNote[]> => {
    const response = await apiClient.get(`/projects/${projectId}/notes/`);
    return response.data.data || response.data;
};

/**
 * Add a note to a project
 */
export const addProjectNote = async (projectId: string, data: NoteFormData): Promise<ProjectNote> => {
    const response = await apiClient.post(`/projects/${projectId}/notes/`, data);
    return response.data.data || response.data;
};

/**
 * Update a note
 */
export const updateProjectNote = async (id: string, data: NoteFormData): Promise<ProjectNote> => {
    const response = await apiClient.patch(`/projects/notes/${id}/`, data);
    return response.data.data || response.data;
};

/**
 * Delete a note
 */
export const deleteProjectNote = async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/notes/${id}/`);
};
