import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjects } from '../hooks/useProjects';
import type { ProjectFilters as FilterType } from '../api/projects';
import ProjectCard from '../components/ProjectCard';
import ProjectFilters from '../components/ProjectFilters';
import { ProjectSkeletonGrid } from '../components/ProjectSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import { Plus, Search, Sparkles, Lightbulb } from 'lucide-react';
import Pagination from '../components/Pagination';
import { gsap } from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const ProjectList: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('community');
  const [filters, setFilters] = useState<FilterType>({
    status: 'open',
    page: 1,
    page_size: 10,
    ordering: '-created_at',
  });
  const [aiFilters, setAiFilters] = useState<FilterType>({
    status: 'open',
    page: 1,
    page_size: 10,
    ordering: '-created_at',
    is_ai_generated: true,
  });

  const { data, isLoading, error } = useProjects(filters);
  const { data: aiData, isLoading: aiLoading, error: aiError } = useProjects(aiFilters);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (data && !isLoading) {
      const ctx = gsap.context(() => {
        gsap.from(".project-card-item", {
          opacity: 0,
          y: 30,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "all"
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [data, isLoading]);

  return (
    <div className="flex flex-1 flex-col" ref={containerRef}>
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-[hsl(var(--accent-hive))]/[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-[hsl(var(--accent-secondary))]/[0.02] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="@container/main flex flex-1 flex-col gap-2 relative">
        <div className="flex flex-col gap-4 py-8 md:gap-8 md:py-12">
          {/* Header */}
          <div className="container-wide">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
              <div className="space-y-3">
                <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
                  {t('projects.discoverTitle')} <span className="text-gradient-vivid">{t('projects.discoverHighlight')}</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
                  {t('projects.discoverSubtitle')}
                </p>
              </div>
              <div className="flex gap-3">
                <Link to="/projects/generate" className="premium-button bg-gradient-to-r from-purple-600 to-indigo-600 group">
                  <Sparkles className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  {t('projects.generateAI', 'Generate AI Project')}
                </Link>
                <Link to="/projects/create" className="premium-button group">
                  <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                  {t('projects.create')}
                </Link>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
              <TabsList className="glass-card-glow p-1 h-12 rounded-2xl inline-flex">
                <TabsTrigger value="community" className="rounded-xl px-6 data-[state=active]:bg-accent-hive data-[state=active]:text-white transition-all">
                  <Search className="h-4 w-4 mr-2" />
                  {t('projects.communityProjects', 'Community Projects')}
                </TabsTrigger>
                <TabsTrigger value="inspiration" className="rounded-xl px-6 data-[state=active]:bg-purple-500 data-[state=active]:text-white transition-all">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {t('projects.aiInspiration', 'AI Inspiration')}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Filters - Only show for community projects */}
            {activeTab === 'community' && (
              <div className="glass-card-glow p-5 rounded-2xl mb-10">
                <ProjectFilters filters={filters} onFiltersChange={setFilters} />
              </div>
            )}
            
            {/* Filters for AI projects */}
            {activeTab === 'inspiration' && (
              <div className="glass-card-glow p-5 rounded-2xl mb-10">
                <ProjectFilters filters={aiFilters} onFiltersChange={setAiFilters} />
              </div>
            )}
          </div>

          {/* Community Projects Tab */}
          {activeTab === 'community' && (
            <>
              {/* Loading State */}
              {isLoading && (
                <div className="container-wide">
                  <ProjectSkeletonGrid count={6} />
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="container-wide">
                  <ErrorMessage
                    message={t('errors.failedToLoadProjects')}
                    type="error"
                  />
                </div>
              )}

              {/* Projects Grid */}
              {data && !isLoading && (
                <div className="container-wide">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                    {data.data.map((project: any) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="mt-10">
                    <Pagination
                      currentPage={data?.current_page || 1}
                      totalPages={data?.total_pages || 1}
                      onPageChange={(p) => setFilters({ ...filters, page: p })}
                    />
                  </div>

                  {/* No Results */}
                  {data.data.length === 0 && (
                    <div className="text-center py-20">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                          <Search className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <div className="space-y-2">
                          <p className="font-display text-xl font-semibold text-foreground">
                            {t('projects.noProjectsFound')}
                          </p>
                          <p className="text-muted-foreground max-w-sm">
                            {t('projects.noProjectsDescription')}
                          </p>
                        </div>
                        <Link to="/projects/create" className="premium-button mt-2">
                          <Plus className="mr-2 h-4 w-4" />
                          {t('projects.create')}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* AI Inspiration Tab */}
          {activeTab === 'inspiration' && (
            <>
              {/* Info Banner */}
              <div className="container-wide mb-6">
                <div className="glass-card p-6 rounded-2xl bg-purple-500/5 border-purple-500/20">
                  <div className="flex items-start gap-4">
                    <Lightbulb className="h-6 w-6 text-purple-400 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-bold text-white/90 mb-2">
                        {t('projects.aiInspirationTitle', 'AI-Generated Project Ideas')}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('projects.aiInspirationDesc', 'These projects are automatically generated by AI to inspire you. Use them as a starting point for your own projects or contribute to make them real!')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {aiLoading && (
                <div className="container-wide">
                  <ProjectSkeletonGrid count={6} />
                </div>
              )}

              {/* Error State */}
              {aiError && (
                <div className="container-wide">
                  <ErrorMessage
                    message={t('errors.failedToLoadProjects')}
                    type="error"
                  />
                </div>
              )}

              {/* AI Projects Grid */}
              {aiData && !aiLoading && (
                <div className="container-wide">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                    {aiData.data.map((project: any) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="mt-10">
                    <Pagination
                      currentPage={aiData?.current_page || 1}
                      totalPages={aiData?.total_pages || 1}
                      onPageChange={(p) => setAiFilters({ ...aiFilters, page: p })}
                    />
                  </div>

                  {/* No Results */}
                  {aiData.data.length === 0 && (
                    <div className="text-center py-20">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                          <Sparkles className="h-8 w-8 text-purple-400/40" />
                        </div>
                        <div className="space-y-2">
                          <p className="font-display text-xl font-semibold text-foreground">
                            {t('projects.noAIProjects', 'No AI Projects Yet')}
                          </p>
                          <p className="text-muted-foreground max-w-sm">
                            {t('projects.noAIProjectsDesc', 'Generate your first AI project to get started!')}
                          </p>
                        </div>
                        <Link to="/projects/generate" className="premium-button bg-gradient-to-r from-purple-600 to-indigo-600 mt-2">
                          <Sparkles className="mr-2 h-4 w-4" />
                          {t('projects.generateAI', 'Generate AI Project')}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectList;

