import { useMutation } from '@tanstack/react-query';
import { generateFromRepo, generateFromIdea, type AIProjectData } from '../api/ai';

export const useGenerateFromRepo = () => {
    return useMutation({
        mutationFn: (githubUrl: string) => generateFromRepo(githubUrl),
    });
};

export const useGenerateFromIdea = () => {
    return useMutation({
        mutationFn: (idea: string) => generateFromIdea(idea),
    });
};
