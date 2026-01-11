import React, { useState, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { FileText, CheckCircle, XCircle, Clock, Edit, Trash2, Award, Zap, History } from 'lucide-react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { useMyContributions, useUpdateContribution, useDeleteContribution } from '../hooks/useContributions';
import Pagination from '../components/Pagination';
import { gsap } from 'gsap';

const MyContributions: React.FC = () => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useMyContributions({
    status: statusFilter,
    page,
    page_size: 10,
  });

  const updateMutation = useUpdateContribution();
  const deleteMutation = useDeleteContribution();

  useLayoutEffect(() => {
    if (data && !isLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".contrib-header-anim",
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out", clearProps: "all" }
        );
        gsap.fromTo(".contrib-stat-anim",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.2, clearProps: "all" }
        );
        gsap.fromTo(".contrib-row-anim",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out", delay: 0.4, clearProps: "all" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [data, isLoading]);

  const contributions = data?.data || [];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return (
          <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 uppercase text-[10px] tracking-widest px-2 py-0.5">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t('myContributions.activeProtocol')}
          </Badge>
        );
      case 'declined':
        return (
          <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 uppercase text-[10px] tracking-widest px-2 py-0.5">
            <XCircle className="h-3 w-3 mr-1" />
            {t('myContributions.terminated')}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase text-[10px] tracking-widest px-2 py-0.5">
            <Clock className="h-3 w-3 mr-1" />
            {t('myContributions.underReview')}
          </Badge>
        );
      default:
        return <Badge variant="outline" className="uppercase text-[10px] tracking-widest">{status}</Badge>;
    }
  };

  const handleEdit = (projectId: string) => {
    navigate(`/projects/${projectId}?tab=submit`);
  };

  const handleDelete = async (contributionId: string) => {
    if (window.confirm('Are you sure you want to withdraw this contribution request? Internal records will be updated.')) {
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
    <div className="flex flex-1 flex-col" ref={containerRef}>
      <div className="container mx-auto px-4 lg:px-6 py-10">

        {/* Header */}
        <div className="contrib-header-anim mb-12 relative overflow-hidden glass-card p-10 rounded-3xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent-hive/5 rounded-full blur-[100px] -mr-40 -mt-40" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-accent-hive/10 border border-accent-hive/20 shadow-inner">
                <History className="h-10 w-10 text-accent-hive" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gradient">{t('myContributions.title')}</h1>
                <p className="text-muted-foreground text-lg font-light mt-1">
                  {t('myContributions.subtitle')}
                </p>
              </div>
            </div>
            <Link to="/projects" className="premium-button whitespace-nowrap px-8 py-4 h-auto text-sm">
              <Zap className="mr-2 h-5 w-5" />
              {t('myContributions.exploreOps')}
            </Link>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: t('myContributions.totalInvocations'), value: stats.total, icon: FileText, color: 'text-accent-hive' },
            { label: t('myContributions.pendingAudit'), value: stats.pending, icon: Clock, color: 'text-amber-500' },
            { label: t('myContributions.verifiedMerges'), value: stats.accepted, icon: CheckCircle, color: 'text-green-500' },
            { label: t('myContributions.legacyData'), value: stats.declined, icon: XCircle, color: 'text-red-500' }
          ].map((stat, i) => (
            <div key={i} className="contrib-stat-anim glass-card p-6 rounded-2xl text-center group hover:border-accent-hive/30 transition-all">
              <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color} w-fit mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-3xl font-black text-gradient">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <Tabs
          defaultValue="all"
          onValueChange={(value) => {
            setStatusFilter(value === 'all' ? undefined : value.toLowerCase());
            setPage(1);
          }}
          className="mb-8"
        >
          <TabsList className="grid w-full grid-cols-4 glass-card p-1.5 h-12 rounded-2xl">
            <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-accent-hive data-[state=active]:text-black text-[11px] font-bold uppercase tracking-wider">{t('myContributions.historical')}</TabsTrigger>
            <TabsTrigger value="pending" className="rounded-xl data-[state=active]:bg-accent-hive data-[state=active]:text-black text-[11px] font-bold uppercase tracking-wider">{t('myContributions.underReview')}</TabsTrigger>
            <TabsTrigger value="accepted" className="rounded-xl data-[state=active]:bg-accent-hive data-[state=active]:text-black text-[11px] font-bold uppercase tracking-wider">{t('myContributions.accepted')}</TabsTrigger>
            <TabsTrigger value="declined" className="rounded-xl data-[state=active]:bg-accent-hive data-[state=active]:text-black text-[11px] font-bold uppercase tracking-wider">{t('myContributions.declined')}</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0 pt-8">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground text-sm font-light tracking-[0.3em] animate-pulse uppercase">{t('myContributions.loading')}</p>
              </div>
            )}

            {error && (
              <div className="glass-card p-10 rounded-3xl text-center">
                <ErrorMessage message={t('myContributions.error')} type="error" />
              </div>
            )}

            {!isLoading && !error && contributions.length === 0 && (
              <div className="glass-card p-24 rounded-3xl text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
                  <FileText className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <h3 className="text-2xl font-black text-white/50 mb-3 uppercase tracking-widest">{t('myContributions.noContributions')}</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-10 font-light text-lg">
                  {t('myContributions.noContributionsDesc')}
                </p>
                <Link to="/projects" className="premium-button px-12 py-4 h-auto">
                  {t('myContributions.browseOperations')}
                </Link>
              </div>
            )}

            {!isLoading && !error && contributions.length > 0 && (
              <div className="space-y-6">
                {contributions.map((contribution) => (
                  <div key={contribution.id} className="contrib-row-anim group glass-card p-6 rounded-2xl hover:border-accent-hive/30 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-accent-hive/20 group-hover:bg-accent-hive transition-all duration-300" />

                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-8 relative z-10">

                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between md:justify-start gap-4">
                          {getStatusBadge(contribution.status)}
                          <span className="text-[10px] font-mono text-muted-foreground/40">{contribution.id.split('-')[0].toUpperCase()}</span>
                        </div>

                        <Link to={`/projects/${contribution.project}`}>
                          <h3 className="text-2xl font-bold hover:text-accent-hive transition-colors tracking-tight">
                            {contribution.project_title}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-accent-hive/60" />
                            <span>{t('myContributions.submitted')} {format(new Date(contribution.created_at), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="h-3.5 w-3.5 text-accent-hive/60" />
                            <span>{t('myContributions.intelligenceOps')}</span>
                          </div>
                        </div>
                      </div>

                      {contribution.status === 'pending' && (
                        <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/5 pl-0 md:pl-8">
                          <button
                            onClick={() => handleEdit(contribution.project)}
                            disabled={updateMutation.isPending}
                            className="p-3 rounded-xl glass-card border-white/10 hover:bg-white/5 text-accent-hive/70 transition-all flex items-center gap-2 text-xs font-bold uppercase"
                          >
                            <Edit className="h-4 w-4" />
                            <span>{t('myContributions.modify')}</span>
                          </button>
                          <button
                            onClick={() => handleDelete(contribution.id)}
                            disabled={deleteMutation.isPending}
                            className="p-3 rounded-xl glass-card border-white/10 hover:bg-red-500/10 text-red-400/70 transition-all flex items-center gap-2 text-xs font-bold uppercase"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>{t('myContributions.withdraw')}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {data && (
                  <div className="pt-10">
                    <Pagination
                      currentPage={data.current_page || 1}
                      totalPages={data.total_pages || 1}
                      onPageChange={(p) => setPage(p)}
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyContributions;
