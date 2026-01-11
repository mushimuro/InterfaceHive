import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjects } from '../hooks/useProjects';
import type { ProjectFilters as FilterType } from '../api/projects';
import ProjectCard from '../components/ProjectCard';
import ProjectFilters from '../components/ProjectFilters';
import { ProjectSkeletonGrid } from '../components/ProjectSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import { Plus, Search } from 'lucide-react';
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
  });

  const { data, isLoading, error } = useProjects(filters);
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
              <Link to="/projects/create" className="premium-button group">
                <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                {t('projects.create')}
              </Link>
            </div>

            {/* Filters */}
            <div className="glass-card-glow p-5 rounded-2xl mb-10">
              <ProjectFilters filters={filters} onFiltersChange={setFilters} />
            </div>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default ProjectList;

