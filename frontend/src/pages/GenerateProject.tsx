import React, { useState, useLayoutEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { projectSchema, type ProjectFormData } from '../schemas/projectSchema';
import { useCreateProject } from '../hooks/useProjects';
import ProjectForm from '../components/ProjectForm';
import ErrorMessage from '../components/ErrorMessage';
import { Sparkles, Rocket, Wand2, Dices, Info, Zap } from 'lucide-react';
import { useGenerateRandomProject } from '../hooks/useAI';
import LoadingSpinner from '../components/LoadingSpinner';
import { gsap } from 'gsap';

const GenerateProject: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: 'open',
      usage_type: 'practice',
      tags: [],
    },
  });

  const createProjectMutation = useCreateProject();
  const generateRandomMutation = useGenerateRandomProject();

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(".generate-header-anim",
        {
          opacity: 0,
          y: -20
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "all"
        }
      );
      gsap.fromTo(".generate-section-anim",
        {
          opacity: 0,
          y: 20
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.2,
          clearProps: "all"
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleGenerateRandom = async () => {
    try {
      // Auto-save the project to database for inspiration
      const response = await generateRandomMutation.mutateAsync(true);
      
      // If it was saved, navigate to the project-templates page
      if (response.saved && response.project) {
        navigate('/project-templates');
      } else {
        // Fallback: populate form if save failed
        populateForm(response);
        setHasGenerated(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const populateForm = (data: any) => {
    if (data.title) form.setValue('title', data.title);
    if (data.description) form.setValue('description', data.description);
    if (data.what_it_does) form.setValue('what_it_does', data.what_it_does);
    if (data.inputs_dependencies) form.setValue('inputs_dependencies', data.inputs_dependencies);
    if (data.desired_outputs) form.setValue('desired_outputs', data.desired_outputs);
    if (data.difficulty) form.setValue('difficulty', data.difficulty);
    if (data.estimated_time) form.setValue('estimated_time', data.estimated_time);
    if (data.tags) form.setValue('tags', data.tags);
    if (data.github_url) form.setValue('github_url', data.github_url);
    if (data.usage_type) form.setValue('usage_type', data.usage_type);
    if (data.status) form.setValue('status', 'open');
  };

  const isAiLoading = generateRandomMutation.isPending;
  const aiError = generateRandomMutation.error;

  const onSubmit = async (data: ProjectFormData) => {
    setError(null);
    try {
      await createProjectMutation.mutateAsync(data as any);
      navigate('/my-projects');
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        t('createProject.errorCreating')
      );
    }
  };

  return (
    <div className="flex flex-1 flex-col" ref={containerRef}>
      <div className="container max-w-5xl mx-auto py-12 px-4 lg:px-6">

        {/* Header */}
        <div className="generate-header-anim mb-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gradient mb-4">
                {t('generateProject.title', 'AI Project')} <span className="relative text-gradient">{t('generateProject.titleHighlight', 'Generator')} <span className="absolute -bottom-1 left-0 w-full h-1 bg-purple-500/30 rounded-full" /></span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl font-light">
                {t('generateProject.subtitle', 'Let AI create unique project ideas for you with just a click.')}
              </p>
            </div>
            <div className="flex justify-center">
              <div className="p-4 rounded-3xl glass-card bg-purple-500/5 border-purple-500/10">
                <Dices className="h-10 w-10 text-purple-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          <div className="lg:col-span-8 space-y-10">
            {error && (
              <div className="generate-section-anim">
                <ErrorMessage message={error} type="error" />
              </div>
            )}

            {/* AI Generator Section */}
            <div className="generate-section-anim glass-card p-8 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/5 rounded-full blur-[60px] -ml-24 -mb-24" />

              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <Wand2 className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-black text-xl tracking-widest uppercase text-white/90">
                  {t('generateProject.randomGenerator', 'Random Project Generator')}
                </h3>
              </div>

              {aiError && (
                <div className="mb-6 relative z-10">
                  <ErrorMessage
                    message={aiError instanceof Error ? aiError.message : t('generateProject.aiError', 'Failed to generate project')}
                    type="error"
                  />
                </div>
              )}

              <div className="space-y-6 relative z-10">
                <div className="glass-card p-6 rounded-2xl bg-white/5 border-white/10">
                  <div className="flex items-start gap-4">
                    <Sparkles className="h-5 w-5 text-purple-400 mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold text-white/90 mb-2">
                        {t('generateProject.howItWorks', 'How It Works')}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('generateProject.description', 'Click the button below to generate a completely unique project idea powered by AI. The AI will create a full project specification including title, description, requirements, and more.')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={handleGenerateRandom}
                    disabled={isAiLoading}
                    className="premium-button bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 flex-1 h-14 rounded-2xl shadow-purple-500/20"
                  >
                    {isAiLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span>{t('generateProject.generating', 'Generating...')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 uppercase font-black text-xs tracking-widest">
                        <Zap className="h-5 w-5" />
                        {t('generateProject.generateButton', 'Generate Random Project')}
                      </div>
                    )}
                  </button>
                </div>

                {hasGenerated && !isAiLoading && (
                  <div className="glass-card p-4 rounded-2xl bg-green-500/10 border-green-500/20">
                    <div className="flex items-center gap-3">
                      <Rocket className="h-5 w-5 text-green-400" />
                      <p className="text-sm text-green-300 font-medium">
                        {t('generateProject.success', 'Project generated successfully! Review and publish below.')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Form Section - Only show after generation */}
            {hasGenerated && (
              <div className="generate-section-anim glass-card p-10 rounded-3xl border-accent-hive/10">
                <h3 className="text-2xl font-black mb-10 uppercase tracking-widest text-white/90 flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-accent-hive rounded-full" />
                  {t('generateProject.reviewProject', 'Review & Publish')}
                </h3>
                <ProjectForm
                  form={form}
                  onSubmit={onSubmit}
                  isLoading={createProjectMutation.isPending}
                  submitLabel={t('generateProject.publishProject', 'Publish Project')}
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-10">
            {/* Tips Section */}
            <div className="generate-section-anim glass-card p-8 rounded-3xl border-purple-500/20 bg-purple-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] -mr-16 -mt-16" />
              <h3 className="text-xl font-black text-purple-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                <Info className="h-5 w-5" />
                {t('generateProject.tips', 'Tips')}
              </h3>
              <ul className="space-y-6">
                {[
                  { 
                    title: t('generateProject.tipReview', 'Review Before Publishing'), 
                    desc: t('generateProject.tipReviewDesc', 'Always review AI-generated content before publishing to ensure accuracy and quality.')
                  },
                  { 
                    title: t('generateProject.tipCustomize', 'Customize as Needed'), 
                    desc: t('generateProject.tipCustomizeDesc', 'Feel free to edit any field to better match your vision.')
                  },
                  { 
                    title: t('generateProject.tipRegenerate', 'Try Again'), 
                    desc: t('generateProject.tipRegenerateDesc', 'Not satisfied? Generate another project idea anytime.')
                  },
                  { 
                    title: t('generateProject.tipUnique', 'Each is Unique'), 
                    desc: t('generateProject.tipUniqueDesc', 'Every generation creates a completely new and unique project.')
                  }
                ].map((tip, idx) => (
                  <li key={idx} className="flex gap-4 group">
                    <div className="mt-1 h-2 w-2 rounded-full bg-purple-500/40 group-hover:bg-purple-400 transition-colors shrink-0" />
                    <div>
                      <p className="text-xs font-black text-purple-300 uppercase mb-1">{tip.title}</p>
                      <p className="text-sm text-purple-200/60 leading-relaxed font-light">{tip.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stats Decoration */}
            <div className="generate-section-anim glass-card p-8 rounded-3xl text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  {t('generateProject.aiPowered', 'AI Powered')}
                </p>
                <div className="text-4xl font-black text-gradient">∞</div>
                <p className="text-[10px] text-purple-500/50 font-mono mt-2 uppercase">
                  {t('generateProject.infinitePossibilities', 'Infinite Possibilities')}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GenerateProject;
