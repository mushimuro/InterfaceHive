import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyProjects, useDeleteProject } from '../hooks/useProjects';
import type { Project } from '../api/projects';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Plus, Clock, Users, Eye, Edit, MessageSquare, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';

const MyProjects: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useMyProjects({
    status: statusFilter as any,
    page,
    page_size: 10,
  });

  const deleteMutation = useDeleteProject();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
  };

  const projects = data?.data || [];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-0">Active</Badge>;
      case 'closed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">Completed</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-0">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };


  const filteredProjects = projects.filter((project: Project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        {/* Header Section */}
        <div className="bg-background border-b">
          <div className="px-4 lg:px-6 py-8 md:py-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">My Requests</h1>
                <p className="text-sm text-muted-foreground">
                  Manage all the contribution requests you've created. Track responses, award credits, and update your project needs.
                </p>
              </div>
              <Button asChild size="sm">
                <Link to="/projects/create">
                  <Plus className="mr-2 h-4 w-4" />
                  New Request
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            {/* Tabs for filtering */}
            <Tabs
              defaultValue="all"
              onValueChange={(value) => {
                setStatusFilter(value === 'all' ? undefined : value.toLowerCase());
                setPage(1);
              }}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Requests</TabsTrigger>
                <TabsTrigger value="open">Active</TabsTrigger>
                <TabsTrigger value="closed">Completed</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
              </TabsList>

              {/* Filter Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 my-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="most_responses">Most Responses</SelectItem>
                      <SelectItem value="least_responses">Least Responses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search your requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-[300px] h-9"
                  />
                </div>
              </div>

              {isLoading && (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" text="Loading projects..." />
                </div>
              )}

              {error && <ErrorMessage message="Failed to load projects." type="error" />}

              {!isLoading && !error && filteredProjects.length === 0 && !searchQuery && (
                <Card>
                  <CardContent className="text-center py-16">
                    <div className="opacity-40 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground">
                        <path d="M2 20h.01"></path>
                        <path d="M7 20v-4"></path>
                        <path d="M12 20v-8"></path>
                        <path d="M17 20V8"></path>
                        <path d="M22 4v16"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No requests yet</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                      Create your first contribution request and start building with the community.
                    </p>
                    <Button asChild>
                      <Link to="/projects/create">Create Your First Request</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {!isLoading && !error && searchQuery && filteredProjects.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">No requests match your search.</p>
                  </CardContent>
                </Card>
              )}

              {!isLoading && !error && filteredProjects.length > 0 && (
                <div className="space-y-4">
                  {filteredProjects.map((project: Project) => (
                    <Card key={project.id} className="hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row gap-4 p-5">
                        {/* Stats Sidebar */}
                        <div className="flex md:flex-col items-center justify-around md:justify-start gap-4 md:gap-0 md:min-w-[80px] text-center">
                          <div className="mb-0 md:mb-3">
                            <div className="text-2xl font-bold">{project.contribution_count}</div>
                            <div className="text-xs text-muted-foreground">Responses</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">--</div>
                            <div className="text-xs text-muted-foreground">Credits</div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          {getStatusBadge(project.status)}
                          <Link to={`/projects/${project.id}`}>
                            <h3 className="text-lg font-medium mt-2 mb-1 hover:text-primary transition-colors">
                              {project.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {project.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Posted {format(new Date(project.created_at), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              <span>Contributors</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              <span>Views</span>
                            </div>
                          </div>

                          {project.tags && project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {project.tags.slice(0, 4).map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs font-normal">
                                  {tag}
                                </Badge>
                              ))}
                              {project.tags.length > 4 && (
                                <Badge variant="secondary" className="text-xs font-normal">
                                  +{project.tags.length - 4}
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/projects/${project.id}/edit`}>
                                <Edit className="mr-1.5 h-3.5 w-3.5" />
                                Edit
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/projects/${project.id}`}>
                                <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                                View Responses
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(project.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                              {deleteMutation.isPending && deleteMutation.variables === project.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {/* Pagination */}
                  {data && data.total_pages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={data.current_page === 1}
                        onClick={() => setPage(p => p - 1)}
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
                        onClick={() => setPage(p => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProjects;

