import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProject, useCloseProject } from '../hooks/useProjects';
import { useProjectContributions, useCreateContribution, useAcceptContribution, useDeclineContribution } from '../hooks/useContributions';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ContributionForm from '../components/ContributionForm';
import ContributionList from '../components/ContributionList';
import AcceptedContributors from '../components/AcceptedContributors';
import { Calendar, Clock, Github, User, Award, Edit, XCircle } from 'lucide-react';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const { data: project, isLoading, error } = useProject(id!);
  const { data: contributionsData, isLoading: isLoadingContributions } = useProjectContributions(id!);
  const closeProjectMutation = useCloseProject();
  const createContributionMutation = useCreateContribution();
  const acceptContributionMutation = useAcceptContribution();
  const declineContributionMutation = useDeclineContribution();

  const isHost = user && project && project.host.id === user.id;
  const hasContributed = contributionsData?.data.some(c => c.contributor.id === user?.id);

  const handleClose = async () => {
    if (window.confirm('Are you sure you want to close this project? It will no longer accept contributions.')) {
      try {
        await closeProjectMutation.mutateAsync(id!);
        navigate('/projects/my-projects');
      } catch (err) {
        console.error('Failed to close project:', err);
      }
    }
  };

  const handleContributionSubmit = async (data: any) => {
    try {
      await createContributionMutation.mutateAsync({
        projectId: id!,
        data,
      });
      setActiveTab('contributions'); // Switch to contributions tab
    } catch (error: any) {
      console.error('Failed to submit contribution:', error);
    }
  };

  const handleAcceptContribution = async (contributionId: string) => {
    try {
      await acceptContributionMutation.mutateAsync(contributionId);
    } catch (error) {
      console.error('Failed to accept contribution:', error);
    }
  };

  const handleDeclineContribution = async (contributionId: string) => {
    if (window.confirm('Are you sure you want to decline this contribution?')) {
      try {
        await declineContributionMutation.mutateAsync(contributionId);
      } catch (error) {
        console.error('Failed to decline contribution:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading project..." />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <ErrorMessage message="Failed to load project." type="error" />
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link to="/projects">Back to Projects</Link>
          </Button>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    EASY: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    ADVANCED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const statusColors = {
    OPEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    DRAFT: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex-1 max-w-3xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                      {project.status}
                    </Badge>
                    {project.difficulty && (
                      <Badge className={difficultyColors[project.difficulty as keyof typeof difficultyColors]}>
                        {project.difficulty}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{project.title}</h1>
                  <p className="text-muted-foreground">{project.description}</p>
                </div>
                
                {isHost && (
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/projects/${id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    {project.status === 'OPEN' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleClose}
                        disabled={closeProjectMutation.isPending}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Close
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contributions">
            Contributions ({contributionsData?.count || 0})
          </TabsTrigger>
          {project.status === 'OPEN' && !isHost && (
            <TabsTrigger value="submit">Submit Work</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Desired Outputs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Desired Outputs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{project.desired_outputs}</p>
                </CardContent>
              </Card>

              {/* What It Does */}
              {project.what_it_does && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What It Does</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm">{project.what_it_does}</p>
                  </CardContent>
                </Card>
              )}

              {/* Inputs & Dependencies */}
              {project.inputs_dependencies && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Inputs & Dependencies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm">{project.inputs_dependencies}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Host Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Project Host</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{project.host.display_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {project.host.total_credits} credits
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.estimated_time && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{project.estimated_time}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>{project.contribution_count} contribution(s)</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>

                  {project.github_url && (
                    <div className="pt-3 border-t">
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                          <Github className="mr-2 h-4 w-4" />
                          View on GitHub
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Accepted Contributors Section */}
          {project.accepted_contributors && project.accepted_contributors.length > 0 && (
            <div className="mt-6">
              <AcceptedContributors contributors={project.accepted_contributors} />
            </div>
          )}
        </TabsContent>

        {/* Contributions Tab */}
        <TabsContent value="contributions" className="mt-6">
          {isLoadingContributions ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" text="Loading contributions..." />
            </div>
          ) : (
            <ContributionList
              contributions={contributionsData?.data || []}
              isHost={!!isHost}
              onAccept={isHost ? handleAcceptContribution : undefined}
              onDecline={isHost ? handleDeclineContribution : undefined}
              isProcessing={acceptContributionMutation.isPending || declineContributionMutation.isPending}
            />
          )}
        </TabsContent>

        {/* Submit Tab */}
        {project.status === 'OPEN' && !isHost && (
          <TabsContent value="submit" className="mt-6">
            <ContributionForm
              projectTitle={project.title}
              onSubmit={handleContributionSubmit}
              isLoading={createContributionMutation.isPending}
              isHost={!!isHost}
              hasExistingContribution={!!hasContributed}
            />
            {createContributionMutation.isError && (
              <div className="mt-4">
                <ErrorMessage
                  message={createContributionMutation.error?.message || 'Failed to submit contribution'}
                  type="error"
                />
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Back Button */}
      <div className="mt-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/projects">← Back to Projects</Link>
        </Button>
      </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;

