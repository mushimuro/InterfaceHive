import React, { useState, useLayoutEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useProject, useCloseProject } from '../hooks/useProjects';
import {
  useProjectContributions,
  useCreateContribution,
  useAcceptContribution,
  useDeclineContribution,
  useUpdateContribution,
  useDeleteContribution
} from '../hooks/useContributions';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ContributionForm from '../components/ContributionForm';
import ContributionList from '../components/ContributionList';
import AcceptedContributors from '../components/AcceptedContributors';
import ProjectImplementation from '../components/ProjectImplementation';
import ChatRoom from '../components/ChatRoom';
import {
  Calendar,
  Clock,
  Github,
  User,
  Award,
  Edit,
  XCircle,
  MessageSquare,
  ChevronLeft
} from 'lucide-react';
import { gsap } from 'gsap';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const headerRef = useRef<HTMLDivElement>(null);

  const { data: project, isLoading, error } = useProject(id!);
  const { data: contributionsData, isLoading: isLoadingContributions } = useProjectContributions(id!);

  const closeProjectMutation = useCloseProject();
  const createContributionMutation = useCreateContribution();
  const updateContributionMutation = useUpdateContribution();
  const deleteContributionMutation = useDeleteContribution();
  const acceptContributionMutation = useAcceptContribution();
  const declineContributionMutation = useDeclineContribution();

  const isHost = user && project && project.host.id === user.id;
  const isAcceptedContributor =
    contributionsData?.data?.some(c => c.contributor.id === user?.id && c.status === 'accepted') ||
    project?.accepted_contributors?.some(contributor => contributor.id === user?.id);
  const userContribution = contributionsData?.data?.find(c => c.contributor.id === user?.id);
  const hasContributed = !!userContribution;
  const canChat = isHost || isAcceptedContributor;
  const isAIGenerated = project?.is_ai_generated || false;

  useLayoutEffect(() => {
    if (project) {
      const ctx = gsap.context(() => {
        gsap.from(".detail-header-content > *", {
          opacity: 0,
          x: -20,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out"
        });
      }, headerRef);
      return () => ctx.revert();
    }
  }, [project]);

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
      if (userContribution) {
        await updateContributionMutation.mutateAsync({
          contributionId: userContribution.id,
          data,
        });
      } else {
        await createContributionMutation.mutateAsync({
          projectId: id!,
          data,
        });
      }
    } catch (error: any) {
      console.error('Failed to submit contribution:', error);
    }
  };

  const handleContributionDelete = async () => {
    if (userContribution && window.confirm('Are you sure you want to withdraw your application?')) {
      try {
        await deleteContributionMutation.mutateAsync(userContribution.id);
      } catch (error) {
        console.error('Failed to delete contribution:', error);
      }
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground animate-pulse">Loading project intelligence...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="glass-card p-8 rounded-2xl text-center">
          <ErrorMessage message="Failed to load project." type="error" />
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link to="/projects">Back to Projects</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    easy: 'bg-green-100/50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-500/20',
    intermediate: 'bg-amber-100/50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-500/20',
    advanced: 'bg-red-100/50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-500/20',
  };

  const statusColors = {
    open: 'bg-blue-100/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-500/20',
    closed: 'bg-gray-100/50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 border-gray-500/20',
    draft: 'bg-purple-100/50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-500/20',
  };

  // Render the overview content (used for both AI and regular projects)
  const renderOverviewContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Desired Outputs */}
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-hive" />
            Desired Outputs
          </h3>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed font-light">
            {project.desired_outputs}
          </p>
        </div>

        {/* What It Does */}
        {project.what_it_does && (
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-hive" />
              What It Does
            </h3>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed font-light">
              {project.what_it_does}
            </p>
          </div>
        )}

        {/* Inputs & Dependencies */}
        {project.inputs_dependencies && (
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-hive" />
              Inputs & Dependencies
            </h3>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed font-light">
              {project.inputs_dependencies}
            </p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Host Info */}
        <div className="glass-card p-6 rounded-xl border border-accent-hive/5">
          <h3 className="text-base font-bold mb-4">Project Host</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-hive/20 to-accent-hive-dark/20 flex items-center justify-center border border-accent-hive/10 shadow-inner">
              <User className="h-6 w-6 text-accent-hive" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm tracking-wide">{project.host.display_name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Award className="h-3.5 w-3.5 text-accent-hive/70" />
                {project.host.total_credits} credits unlocked
              </p>
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-base font-bold mb-4">Intelligence Stats</h3>
          <div className="space-y-4">
            {project.estimated_time && (
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-accent-hive/70" />
                <span className="text-muted-foreground font-medium">{project.estimated_time}</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <Award className="h-4 w-4 text-accent-hive/70" />
              <span className="text-muted-foreground font-medium">{project.contribution_count} collaboration attempts</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-accent-hive/70" />
              <span className="text-muted-foreground font-medium text-xs">Initialized on {new Date(project.created_at).toLocaleDateString()}</span>
            </div>

            {project.github_url && (
              <div className="pt-4 mt-2 border-t border-white/5">
                <Button asChild variant="outline" size="sm" className="w-full glass-card hover:bg-white/5 border-white/10">
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" />
                    Repository Source
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-base font-bold mb-4">Categorization</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[11px] py-1 px-2 font-normal glass-card border-white/5 opacity-80">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col pb-12">
      <div className="container-wide pt-6">
        {/* Back Button */}
        <Link to="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-accent-hive transition-colors mb-6 group">
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Discover
        </Link>

        {/* Header */}
        <div ref={headerRef} className="glass-card p-8 rounded-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-hive/5 rounded-full blur-3xl -mr-32 -mt-32" />

          <div className="detail-header-content relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`${statusColors[project.status as keyof typeof statusColors]} border uppercase text-[10px]`}>
                    {project.status}
                  </Badge>
                  {project.usage_type && (
                    <Badge className={`${project.usage_type === 'commercial'
                      ? 'bg-indigo-100/50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-500/20'
                      : 'bg-blue-100/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-500/20'
                      } border uppercase text-[10px]`}>
                      {project.usage_type === 'commercial' ? 'Commercial Use' : 'Practice Use'}
                    </Badge>
                  )}
                  {project.difficulty && (
                    <Badge className={`${difficultyColors[project.difficulty as keyof typeof difficultyColors]} border uppercase text-[10px]`}>
                      {project.difficulty}
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient">
                  {project.title}
                </h1>
                <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
                  {project.description}
                </p>
              </div>

              {isHost && (
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline" size="lg" className="glass-card hover:bg-background/50 border-white/10">
                    <Link to={`/projects/${id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Project
                    </Link>
                  </Button>
                  {project.status === 'open' && (
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={handleClose}
                      disabled={closeProjectMutation.isPending}
                      className="shadow-lg shadow-destructive/20"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Close Project
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {isAIGenerated ? (
          // AI-generated projects: Just show separator and overview content
          <>
            <div className="my-8 border-t border-white/10" />
            <div className="space-y-6">
              {renderOverviewContent()}
            </div>
          </>
        ) : (
          // Regular projects: Show tabs
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className={`grid h-12 w-full glass-card p-1 rounded-xl shadow-inner ${canChat ? 'grid-cols-4' :
                (project.status === 'open' && !isHost && !isAcceptedContributor) ? 'grid-cols-3' :
                  'grid-cols-2'
              }`}>
              <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-accent-hive data-[state=active]:text-black transition-all">Overview</TabsTrigger>
              <TabsTrigger value="contributions" className="rounded-lg data-[state=active]:bg-accent-hive data-[state=active]:text-black transition-all">
                Contributors ({(contributionsData?.data?.filter(c => c.status === 'accepted').length || 0) + 1})
              </TabsTrigger>
              {project.status === 'open' && !isHost && !isAcceptedContributor && (
                <TabsTrigger value="submit" className="rounded-lg data-[state=active]:bg-accent-hive data-[state=active]:text-black transition-all">Request to Join</TabsTrigger>
              )}
              {canChat && (
                <TabsTrigger value="implementation" className="rounded-lg data-[state=active]:bg-accent-hive data-[state=active]:text-black transition-all">
                  Implementation
                </TabsTrigger>
              )}
              {canChat && (
                <TabsTrigger value="chat" className="rounded-lg data-[state=active]:bg-accent-hive data-[state=active]:text-black transition-all">
                  <MessageSquare className="mr-2 h-4 w-4 inline" />
                  Chat
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {renderOverviewContent()}
            </TabsContent>

            {/* Contributors Tab */}
            <TabsContent value="contributions" className="mt-6 space-y-6">
              {/* Host Section */}
              <div className="glass-card p-6 rounded-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-hive/5 rounded-full blur-2xl -mr-16 -mt-16" />
                <h3 className="text-lg font-bold mb-4 relative z-10">Project Host</h3>
                <div className="flex items-center gap-4 p-4 border rounded-xl bg-background/30 border-white/5 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-hive/20 to-accent-hive-dark/20 flex items-center justify-center border border-accent-hive/10 self-start">
                    <User className="h-6 w-6 text-accent-hive" />
                  </div>
                  <div>
                    <p className="font-bold tracking-wide">{project.host.display_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                      <Award className="h-3.5 w-3.5 text-accent-hive/70" />
                      {project.host.total_credits} credits earned
                    </p>
                  </div>
                </div>
              </div>

              {/* Accepted Contributors Section */}
              {project.accepted_contributors && project.accepted_contributors.length > 0 && (
                <div className="glass-card p-6 rounded-xl">
                  <h3 className="text-lg font-bold mb-4">Accepted Contributors</h3>
                  <AcceptedContributors contributors={project.accepted_contributors} />
                </div>
              )}

              {/* Pending Requests Section - Visible to All */}
              {(contributionsData?.data || []).filter(c => c.status === 'pending').length > 0 && (
                <div className="glass-card p-6 rounded-xl">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                    Pending Collaboration Requests
                    <Badge variant="secondary" className="rounded-full px-3 py-0.5 glass-card text-accent-hive border-accent-hive/20">
                      {(contributionsData?.data || []).filter(c => c.status === 'pending').length}
                    </Badge>
                  </h3>
                  {isLoadingContributions ? (
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : (
                    <ContributionList
                      contributions={contributionsData?.data?.filter(c => c.status === 'pending') || []}
                      isHost={!!isHost}
                      onAccept={isHost ? handleAcceptContribution : undefined}
                      onDecline={isHost ? handleDeclineContribution : undefined}
                      isProcessing={acceptContributionMutation.isPending || declineContributionMutation.isPending}
                    />
                  )}
                </div>
              )}
            </TabsContent>

            {/* Submit Tab */}
            {project.status === 'open' && !isHost && !isAcceptedContributor && (
              <TabsContent value="submit" className="mt-6">
                <div className="glass-card p-8 rounded-2xl">
                  <ContributionForm
                    projectTitle={project.title}
                    onSubmit={handleContributionSubmit}
                    isLoading={createContributionMutation.isPending || updateContributionMutation.isPending}
                    isHost={!!isHost}
                    hasExistingContribution={!!hasContributed}
                    existingContribution={userContribution}
                    onDelete={handleContributionDelete}
                    isDeleting={deleteContributionMutation.isPending}
                  />
                  {(createContributionMutation.isError || updateContributionMutation.isError || deleteContributionMutation.isError) && (
                    <div className="mt-4">
                      <ErrorMessage
                        message={
                          createContributionMutation.error?.message ||
                          updateContributionMutation.error?.message ||
                          deleteContributionMutation.error?.message ||
                          'An error occurred'
                        }
                        type="error"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            )}

            {/* Implementation Tab */}
            {canChat && (
              <TabsContent value="implementation" className="mt-6">
                <div className="glass-card p-6 rounded-2xl min-h-[400px]">
                  <ProjectImplementation projectId={id!} isHost={!!isHost} />
                </div>
              </TabsContent>
            )}

            {/* Chat Tab */}
            {canChat && (
              <TabsContent value="chat" className="mt-6">
                <div className="glass-card rounded-2xl overflow-hidden h-[600px]">
                  <ChatRoom projectId={id!} />
                </div>
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
