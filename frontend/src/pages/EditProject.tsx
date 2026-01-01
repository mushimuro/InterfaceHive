import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { projectSchema, type ProjectFormData } from '../schemas/projectSchema';
import { useProject, useUpdateProject } from '../hooks/useProjects';
import ProjectForm from '../components/ProjectForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { data: project, isLoading: isLoadingProject, error: projectError } = useProject(id!);
  const updateProjectMutation = useUpdateProject(id!);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  // Populate form with existing project data
  useEffect(() => {
    if (project) {
      form.reset({
        title: project.title,
        description: project.description,
        what_it_does: project.what_it_does || '',
        inputs_dependencies: project.inputs_dependencies || '',
        desired_outputs: project.desired_outputs,
        difficulty: project.difficulty,
        estimated_time: project.estimated_time || '',
        github_url: project.github_url || '',
        tags: project.tags || [],
        status: project.status,
      });
    }
  }, [project, form]);

  const onSubmit = async (data: ProjectFormData) => {
    setError(null);

    try {
      await updateProjectMutation.mutateAsync(data as any);

      // Navigate to project detail page
      navigate(`/projects/${id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Failed to update project. Please try again.'
      );
    }
  };

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading project..." />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <ErrorMessage
          message="Failed to load project. It may have been deleted or you don't have permission to edit it."
          type="error"
        />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Edit Project
          </CardTitle>
          <CardDescription>
            Update your project details and requirements.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-6">
              <ErrorMessage message={error} type="error" />
            </div>
          )}

          <ProjectForm
            form={form}
            onSubmit={onSubmit}
            isLoading={updateProjectMutation.isPending}
            submitLabel="Save Changes"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProject;

