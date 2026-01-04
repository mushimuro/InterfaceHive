import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getProjectResources,
    addProjectResource,
    deleteProjectResource,
    getProjectNotes,
    addProjectNote,
    updateProjectNote,
    deleteProjectNote,
    type ResourceFormData,
    type NoteFormData
} from '../api/projectResources';

export const useProjectResources = (projectId: string) => {
    return useQuery({
        queryKey: ['projects', projectId, 'resources'],
        queryFn: () => getProjectResources(projectId),
        enabled: !!projectId,
    });
};

export const useAddProjectResource = (projectId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ResourceFormData) => addProjectResource(projectId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'resources'] });
        },
    });
};

export const useDeleteProjectResource = (projectId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteProjectResource(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'resources'] });
        },
    });
};

export const useProjectNotes = (projectId: string) => {
    return useQuery({
        queryKey: ['projects', projectId, 'notes'],
        queryFn: () => getProjectNotes(projectId),
        enabled: !!projectId,
    });
};

export const useAddProjectNote = (projectId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: NoteFormData) => addProjectNote(projectId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'notes'] });
        },
    });
};

export const useUpdateProjectNote = (projectId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: NoteFormData }) => updateProjectNote(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'notes'] });
        },
    });
};

export const useDeleteProjectNote = (projectId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteProjectNote(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'notes'] });
        },
    });
};
