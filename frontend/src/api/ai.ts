import apiClient from './client';
import { type ProjectFormData } from '../schemas/projectSchema';

// Define partial because AI might not return everything perfectly, 
// but our service tries to match the schema.
export type AIProjectData = Partial<ProjectFormData>;

export const generateFromRepo = async (githubUrl: string): Promise<AIProjectData> => {
    const { data } = await apiClient.post<AIProjectData>('/ai/generate-from-repo/', {
        github_url: githubUrl,
    });
    return data;
};

export const generateFromIdea = async (idea: string): Promise<AIProjectData> => {
    const { data } = await apiClient.post<AIProjectData>('/ai/generate-from-idea/', {
        idea,
    });
    return data;
};
