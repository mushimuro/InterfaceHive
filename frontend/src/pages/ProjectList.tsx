import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import type { ProjectFilters as FilterType } from '../api/projects';
import { Button } from '../components/ui/button';
import ProjectCard from '../components/ProjectCard';
import ProjectFilters from '../components/ProjectFilters';
import { ProjectSkeletonGrid } from '../components/ProjectSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import { Plus, Search } from 'lucide-react';
import Pagination from '../components/Pagination';

const ProjectList: React.FC = () => {
  const [filters, setFilters] = useState<FilterType>({
    status: 'open',
    page: 1,
    page_size: 10,
    ordering: '-created_at',
  });

  const { data, isLoading, error } = useProjects(filters);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="px-4 lg:px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Discover Projects</h1>
                <p className="text-muted-foreground">
                  Find projects that match your skills and start contributing
                </p>
              </div>
              <Button asChild size="sm">
                <Link to="/projects/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Link>
              </Button>
            </div>

            {/* Filters */}
            <ProjectFilters filters={filters} onFiltersChange={setFilters} />
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

