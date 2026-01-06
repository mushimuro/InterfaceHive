import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="px-4 lg:px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
                  Discover <span className="text-gradient">Projects</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  Find unique project opportunities, collaborate with experts, and earn rewards for your contributions.
                </p>
              </div>
              <Link to="/projects/create" className="premium-button">
                <Plus className="mr-2 h-5 w-5" />
                Create Project
              </Link>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 rounded-xl mb-8">
              <ProjectFilters filters={filters} onFiltersChange={setFilters} />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="px-4 lg:px-6">
              <ProjectSkeletonGrid count={6} />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="px-4 lg:px-6">
              <ErrorMessage
                message="Failed to load projects. Please try again."
                type="error"
              />
            </div>
          )}

          {/* Projects Grid */}
          {data && !isLoading && (
            <div className="px-4 lg:px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {data.data.map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={data.current_page}
                totalPages={data.total_pages}
                onPageChange={(p) => setFilters({ ...filters, page: p })}
              />

              {/* No Results */}
              {data.data.length === 0 && (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground text-lg font-medium">
                      There is no project available
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Try adjusting your search filters.
                    </p>
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

