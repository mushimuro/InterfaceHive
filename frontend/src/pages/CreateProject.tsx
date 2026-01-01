import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { projectSchema, type ProjectFormData } from '../schemas/projectSchema';
import { useCreateProject } from '../hooks/useProjects';
import ProjectForm from '../components/ProjectForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import ErrorMessage from '../components/ErrorMessage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Sparkles, Github, Lightbulb } from 'lucide-react';
import { useGenerateFromIdea, useGenerateFromRepo } from '../hooks/useAI';
import LoadingSpinner from '../components/LoadingSpinner';

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
  const generateFromIdeaMutation = useGenerateFromIdea();
  const generateFromRepoMutation = useGenerateFromRepo();

  const [aiIdea, setAiIdea] = useState('');
  const [aiRepoUrl, setAiRepoUrl] = useState('');
  const [activeTab, setActiveTab] = useState('idea');

  const handleGenerateFromIdea = async () => {
    if (!aiIdea.trim()) return;
    try {
      const data = await generateFromIdeaMutation.mutateAsync(aiIdea);
      populateForm(data);
    } catch (err) {
      // Error handled by mutation state usually, or we can set local error
      console.error(err);
    }
  };

  const handleGenerateFromRepo = async () => {
    if (!aiRepoUrl.trim()) return;
    try {
      const data = await generateFromRepoMutation.mutateAsync(aiRepoUrl);
      populateForm(data);
      // Also set the github url field if returned, or we ensure it
      form.setValue('github_url', aiRepoUrl);
    } catch (err) {
      console.error(err);
    }
  };

  const populateForm = (data: any) => {
    if (data.title) form.setValue('title', data.title);
    if (data.description) form.setValue('description', data.description);
    if (data.what_it_does) form.setValue('what_it_does', data.what_it_does);
    if (data.inputs_dependencies) form.setValue('inputs_dependencies', data.inputs_dependencies);
    if (data.desired_outputs) form.setValue('desired_outputs', data.desired_outputs);
    if (data.difficulty) form.setValue('difficulty', data.difficulty as any);
    if (data.estimated_time) form.setValue('estimated_time', data.estimated_time);
    if (data.tags) form.setValue('tags', data.tags);
    if (data.github_url) form.setValue('github_url', data.github_url);
    if (data.status) form.setValue('status', 'OPEN'); // Default to OPEN if generated
  };

  const isAiLoading = generateFromIdeaMutation.isPending || generateFromRepoMutation.isPending;
  const aiError = generateFromIdeaMutation.error || generateFromRepoMutation.error;

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


          {/* AI Assistant Section */}
          <div className="mb-8 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-lg">AI Assistant</h3>
            </div>

            {aiError && (
              <div className="mb-4">
                <ErrorMessage
                  message={aiError instanceof Error ? aiError.message : 'AI generation failed'}
                  type="error"
                />
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="idea" onClick={() => setActiveTab('idea')}>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  From Idea
                </TabsTrigger>
                <TabsTrigger value="repo" onClick={() => setActiveTab('repo')}>
                  <Github className="h-4 w-4 mr-2" />
                  From GitHub
                </TabsTrigger>
              </TabsList>

              <TabsContent value="idea" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-idea">What do you want to build?</Label>
                  <Textarea
                    id="ai-idea"
                    placeholder="Describe your project idea in a few sentences..."
                    value={aiIdea}
                    onChange={(e) => setAiIdea(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleGenerateFromIdea}
                  disabled={isAiLoading || !aiIdea.trim()}
                  className="w-full sm:w-auto"
                >
                  {isAiLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Generating Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Project Plan
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="repo" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-repo">GitHub Repository URL</Label>
                  <Input
                    id="ai-repo"
                    placeholder="https://github.com/username/repo"
                    value={aiRepoUrl}
                    onChange={(e) => setAiRepoUrl(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleGenerateFromRepo}
                  disabled={isAiLoading || !aiRepoUrl.trim()}
                  className="w-full sm:w-auto"
                >
                  {isAiLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Analyzing Repo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze & Auto-fill
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </div>

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
    </div >
  );
};

export default CreateProject;

