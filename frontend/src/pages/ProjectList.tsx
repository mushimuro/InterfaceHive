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

const ProjectList: React.FC = () => {
  const [filters, setFilters] = useState<FilterType>({
    status: 'OPEN',
    page: 1,
    page_size: 20,
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
                {data.results.map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              {/* Pagination */}
              {data.total_pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.current_page === 1}
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    Page {data.current_page} of {data.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.current_page === data.total_pages}
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                  >
                    Next
                  </Button>
                </div>
              )}

              {/* No Results */}
              {data.results.length === 0 && (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground text-lg font-medium">
                      No projects found
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

