import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'OPEN' | 'CLOSED';
  difficulty?: string;
  tags?: string[];
  contribution_count: number;
  estimated_time?: string;
  created_at: string;
  updated_at: string;
}

const fetchMyProjects = async (statusFilter?: string): Promise<Project[]> => {
  const params = statusFilter ? { status: statusFilter } : {};
  const response = await apiClient.get('/projects/my/', { params });
  return response.data.data || response.data.results || [];
};

const MyProjects: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const { data: projects, isLoading, error } = useQuery<Project[], Error>({
    queryKey: ['my-projects', statusFilter],
    queryFn: () => fetchMyProjects(statusFilter),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-0">Active</Badge>;
      case 'CLOSED':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">Completed</Badge>;
      case 'DRAFT':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-0">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusCounts = () => {
    if (!projects) return { open: 0, closed: 0, draft: 0, total: 0 };
    return {
      open: projects.filter(p => p.status === 'OPEN').length,
      closed: projects.filter(p => p.status === 'CLOSED').length,
      draft: projects.filter(p => p.status === 'DRAFT').length,
      total: projects.length,
    };
  };

  const stats = getStatusCounts();

  const filteredProjects = projects?.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
              onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value.toUpperCase())}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Requests ({stats.total})</TabsTrigger>
                <TabsTrigger value="open">Active ({stats.open})</TabsTrigger>
                <TabsTrigger value="closed">Completed ({stats.closed})</TabsTrigger>
                <TabsTrigger value="draft">Drafts ({stats.draft})</TabsTrigger>
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

              <TabsContent value="all">
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
                    {filteredProjects.map((project) => (
                      <Card key={project.id} className="hover:shadow-md transition-all">
                        <div className="flex flex-col md:flex-row gap-4 p-5">
                          {/* Stats Sidebar */}
                          <div className="flex md:flex-col items-center justify-around md:justify-start gap-4 md:gap-0 md:min-w-[80px] text-center">
                            <div className="mb-0 md:mb-3">
                              <div className="text-2xl font-bold">{project.contribution_count}</div>
                              <div className="text-xs text-muted-foreground">Responses</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-green-600">40</div>
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
                                <span>3 new contributors</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                <span>158 views</span>
                              </div>
                            </div>

                            {project.tags && project.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {project.tags.slice(0, 4).map((tag) => (
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
                              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Other tabs render the same content, filtering is handled by queryKey */}
              <TabsContent value="open">
                {/* Content same as "all" tab */}
              </TabsContent>
              <TabsContent value="closed">
                {/* Content same as "all" tab */}
              </TabsContent>
              <TabsContent value="draft">
                {/* Content same as "all" tab */}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProjects;

