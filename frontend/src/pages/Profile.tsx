import React, { useState, useLayoutEffect, useRef } from 'react';
import { useMyProfile, useUpdateProfile } from '../hooks/useProfile';
import { useMyCreditBalance, useMyCreditLedger } from '../hooks/useCredits';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import ProfileForm from '../components/ProfileForm';
import CreditLedger from '../components/CreditLedger';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { User, Award, Mail, Calendar, Edit, ShieldCheck, Github, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { type ProfileFormData } from '../schemas/profileSchema';
import { gsap } from 'gsap';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useMyProfile();
  const { data: creditBalance, isLoading: isLoadingCredits } = useMyCreditBalance();
  const { data: creditLedger, isLoading: isLoadingLedger } = useMyCreditLedger();
  const updateProfileMutation = useUpdateProfile();

  useLayoutEffect(() => {
    if (profile) {
      const ctx = gsap.context(() => {
        gsap.from(".profile-header-anim", {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: "power3.out"
        });
        gsap.from(".stat-card-anim", {
          opacity: 0,
          y: 30,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.2
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [profile]);

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Syncing user profile..." />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="glass-card p-8 rounded-2xl text-center">
          <ErrorMessage message="Failed to load your profile profile." type="error" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col" ref={containerRef}>
      <div className="container-wide py-8">
        {/* Profile Header */}
        <div className="profile-header-anim glass-card p-8 rounded-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-hive/5 rounded-full blur-[100px] -mr-48 -mt-48" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-accent-hive/20 rounded-full blur-xl group-hover:bg-accent-hive/30 transition-all duration-500" />
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-accent-hive/20 to-accent-hive-dark/20 flex items-center justify-center border-2 border-accent-hive/30 relative">
                  <User className="h-12 w-12 md:h-16 md:w-16 text-accent-hive" />
                  <div className="absolute -bottom-1 -right-1 bg-accent-hive text-black p-1.5 rounded-full shadow-lg">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gradient">
                    {profile.display_name}
                  </h1>
                </div>
                <p className="text-muted-foreground font-medium">@{profile.username}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-accent-hive/70" />
                    {profile.email}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-accent-hive/70" />
                    Joined {format(new Date(profile.created_at), 'MMM yyyy')}
                  </div>
                </div>
              </div>
            </div>

            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="lg" className="glass-card border-white/10 hover:bg-white/5 group">
                <Edit className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Intelligence Credits', value: creditBalance?.total_credits || 0, icon: Award, color: 'text-accent-hive' },
            { label: 'Successful Merges', value: creditBalance?.awards || 0, icon: ShieldCheck, color: 'text-green-500' },
            { label: 'Global Ranking', value: 'Alpha', icon: Globe, color: 'text-blue-500' }
          ].map((stat, i) => (
            <div key={i} className="stat-card-anim glass-card p-6 rounded-2xl group hover:border-accent-hive/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-extrabold text-gradient">
                    {isLoadingCredits && i === 0 ? '...' : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue={isEditing ? 'edit' : 'overview'} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 glass-card p-1.5 h-12 rounded-2xl">
            <TabsTrigger value="overview" onClick={() => setIsEditing(false)} className="rounded-xl data-[state=active]:bg-accent-hive data-[state=active]:text-black transition-all">
              Neural Overview
            </TabsTrigger>
            <TabsTrigger value="edit" className="rounded-xl data-[state=active]:bg-accent-hive data-[state=active]:text-black transition-all">Identity Engine</TabsTrigger>
            <TabsTrigger value="credits" className="rounded-xl data-[state=active]:bg-accent-hive data-[state=active]:text-black transition-all">Credit Ledger</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="glass-card p-8 rounded-2xl">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-accent-hive rounded-full" />
                    Bio-Documentation
                  </h3>
                  {profile.bio ? (
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-lg font-light">
                      {profile.bio}
                    </p>
                  ) : (
                    <p className="text-muted-foreground/50 italic text-lg font-light">No bio intelligence provided yet.</p>
                  )}
                </div>

                {profile.skills && profile.skills.length > 0 && (
                  <div className="glass-card p-8 rounded-2xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-accent-hive rounded-full" />
                      Protocol Skills
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.skills.map((skill) => (
                        <div key={skill} className="px-4 py-2 rounded-xl glass-card border-accent-hive/20 text-accent-hive text-sm font-semibold hover:border-accent-hive transition-all">
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                <div className="glass-card p-8 rounded-2xl">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-accent-hive rounded-full" />
                    Linked Arrays
                  </h3>
                  <div className="space-y-4">
                    {profile.github_url ? (
                      <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl glass-card hover:bg-white/5 border-white/5 transition-all group">
                        <Github className="h-6 w-6 text-accent-hive group-hover:scale-110 transition-transform" />
                        <div>
                          <p className="text-xs font-bold uppercase text-muted-foreground">GitHub</p>
                          <p className="text-sm font-medium truncate max-w-[150px]">{profile.github_url.replace('https://github.com/', '')}</p>
                        </div>
                      </a>
                    ) : (
                      <div className="p-4 border border-dashed border-white/10 rounded-xl text-center text-xs text-muted-foreground">
                        GitHub not linked
                      </div>
                    )}

                    {profile.portfolio_url ? (
                      <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl glass-card hover:bg-white/5 border-white/5 transition-all group">
                        <Globe className="h-6 w-6 text-accent-hive group-hover:scale-110 transition-transform" />
                        <div>
                          <p className="text-xs font-bold uppercase text-muted-foreground">Portfolio</p>
                          <p className="text-sm font-medium truncate max-w-[150px]">{profile.portfolio_url.replace('https://', '')}</p>
                        </div>
                      </a>
                    ) : (
                      <div className="p-4 border border-dashed border-white/10 rounded-xl text-center text-xs text-muted-foreground">
                        Portfolio not linked
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="edit">
            <div className="glass-card p-8 rounded-2xl">
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
                <div className="mt-6">
                  <ErrorMessage
                    message={updateProfileMutation.error?.message || 'Failed to update user profile identity'}
                    type="error"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="credits" className="space-y-8">
            <div className="glass-card p-8 rounded-2xl">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-2xl font-bold">Credit Breakdown</h3>
                  <p className="text-muted-foreground">Historical analysis of your intelligence contributions</p>
                </div>
                <div className="px-6 py-3 rounded-2xl glass-card border-accent-hive/20">
                  <span className="text-sm font-bold text-accent-hive uppercase tracking-widest mr-4">Total Liquid</span>
                  <span className="text-3xl font-extrabold">{creditBalance?.total_credits || 0}</span>
                </div>
              </div>

              {isLoadingCredits ? (
                <div className="py-12 flex justify-center"><LoadingSpinner /></div>
              ) : creditBalance ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { label: 'Intelligence Awards', value: creditBalance.awards, color: 'text-green-500' },
                    { label: 'Protocol Reversals', value: creditBalance.reversals, color: 'text-red-500' },
                    { label: 'System Adjustments', value: creditBalance.adjustments, color: 'text-blue-500' }
                  ].map((chip, k) => (
                    <div key={k} className="p-6 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-2">{chip.label}</p>
                      <p className={`text-3xl font-black ${chip.color}`}>{chip.value}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-8">Protocol Ledger</h3>
              <CreditLedger
                entries={creditLedger?.data || []}
                isLoading={isLoadingLedger}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
