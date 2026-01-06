import React, { useLayoutEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Badge } from '../components/ui/badge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Github, Globe, Calendar, Award, User, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { gsap } from 'gsap';

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
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: profile, isLoading, error } = useQuery<UserProfile, Error>({
    queryKey: ['public-profile', userId],
    queryFn: () => fetchPublicProfile(userId!),
    enabled: !!userId,
  });

  useLayoutEffect(() => {
    if (profile) {
      const ctx = gsap.context(() => {
        gsap.from(".profile-header-anim", {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: "power3.out"
        });
        gsap.from(".profile-content-anim", {
          opacity: 0,
          y: 20,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.2
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Retrieving analyst identity..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="glass-card p-12 rounded-3xl inline-block">
          <ErrorMessage message="Failed to load user profile interface." type="error" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col" ref={containerRef}>
      <div className="container max-w-5xl mx-auto py-12 px-4 lg:px-6">

        {/* Profile Header */}
        <div className="profile-header-anim glass-card p-8 md:p-12 rounded-3xl mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-hive/5 rounded-full blur-[100px] -mr-48 -mt-48" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-accent-hive/20 rounded-full blur-2xl group-hover:bg-accent-hive/35 transition-all duration-700" />
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-accent-hive/30 to-accent-hive-dark/10 flex items-center justify-center border-2 border-accent-hive/40 relative shadow-2xl">
                <User className="h-16 w-16 md:h-20 md:w-20 text-accent-hive" />
                <div className="absolute bottom-1 right-2 bg-accent-hive text-black p-2 rounded-full shadow-xl border-4 border-black/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-gradient leading-tight">
                  {profile.display_name}
                </h1>
                <p className="text-accent-hive/80 font-mono text-sm tracking-[0.2em] mt-2">ANALYST_ID: {profile.id.split('-')[0].toUpperCase()}</p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
                <div className="flex items-center gap-2 text-muted-foreground bg-white/5 py-2 px-4 rounded-full border border-white/5">
                  <Calendar className="h-4 w-4 text-accent-hive/70" />
                  <span className="text-sm font-medium">EST. {format(new Date(profile.created_at), 'MMMM yyyy').toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground bg-white/5 py-2 px-4 rounded-full border border-white/5">
                  <Award className="h-4 w-4 text-accent-hive/70" />
                  <span className="text-sm font-bold text-accent-hive">{profile.total_credits} CREDITS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Detailed Intel Column */}
          <div className="lg:col-span-2 space-y-10">

            {profile.bio && (
              <div className="profile-content-anim glass-card p-10 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-accent-hive group-hover:w-2 transition-all duration-300" />
                <h3 className="text-2xl font-black mb-6 uppercase tracking-widest text-white/90">Bio Intelligence</h3>
                <p className="text-muted-foreground text-xl font-light leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div className="profile-content-anim glass-card p-10 rounded-3xl">
                <h3 className="text-2xl font-black mb-8 uppercase tracking-widest text-white/90">Protocol Skills</h3>
                <div className="flex flex-wrap gap-4">
                  {profile.skills.map((skill, index) => (
                    <div key={index} className="px-6 py-3 rounded-2xl glass-card border-accent-hive/20 text-accent-hive font-bold tracking-wide hover:border-accent-hive hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-accent-hive/5">
                      {skill.toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Intel */}
          <div className="space-y-10">

            {/* Linked Arrays */}
            <div className="profile-content-anim glass-card p-8 rounded-3xl">
              <h3 className="text-xl font-black mb-8 uppercase tracking-widest text-white/90">Linked Arrays</h3>
              <div className="space-y-4">
                {profile.github_url ? (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-5 p-5 rounded-2xl glass-card border-white/5 hover:bg-white/10 hover:border-accent-hive/50 transition-all duration-300 group">
                    <div className="p-3 rounded-xl bg-accent-hive group-hover:scale-110 transition-transform shadow-lg shadow-accent-hive/20">
                      <Github className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-muted-foreground uppercase mb-1">Source Repository</p>
                      <p className="text-sm font-bold truncate max-w-[140px] text-white/80">GitHub Protocol</p>
                    </div>
                  </a>
                ) : (
                  <div className="p-6 border border-dashed border-white/10 rounded-2xl text-center text-xs text-muted-foreground/50">
                    NULL_GITHUB
                  </div>
                )}

                {profile.portfolio_url ? (
                  <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-5 p-5 rounded-2xl glass-card border-white/5 hover:bg-white/10 hover:border-accent-hive/50 transition-all duration-300 group">
                    <div className="p-3 rounded-xl bg-accent-hive group-hover:scale-110 transition-transform shadow-lg shadow-accent-hive/20">
                      <Globe className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-muted-foreground uppercase mb-1">Interface Portfolio</p>
                      <p className="text-sm font-bold truncate max-w-[140px] text-white/80">Web Domain</p>
                    </div>
                  </a>
                ) : (
                  <div className="p-6 border border-dashed border-white/10 rounded-2xl text-center text-xs text-muted-foreground/50">
                    NULL_PORTFOLIO
                  </div>
                )}
              </div>
            </div>

            {/* Performance Index */}
            <div className="profile-content-anim glass-card p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent">
              <h3 className="text-xl font-black mb-8 uppercase tracking-widest text-white/90">Performance</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm font-bold uppercase">Merge Success</span>
                  <span className="text-accent-hive font-black">100%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-accent-hive" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm font-bold uppercase">Intel Yield</span>
                  <span className="text-white font-black">{profile.total_credits}</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-[85%] h-full bg-accent-hive/50" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
