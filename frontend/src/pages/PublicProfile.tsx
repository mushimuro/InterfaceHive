import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import CreditBadge from '../components/CreditBadge';
import { Github, Globe, Calendar, Award } from 'lucide-react';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  display_name: string;
  bio: string;
  skills: string[];
  github_url: string;
  portfolio_url: string;
  total_credits: number;
  created_at: string;
}

const fetchPublicProfile = async (userId: string): Promise<UserProfile> => {
  const response = await apiClient.get(`/auth/${userId}/`);
  return response.data.data || response.data;
};

const PublicProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  const { data: profile, isLoading, error } = useQuery<UserProfile, Error>({
    queryKey: ['public-profile', userId],
    queryFn: () => fetchPublicProfile(userId!),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <ErrorMessage message="Failed to load user profile." type="error" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{profile.display_name}</CardTitle>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    Joined {format(new Date(profile.created_at), 'MMMM yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <CreditBadge credits={profile.total_credits} showLabel />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {profile.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {(profile.github_url || profile.portfolio_url) && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Links</h3>
              <div className="flex flex-col gap-2">
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub Profile</span>
                  </a>
                )}
                {profile.portfolio_url && (
                  <a
                    href={profile.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Portfolio Website</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Contribution Stats</CardTitle>
          <CardDescription>Recognition earned on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary">{profile.total_credits}</div>
              <div className="text-sm text-muted-foreground mt-1">Credits Earned</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary">{profile.total_credits}</div>
              <div className="text-sm text-muted-foreground mt-1">Projects Contributed</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-muted-foreground">
                {profile.skills?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Skills Listed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicProfile;

