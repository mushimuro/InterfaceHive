import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjects } from '../hooks/useProjects';
import type { ProjectFilters as FilterType } from '../api/projects';
import ProjectCard from '../components/ProjectCard';
import ProjectFilters from '../components/ProjectFilters';
import { ProjectSkeletonGrid } from '../components/ProjectSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import { Plus, Search, Sparkles } from 'lucide-react';
import Pagination from '../components/Pagination';
import { gsap } from 'gsap';
import { useLayoutEffect, useRef } from 'react';

const ProjectList: React.FC = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<FilterType>({
    status: 'open',
    page: 1,
    page_size: 10,
    ordering: '-created_at',
    is_ai_generated: false,
  });

  const { data, isLoading, error } = useProjects(filters);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (data && !isLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".project-header-anim",
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out", clearProps: "all" }
        );
        gsap.fromTo(".project-filter-anim",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power3.out", clearProps: "all" }
        );
        gsap.fromTo(".project-card-item",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.4, ease: "power3.out", clearProps: "all" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [data, isLoading]);

  return (
    <div className="flex flex-1 flex-col pb-20" ref={containerRef}>
      <div className="container-wide py-10">

        {/* Header Section */}
        <div className="project-header-anim mb-12 relative overflow-hidden glass-card p-10 rounded-3xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent-hive/5 rounded-full blur-[100px] -mr-40 -mt-40" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-accent-hive/10 border border-accent-hive/20 shadow-inner">
                <Search className="h-10 w-10 text-accent-hive" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                  {t('projects.discoverTitle', 'Discover')} <span className="text-gradient-vivid">{t('projects.discoverHighlight', 'Projects')}</span>
                </h1>
                <p className="text-muted-foreground text-lg font-light mt-1 max-w-xl">
                  {t('projects.discoverSubtitle', 'Find unique opportunities, collaborate with experts, and earn rewards.')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-4">
              <Link to="/project-templates" className="premium-button bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 h-auto text-sm">
                <Sparkles className="mr-2 h-5 w-5" />
                {t('projects.viewTemplates', 'Templates')}
              </Link>
              <Link to="/projects/create" className="premium-button px-8 py-4 h-auto text-sm">
                <Plus className="mr-2 h-5 w-5" />
                {t('projects.create', 'Create Project')}
              </Link>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="project-filter-anim glass-card-glow p-6 rounded-2xl mb-12">
          <ProjectFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Content Area */}
        <div className="relative">
          {/* Loading State */}
          {isLoading && (
            <ProjectSkeletonGrid count={6} />
          )}

          {/* Error State */}
          {error && (
            <div className="glass-card p-10 rounded-3xl text-center">
              <ErrorMessage
                message={t('errors.failedToLoadProjects')}
                type="error"
              />
            </div>
          )}

          {/* Projects Grid */}
          {data && !isLoading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {data.data.map((project: any) => (
                  <div key={project.id} className="project-card-item">
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {data.total_pages > 1 && (
                <div className="mt-16">
                  <Pagination
                    currentPage={data?.current_page || 1}
                    totalPages={data?.total_pages || 1}
                    onPageChange={(p) => setFilters({ ...filters, page: p })}
                  />
                </div>
              )}

              {/* No Results */}
              {data.data.length === 0 && (
                <div className="glass-card p-24 rounded-3xl text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
                    <Search className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-2xl font-black text-white/50 mb-3 uppercase tracking-widest">
                    {t('projects.noProjectsFound', 'No Projects Found')}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-10 font-light text-lg">
                    {t('projects.noProjectsDescription', 'Try adjusting your filters or create a new project.')}
                  </p>
                  <Link to="/projects/create" className="premium-button px-12 py-4 h-auto">
                    <Plus className="mr-2 h-5 w-5" />
                    {t('projects.create', 'Create Project')}
                  </Link>
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

