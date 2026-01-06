import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { projectSchema, type ProjectFormData } from '../schemas/projectSchema';
import { useProject, useUpdateProject } from '../hooks/useProjects';
import ProjectForm from '../components/ProjectForm';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { ChevronLeft, Layers, Edit3 } from 'lucide-react';
import { gsap } from 'gsap';

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: project, isLoading: isLoadingProject, error: projectError } = useProject(id!);
  const updateProjectMutation = useUpdateProject(id!);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  useLayoutEffect(() => {
    if (project) {
      const ctx = gsap.context(() => {
        gsap.from(".edit-content-anim", {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: "power3.out"
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [project]);

  // Populate form with existing project data
  useEffect(() => {
    if (project) {
      form.reset({
        title: project.title,
        description: project.description,
        what_it_does: project.what_it_does || '',
        inputs_dependencies: project.inputs_dependencies || '',
        desired_outputs: project.desired_outputs,
        difficulty: project.difficulty,
        estimated_time: project.estimated_time || '',
        github_url: project.github_url || '',
        tags: project.tags || [],
        status: project.status,
      });
    }
  }, [project, form]);

  const onSubmit = async (data: ProjectFormData) => {
    setError(null);
    try {
      await updateProjectMutation.mutateAsync(data as any);
      navigate(`/projects/${id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Failed to sync project updates. Please check your data integrity.'
      );
    }
  };

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Retrieving project data strings..." />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="glass-card p-12 rounded-3xl text-center">
          <ErrorMessage
            message="Failed to access project core. Secure link may be broken or permissions denied."
            type="error"
          />
          <div className="mt-8">
            <button onClick={() => navigate(-1)} className="premium-button">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Return to Safety
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col" ref={containerRef}>
      <div className="container max-w-4xl mx-auto py-12 px-4 lg:px-6">

        <Link to={`/projects/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-accent-hive transition-colors mb-8 group">
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Project Detail
        </Link>

        <div className="edit-content-anim">
          <div className="glass-card p-10 rounded-3xl border-accent-hive/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-hive/5 rounded-full blur-[60px] -mr-16 -mt-16" />

            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 rounded-2xl bg-accent-hive/10 border border-accent-hive/20">
                <Edit3 className="h-6 w-6 text-accent-hive" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-gradient">Update Specifications</h1>
                <p className="text-muted-foreground text-sm">Refining the project requirements for ID: {id?.split('-')[0].toUpperCase()}</p>
              </div>
            </div>

            {error && (
              <div className="mb-8">
                <ErrorMessage message={error} type="error" />
              </div>
            )}

            <ProjectForm
              form={form}
              onSubmit={onSubmit}
              isLoading={updateProjectMutation.isPending}
              submitLabel="Sync Changes"
            />
          </div>
        </div>

        {/* Decorative element */}
        <div className="edit-content-anim mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50">
          <div className="p-6 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4">
            <Layers className="h-5 w-5 text-accent-hive" />
            <p className="text-xs text-muted-foreground leading-relaxed">Changes are broadcasted to all active contributors in real-time.</p>
          </div>
          <div className="p-6 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4">
            <Edit3 className="h-5 w-5 text-accent-hive" />
            <p className="text-xs text-muted-foreground leading-relaxed">Updating requirements helps clarify goals and improve submission quality.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EditProject;
