import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { projectSchema, type ProjectFormData } from '../schemas/projectSchema';
import { useCreateProject } from '../hooks/useProjects';
import ProjectForm from '../components/ProjectForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import ErrorMessage from '../components/ErrorMessage';

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: 'OPEN',
      tags: [],
    },
  });

  const createProjectMutation = useCreateProject();

  const onSubmit = async (data: ProjectFormData) => {
    setError(null);

    try {
      const project = await createProjectMutation.mutateAsync(data);
      
      // Navigate to project detail page
      navigate(`/projects/${project.id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Failed to create project. Please try again.'
      );
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Create a New Project
          </CardTitle>
          <CardDescription>
            Publish a contribution request and find skilled contributors to help you build your project.
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
            isLoading={createProjectMutation.isPending}
            submitLabel="Create Project"
          />
        </CardContent>
      </Card>

      {/* Tips Section */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Tips for Creating a Great Project
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Be specific:</strong> Clear requirements help contributors understand exactly what you need.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Provide context:</strong> Explain what the project does and why you need this contribution.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Set expectations:</strong> Include difficulty level and estimated time to attract the right contributors.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Use tags:</strong> Add relevant tags to make your project easier to discover.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Link resources:</strong> If you have a GitHub repo or documentation, include the URL.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CreateProject;

