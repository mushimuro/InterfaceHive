import React, { useState } from 'react';
import { useMyProfile, useUpdateProfile } from '../hooks/useProfile';
import { useMyCreditBalance, useMyCreditLedger } from '../hooks/useCredits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import ProfileForm from '../components/ProfileForm';
import CreditBadge from '../components/CreditBadge';
import CreditLedger from '../components/CreditLedger';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { User, Award, Mail, Calendar, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { type ProfileFormData } from '../schemas/profileSchema';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useMyProfile();
  const { data: creditBalance, isLoading: isLoadingCredits } = useMyCreditBalance();
  const { data: creditLedger, isLoading: isLoadingLedger } = useMyCreditLedger();
  const updateProfileMutation = useUpdateProfile();

  const handleUpdateProfile = async (data: ProfileFormData) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <ErrorMessage message="Failed to load profile." type="error" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile.display_name}</h1>
              <p className="text-muted-foreground">@{profile.username}</p>
            </div>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Credits</p>
                  <p className="text-2xl font-bold">
                    {isLoadingCredits ? '...' : creditBalance?.total_credits || 0}
                  </p>
                </div>
                <Award className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-sm font-medium truncate">{profile.email}</p>
                </div>
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-sm font-medium">
                    {format(new Date(profile.created_at), 'MMM yyyy')}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={isEditing ? 'edit' : 'overview'} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" onClick={() => setIsEditing(false)}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          <TabsTrigger value="credits">Credit History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.bio ? (
                <p className="whitespace-pre-wrap">{profile.bio}</p>
              ) : (
                <p className="text-muted-foreground italic">No bio added yet.</p>
              )}
            </CardContent>
          </Card>

          {profile.skills && profile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <CreditBadge key={skill} credits={0} showIcon={false} className="bg-primary/10 text-primary" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(profile.github_url || profile.portfolio_url) && (
            <Card>
              <CardHeader>
                <CardTitle>Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {profile.github_url && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">GitHub</p>
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profile.github_url}
                    </a>
                  </div>
                )}
                {profile.portfolio_url && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Portfolio</p>
                    <a
                      href={profile.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profile.portfolio_url}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Edit Tab */}
        <TabsContent value="edit">
          <ProfileForm
            initialData={{
              display_name: profile.display_name,
              bio: profile.bio || '',
              skills: profile.skills || [],
              github_url: profile.github_url || '',
              portfolio_url: profile.portfolio_url || '',
            }}
            onSubmit={handleUpdateProfile}
            isLoading={updateProfileMutation.isPending}
          />
          {updateProfileMutation.isError && (
            <div className="mt-4">
              <ErrorMessage
                message={updateProfileMutation.error?.message || 'Failed to update profile'}
                type="error"
              />
            </div>
          )}
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Credit Summary</CardTitle>
              <CardDescription>
                Your credit earning breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCredits ? (
                <LoadingSpinner />
              ) : creditBalance ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{creditBalance.total_credits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Awards</p>
                    <p className="text-2xl font-bold text-green-600">{creditBalance.awards}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reversals</p>
                    <p className="text-2xl font-bold text-red-600">{creditBalance.reversals}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Adjustments</p>
                    <p className="text-2xl font-bold text-blue-600">{creditBalance.adjustments}</p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div>
            <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
            <CreditLedger
              entries={creditLedger?.data || []}
              isLoading={isLoadingLedger}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;

