import React, { useState, useLayoutEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { projectSchema, type ProjectFormData } from '../schemas/projectSchema';
import { useCreateProject } from '../hooks/useProjects';
import ProjectForm from '../components/ProjectForm';
import ErrorMessage from '../components/ErrorMessage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Sparkles, Github, Lightbulb, Trash2, Rocket, BrainCircuit, Info } from 'lucide-react';
import { useGenerateFromIdea, useGenerateFromRepo } from '../hooks/useAI';
import LoadingSpinner from '../components/LoadingSpinner';
import { gsap } from 'gsap';

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: 'open',
      tags: [],
    },
  });

  const createProjectMutation = useCreateProject();
  const generateFromIdeaMutation = useGenerateFromIdea();
  const generateFromRepoMutation = useGenerateFromRepo();

  const [aiIdea, setAiIdea] = useState('');
  const [aiRepoUrl, setAiRepoUrl] = useState('');
  const [activeTab, setActiveTab] = useState('idea');

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(".create-header-anim",
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
      gsap.fromTo(".create-section-anim",
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

  const handleGenerateFromIdea = async () => {
    if (!aiIdea.trim()) return;
    try {
      const data = await generateFromIdeaMutation.mutateAsync(aiIdea);
      populateForm(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateFromRepo = async () => {
    if (!aiRepoUrl.trim()) return;
    try {
      const data = await generateFromRepoMutation.mutateAsync(aiRepoUrl);
      populateForm(data);
      form.setValue('github_url', aiRepoUrl);
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
    if (data.status) form.setValue('status', 'open');
  };

  const clearAllFields = () => {
    form.reset({
      title: '',
      description: '',
      what_it_does: '',
      inputs_dependencies: '',
      desired_outputs: '',
      difficulty: undefined,
      estimated_time: '',
      tags: [],
      github_url: '',
      status: 'open',
    });
    setAiIdea('');
    setAiRepoUrl('');
  };

  const isAiLoading = generateFromIdeaMutation.isPending || generateFromRepoMutation.isPending;
  const aiError = generateFromIdeaMutation.error || generateFromRepoMutation.error;

  const onSubmit = async (data: ProjectFormData) => {
    setError(null);
    try {
      await createProjectMutation.mutateAsync(data as any);
      navigate('/my-projects');
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Failed to initiate project protocol. Please verify your data strings.'
      );
    }
  };

  return (
    <div className="flex flex-1 flex-col" ref={containerRef}>
      <div className="container max-w-5xl mx-auto py-12 px-4 lg:px-6">

        {/* Header */}
        <div className="create-header-anim mb-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gradient mb-4">
                Initialize New <span className="relative">Project <span className="absolute -bottom-1 left-0 w-full h-1 bg-accent-hive/30 rounded-full" /></span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl font-light">
                Bridge the gap between vision and execution. Deploy your requirements to our global network of experts.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="p-4 rounded-3xl glass-card bg-accent-hive/5 border-accent-hive/10">
                <Rocket className="h-10 w-10 text-accent-hive animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          <div className="lg:col-span-8 space-y-10">
            {error && (
              <div className="create-section-anim">
                <ErrorMessage message={error} type="error" />
              </div>
            )}

            {/* AI Assistant Section */}
            <div className="create-section-anim glass-card p-8 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />

              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <BrainCircuit className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-black text-xl tracking-widest uppercase text-white/90">Hive Logic Assistant</h3>
              </div>

              {aiError && (
                <div className="mb-6">
                  <ErrorMessage
                    message={aiError instanceof Error ? aiError.message : 'AI synchronization failed'}
                    type="error"
                  />
                </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full relative z-10">
                <TabsList className="grid w-full grid-cols-2 glass-card p-1 h-11 rounded-2xl mb-8">
                  <TabsTrigger value="idea" className="rounded-xl data-[state=active]:bg-purple-500 data-[state=active]:text-white transition-all">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Conceptualize
                  </TabsTrigger>
                  <TabsTrigger value="repo" className="rounded-xl data-[state=active]:bg-purple-500 data-[state=active]:text-white transition-all">
                    <Github className="h-4 w-4 mr-2" />
                    Ingest Repository
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="idea" className="space-y-6 mt-0">
                  <div className="space-y-3">
                    <Label htmlFor="ai-idea" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Vision Description</Label>
                    <Textarea
                      id="ai-idea"
                      placeholder="Input your project vision. The more detail, the more precise the neural generation..."
                      value={aiIdea}
                      onChange={(e) => setAiIdea(e.target.value)}
                      rows={4}
                      className="glass-card bg-white/5 border-white/10 rounded-2xl focus:border-purple-500/50 transition-all resize-none"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button
                      onClick={handleGenerateFromIdea}
                      disabled={isAiLoading || !aiIdea.trim()}
                      className="premium-button bg-gradient-to-r from-purple-600 to-indigo-600 flex-1 h-12 rounded-2xl shadow-purple-500/20"
                    >
                      {isAiLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <LoadingSpinner size="sm" />
                          <span>SYNTHESIZING...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 uppercase font-black text-xs tracking-widest">
                          <Sparkles className="h-4 w-4" />
                          Generate Intel
                        </div>
                      )}
                    </button>
                    <Button
                      variant="outline"
                      onClick={clearAllFields}
                      disabled={isAiLoading}
                      className="glass-card border-white/10 rounded-2xl h-12 px-6 hover:bg-white/5"
                    >
                      <Trash2 className="h-4 w-4 mr-2 opacity-50" />
                      Wipe Data
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="repo" className="space-y-6 mt-0">
                  <div className="space-y-3">
                    <Label htmlFor="ai-repo" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Source Link (GitHub)</Label>
                    <Input
                      id="ai-repo"
                      placeholder="https://github.com/analyst/core-module"
                      value={aiRepoUrl}
                      onChange={(e) => setAiRepoUrl(e.target.value)}
                      className="glass-card bg-white/5 border-white/10 rounded-2xl h-12 focus:border-purple-500/50 transition-all"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button
                      onClick={handleGenerateFromRepo}
                      disabled={isAiLoading || !aiRepoUrl.trim()}
                      className="premium-button bg-gradient-to-r from-purple-600 to-indigo-600 flex-1 h-12 rounded-2xl shadow-purple-500/20"
                    >
                      {isAiLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <LoadingSpinner size="sm" />
                          <span>ANALYZING CODE...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 uppercase font-black text-xs tracking-widest">
                          <BrainCircuit className="h-4 w-4" />
                          Extract Schema
                        </div>
                      )}
                    </button>
                    <Button
                      variant="outline"
                      onClick={clearAllFields}
                      disabled={isAiLoading}
                      className="glass-card border-white/10 rounded-2xl h-12 px-6 hover:bg-white/5"
                    >
                      <Trash2 className="h-4 w-4 mr-2 opacity-50" />
                      Wipe Data
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Main Form Section */}
            <div className="create-section-anim glass-card p-10 rounded-3xl border-accent-hive/10">
              <h3 className="text-2xl font-black mb-10 uppercase tracking-widest text-white/90 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-accent-hive rounded-full" />
                Project Specifications
              </h3>
              <ProjectForm
                form={form}
                onSubmit={onSubmit}
                isLoading={createProjectMutation.isPending}
                submitLabel="Deploy Project"
              />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-10">
            {/* Intel Tips */}
            <div className="create-section-anim glass-card p-8 rounded-3xl border-blue-500/20 bg-blue-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] -mr-16 -mt-16" />
              <h3 className="text-xl font-black text-blue-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                <Info className="h-5 w-5" />
                Intelligence Tips
              </h3>
              <ul className="space-y-6">
                {[
                  { title: "BE SPECIFIC", desc: "Granular requirements lead to higher quality contributions." },
                  { title: "PROVIDE CONTEXT", desc: "Explain the 'Why' behind the 'What' to engage talent." },
                  { title: "DIFFICULTY MATRIX", desc: "Accurate difficulty tagging targets the right contributors." },
                  { title: "TAG RELEVANCE", desc: "Use tech stack tags to improve platform discovery." }
                ].map((tip, idx) => (
                  <li key={idx} className="flex gap-4 group">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500/40 group-hover:bg-blue-400 transition-colors shrink-0" />
                    <div>
                      <p className="text-xs font-black text-blue-300 uppercase mb-1">{tip.title}</p>
                      <p className="text-sm text-blue-200/60 leading-relaxed font-light">{tip.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform Stats? - Just a placeholder decoration for premium feel */}
            <div className="create-section-anim glass-card p-8 rounded-3xl text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-hive/5 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Network Yield</p>
                <div className="text-4xl font-black text-gradient">98.4%</div>
                <p className="text-[10px] text-accent-hive/50 font-mono mt-2 uppercase">Successful deployment rate</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div >
  );
};

export default CreateProject;
