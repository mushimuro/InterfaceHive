import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { FileText, CheckCircle, XCircle, Clock, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { useMyContributions, useUpdateContribution, useDeleteContribution } from '../hooks/useContributions';
import Pagination from '../components/Pagination';

const MyContributions: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading, error } = useMyContributions({
    status: statusFilter,
    page,
    page_size: 10,
  });

  const updateMutation = useUpdateContribution();
  const deleteMutation = useDeleteContribution();

  const contributions = data?.data || [];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        );
      case 'declined':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0">
            <XCircle className="h-3 w-3 mr-1" />
            Declined
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEdit = (projectId: string) => {
    navigate(`/projects/${projectId}?tab=submit`);
  };

  const handleDelete = async (contributionId: string) => {
    if (window.confirm('Are you sure you want to withdraw this contribution? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(contributionId);
      } catch (error) {
        console.error('Failed to withdraw contribution:', error);
      }
    }
  };

  const stats = {
    total: data?.count || 0,
    pending: contributions.filter((c: any) => c.status === 'pending').length,
    accepted: contributions.filter((c: any) => c.status === 'accepted').length,
    declined: contributions.filter((c: any) => c.status === 'declined').length,
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-6 md:gap-6 md:py-8">
          <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">My Contributions</h1>
              <p className="text-muted-foreground text-sm">
                Manage and track all your contributions to the InterfaceHive community
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Contributions</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
                    <p className="text-xs text-muted-foreground">Accepted</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">{stats.declined}</p>
                    <p className="text-xs text-muted-foreground">Declined</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for filtering */}
            <Tabs
              defaultValue="all"
              onValueChange={(value) => {
                setStatusFilter(value === 'all' ? undefined : value.toLowerCase());
                setPage(1);
              }}
            >
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="accepted">Accepted</TabsTrigger>
                <TabsTrigger value="declined">Declined</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                {/* Content handled by the shared rendering below */}
              </TabsContent>

              {isLoading && (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" text="Loading contributions..." />
                </div>
              )}

              {error && <ErrorMessage message="Failed to load contributions." type="error" />}

              {!isLoading && !error && contributions.length === 0 && (
                <Card>
                  <CardContent className="text-center py-16">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                    <h3 className="text-lg font-semibold mb-2">No contributions yet</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                      Start contributing to projects to earn credits and build your reputation!
                    </p>
                    <Button asChild>
                      <Link to="/projects">Browse Projects</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {!isLoading && !error && contributions.length > 0 && (
                <div className="space-y-4">
                  {contributions.map((contribution) => (
                    <Card key={contribution.id} className="hover:shadow-md transition-all">
                      <div className="border-b p-4">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <Link to={`/projects/${contribution.project}`}>
                              <h3 className="text-lg font-medium hover:text-primary transition-colors mb-1">
                                {contribution.project_title}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Submitted {format(new Date(contribution.created_at), 'MMM d, yyyy')}</span>
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(contribution.status)}
                        </div>
                      </div>

                      {contribution.status === 'pending' && (
                        <div className="bg-muted/30 border-t px-4 py-3 flex items-center justify-end">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => handleEdit(contribution.project)}
                              disabled={updateMutation.isPending}
                            >
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-destructive hover:text-destructive"
                              onClick={() => handleDelete(contribution.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Withdraw
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination (shared across all tabs) */}
              {data && (
                <Pagination
                  currentPage={data.current_page}
                  totalPages={data.total_pages}
                  onPageChange={(p) => setPage(p)}
                />
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyContributions;
