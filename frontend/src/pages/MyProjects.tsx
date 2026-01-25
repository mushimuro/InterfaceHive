import React, { useState, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMyProjects, useDeleteProject, useUpdateProject } from '../hooks/useProjects';
import type { Project } from '../api/projects';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Plus, Clock, Users, Eye, Edit, Trash2, Search, ChevronDown, CheckCircle, FileEdit, Briefcase, LayoutGrid } from 'lucide-react';
import { format } from 'date-fns';
import Pagination from '../components/Pagination';
import { gsap } from 'gsap';

const StatusEditButton: React.FC<{ project: Project }> = ({ project }) => {
  const { t } = useTranslation();
  const updateMutation = useUpdateProject(project.id);

  const handleStatusChange = async (newStatus: 'open' | 'closed' | 'draft') => {
    try {
      await updateMutation.mutateAsync({ status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />;
      case 'closed': return <CheckCircle className="mr-2 h-4 w-4 text-green-500" />;
      case 'draft': return <FileEdit className="mr-2 h-4 w-4 text-gray-500" />;
      default: return null;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="glass-card border-white/10 h-8 text-[11px] font-bold uppercase tracking-wider" disabled={updateMutation.isPending}>
          <FileEdit className="mr-1.5 h-3.5 w-3.5 text-accent-hive/70" />
          {updateMutation.isPending ? t('myProjects.updating') : t('myProjects.setStatus')}
          <ChevronDown className="ml-1.5 h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card border-white/10 bg-black/80 backdrop-blur-xl">
        <DropdownMenuItem onClick={() => handleStatusChange('open')} disabled={project.status === 'open'} className="text-xs uppercase font-bold tracking-tight">
          {getStatusIcon('open')}
          {t('myProjects.openChannel')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('closed')} disabled={project.status === 'closed'} className="text-xs uppercase font-bold tracking-tight">
          {getStatusIcon('closed')}
          {t('myProjects.closeChannel')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('draft')} disabled={project.status === 'draft'} className="text-xs uppercase font-bold tracking-tight">
          {getStatusIcon('draft')}
          {t('myProjects.archiveDraft')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const MyProjects: React.FC = () => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useMyProjects({
    status: statusFilter as any,
    page,
    page_size: 10,
  });

  const deleteMutation = useDeleteProject();

  useLayoutEffect(() => {
    if (data && !isLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".mg-header-anim",
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out", clearProps: "all" }
        );
        gsap.fromTo(".mg-control-anim",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.2, clearProps: "all" }
        );
        gsap.fromTo(".project-row-anim",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out", delay: 0.4, clearProps: "all" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [data, isLoading]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to terminate this project protocol? This action is irreversible.')) {
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
        return <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase text-[10px] tracking-widest px-2 py-0.5">Open</Badge>;
      case 'closed':
        return <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 uppercase text-[10px] tracking-widest px-2 py-0.5">Closed</Badge>;
      case 'draft':
        return <Badge className="bg-white/5 text-muted-foreground border border-white/10 uppercase text-[10px] tracking-widest px-2 py-0.5">Draft</Badge>;
      default:
        return <Badge variant="outline" className="uppercase text-[10px] tracking-widest">{status}</Badge>;
    }
  };

  const filteredProjects = projects.filter((project: Project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-1 flex-col" ref={containerRef}>
      <div className="container-wide py-10">

        {/* Header */}
        <div className="mg-header-anim mb-12 relative overflow-hidden glass-card p-10 rounded-3xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-hive/5 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-accent-hive/10 border border-accent-hive/20 shadow-inner">
                <Briefcase className="h-10 w-10 text-accent-hive" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                  {t('myProjects.titlePrefix', 'My')} <span className="text-gradient-vivid">{t('myProjects.titleHighlight', 'Deployments')}</span>
                </h1>
                <p className="text-muted-foreground text-lg font-light mt-1">
                  {t('myProjects.subtitle')}
                </p>
              </div>
            </div>
            <Link to="/projects/create" className="premium-button whitespace-nowrap px-8 py-4 h-auto text-sm">
              <Plus className="mr-2 h-5 w-5" />
              {t('myProjects.initializeRequest')}
            </Link>
          </div>
        </div>

        {/* Control Center */}
        <div className="mg-control-anim mb-8 glass-card p-4 rounded-2xl flex flex-col lg:flex-row items-center gap-6">
          <Tabs
            defaultValue="all"
            onValueChange={(value) => {
              setStatusFilter(value === 'all' ? undefined : value.toLowerCase());
              setPage(1);
            }}
            className="w-full lg:w-auto"
          >
            <TabsList className="grid grid-cols-4 w-full lg:w-[480px] glass-card p-1 h-11 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-accent-hive data-[state=active]:text-black text-[11px] font-bold uppercase tracking-wider">{t('myProjects.all')}</TabsTrigger>
              <TabsTrigger value="open" className="rounded-lg data-[state=active]:bg-accent-hive data-[state=active]:text-black text-[11px] font-bold uppercase tracking-wider">{t('myProjects.open')}</TabsTrigger>
              <TabsTrigger value="closed" className="rounded-lg data-[state=active]:bg-accent-hive data-[state=active]:text-black text-[11px] font-bold uppercase tracking-wider">{t('myProjects.closed')}</TabsTrigger>
              <TabsTrigger value="draft" className="rounded-lg data-[state=active]:bg-accent-hive data-[state=active]:text-black text-[11px] font-bold uppercase tracking-wider">{t('myProjects.drafts')}</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 w-full">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <Input
                type="text"
                placeholder={t('myProjects.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 w-full h-11 glass-card bg-white/5 border-white/10 rounded-xl focus:border-accent-hive/50 transition-all font-light"
              />
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 hidden sm:block">{t('myProjects.sortIndex')}</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] h-11 glass-card border-white/10 rounded-xl text-xs font-bold uppercase tracking-tighter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card bg-black/80 backdrop-blur-xl border-white/10">
                  <SelectItem value="newest" className="text-xs font-bold uppercase">{t('myProjects.chronological')}</SelectItem>
                  <SelectItem value="oldest" className="text-xs font-bold uppercase">{t('myProjects.reverse')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Project Grid */}
        <div className="space-y-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <LoadingSpinner size="lg" />
              <p className="text-muted-foreground text-sm font-light tracking-[0.3em] animate-pulse uppercase">{t('myProjects.loading')}</p>
            </div>
          )}

          {error && (
            <div className="glass-card p-10 rounded-3xl text-center">
              <ErrorMessage message={t('myProjects.error')} type="error" />
            </div>
          )}

          {!isLoading && !error && filteredProjects.length === 0 && (
            <div className="glass-card p-20 rounded-3xl text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <LayoutGrid className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-black text-white/50 mb-2 uppercase tracking-widest">{t('myProjects.noProjects')}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-10 font-light">
                {searchQuery ? t('myProjects.noProjectsSearch') : t('myProjects.noProjectsEmpty')}
              </p>
              {!searchQuery && (
                <Link to="/projects/create" className="premium-button px-8 py-3 h-auto">
                  <Plus className="mr-2 h-5 w-5" />
                  {t('myProjects.createFirst')}
                </Link>
              )}
            </div>
          )}

          {!isLoading && !error && filteredProjects.length > 0 && (
            <div className="space-y-4">
              {filteredProjects.map((project: Project) => (
                <div key={project.id} className="project-row-anim group glass-card p-6 rounded-2xl hover:border-accent-hive/30 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent-hive/20 group-hover:bg-accent-hive transition-all duration-300" />

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        {getStatusBadge(project.status)}
                        <span className="text-[10px] font-mono text-muted-foreground/50">{project.id.split('-')[0].toUpperCase()}</span>
                      </div>

                      <Link to={`/projects/${project.id}`}>
                        <h3 className="text-xl font-bold hover:text-accent-hive transition-colors tracking-tight">
                          {project.title}
                        </h3>
                      </Link>

                      <p className="text-sm text-muted-foreground line-clamp-1 max-w-3xl font-light">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-accent-hive/60" />
                          <span>{t('myProjects.synched')} {format(new Date(project.created_at), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-accent-hive/60" />
                          <span>{project.contribution_count} {t('myProjects.analysts')}</span>
                        </div>
                        {project.tags && project.tags.length > 0 && (
                          <div className="hidden sm:flex flex-wrap gap-2">
                            {project.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[9px] border border-white/5 bg-white/5 px-2 py-0.5 rounded uppercase">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <StatusEditButton project={project} />
                      <div className="h-6 w-px bg-white/5 mx-1 hidden sm:block" />

                      <Link to={`/projects/${project.id}`} className="p-2.5 rounded-xl glass-card border-white/10 hover:bg-white/5 text-accent-hive/70 transition-all group/btn">
                        <Eye className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                      </Link>

                      <Link to={`/projects/${project.id}/edit`} className="p-2.5 rounded-xl glass-card border-white/10 hover:bg-white/5 text-blue-400/70 transition-all group/btn">
                        <Edit className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                      </Link>

                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={deleteMutation.isPending}
                        className="p-2.5 rounded-xl glass-card border-white/10 hover:bg-red-500/10 text-red-400/70 transition-all group/btn"
                      >
                        <Trash2 className={`h-4 w-4 group-hover/btn:scale-110 transition-transform ${deleteMutation.isPending && deleteMutation.variables === project.id ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-10">
                <Pagination
                  currentPage={data?.current_page || 1}
                  totalPages={data?.total_pages || 1}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProjects;
