import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Calendar, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface Contribution {
  id: string;
  project: string;
  project_title: string;
  title?: string;
  body: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  decided_by_name?: string;
  decided_at?: string;
  created_at: string;
}

const fetchMyContributions = async (statusFilter?: string): Promise<Contribution[]> => {
  const params = statusFilter ? { status: statusFilter } : {};
  const response = await apiClient.get('/contributions/me/', { params });
  return response.data.data || response.data.results || [];
};

const MyContributions: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  
  const { data: contributions, isLoading, error } = useQuery<Contribution[], Error>({
    queryKey: ['my-contributions', statusFilter],
    queryFn: () => fetchMyContributions(statusFilter),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        );
      case 'DECLINED':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="h-3 w-3 mr-1" />
            Declined
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusCounts = () => {
    if (!contributions) return { pending: 0, accepted: 0, declined: 0, total: 0 };
    return {
      pending: contributions.filter(c => c.status === 'PENDING').length,
      accepted: contributions.filter(c => c.status === 'ACCEPTED').length,
      declined: contributions.filter(c => c.status === 'DECLINED').length,
      total: contributions.length,
    };
  };

  const stats = getStatusCounts();

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Contributions</h1>
        <p className="text-muted-foreground">
          Track the status of all your submitted contributions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              <p className="text-sm text-muted-foreground">Accepted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
              <p className="text-sm text-muted-foreground">Declined</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for filtering */}
      <Tabs defaultValue="all" onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="PENDING">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="ACCEPTED">Accepted ({stats.accepted})</TabsTrigger>
          <TabsTrigger value="DECLINED">Declined ({stats.declined})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {isLoading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Loading contributions..." />
            </div>
          )}

          {error && <ErrorMessage message="Failed to load contributions." type="error" />}

          {!isLoading && !error && contributions && contributions.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No contributions yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start contributing to projects to earn credits!
                </p>
                <Link to="/projects" className="text-primary hover:underline mt-4 inline-block">
                  Browse Projects
                </Link>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && contributions && contributions.length > 0 && (
            <div className="space-y-4">
              {contributions.map((contribution) => (
                <Card key={contribution.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Link to={`/projects/${contribution.project}`}>
                          <CardTitle className="text-lg hover:text-primary transition-colors">
                            {contribution.project_title}
                          </CardTitle>
                        </Link>
                        {contribution.title && (
                          <CardDescription className="mt-1">
                            {contribution.title}
                          </CardDescription>
                        )}
                      </div>
                      {getStatusBadge(contribution.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm line-clamp-3">{contribution.body}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Submitted {format(new Date(contribution.created_at), 'MMM d, yyyy')}</span>
                        </div>
                        {contribution.decided_at && (
                          <div className="flex items-center gap-1">
                            <span>
                              {contribution.status === 'ACCEPTED' ? 'Accepted' : 'Declined'} by{' '}
                              {contribution.decided_by_name} on {format(new Date(contribution.decided_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Content is the same for other tabs, just filtered */}
        <TabsContent value="PENDING" className="mt-6">
          {/* Same content as "all" but filtered */}
        </TabsContent>
        <TabsContent value="ACCEPTED" className="mt-6">
          {/* Same content as "all" but filtered */}
        </TabsContent>
        <TabsContent value="DECLINED" className="mt-6">
          {/* Same content as "all" but filtered */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyContributions;

