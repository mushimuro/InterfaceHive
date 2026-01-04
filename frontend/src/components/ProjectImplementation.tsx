import React, { useState } from 'react';
import {
    Card,
    CardContent,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from './ui/select';
import {
    Github,
    Figma,
    FileText,
    Link as LinkIcon,
    Plus,
    Trash2,
    MessageSquare,
    Clock,
    User,
    Share2
} from 'lucide-react';
import {
    useProjectResources,
    useAddProjectResource,
    useDeleteProjectResource,
    useProjectNotes,
    useAddProjectNote,
    useDeleteProjectNote
} from '../hooks/useProjectResources';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { format } from 'date-fns';

interface ProjectImplementationProps {
    projectId: string;
    isHost: boolean;
}

const ProjectImplementation: React.FC<ProjectImplementationProps> = ({ projectId, isHost }) => {
    const { user } = useAuth();

    // Resources State & Hooks
    const { data: resources, isLoading: isLoadingResources } = useProjectResources(projectId);
    const addResourceMutation = useAddProjectResource(projectId);
    const deleteResourceMutation = useDeleteProjectResource(projectId);

    // Notes State & Hooks
    const { data: notes, isLoading: isLoadingNotes } = useProjectNotes(projectId);
    const addNoteMutation = useAddProjectNote(projectId);
    const deleteNoteMutation = useDeleteProjectNote(projectId);

    // Form States
    const [resourceForm, setResourceForm] = useState({ title: '', url: '', category: 'other' as any });
    const [noteContent, setNoteContent] = useState('');
    const [showResourceForm, setShowResourceForm] = useState(false);

    const handleAddResource = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resourceForm.title || !resourceForm.url) return;
        try {
            await addResourceMutation.mutateAsync(resourceForm);
            setResourceForm({ title: '', url: '', category: 'other' });
            setShowResourceForm(false);
        } catch (err) {
            console.error('Failed to add resource:', err);
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteContent.trim()) return;
        try {
            await addNoteMutation.mutateAsync({ content: noteContent });
            setNoteContent('');
        } catch (err) {
            console.error('Failed to add note:', err);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'github': return <Github className="h-4 w-4" />;
            case 'figma': return <Figma className="h-4 w-4" />;
            case 'diagram': return <Share2 className="h-4 w-4" />;
            case 'docs': return <FileText className="h-4 w-4" />;
            default: return <LinkIcon className="h-4 w-4" />;
        }
    };

    if (isLoadingResources || isLoadingNotes) {
        return <LoadingSpinner text="Loading implementation details..." />;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Resources Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <LinkIcon className="h-5 w-5 text-primary" />
                            Shared Resources
                        </h2>
                        <p className="text-sm text-muted-foreground">Technical links, repositories, and design files</p>
                    </div>
                    <Button size="sm" onClick={() => setShowResourceForm(!showResourceForm)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Link
                    </Button>
                </div>

                {showResourceForm && (
                    <Card className="bg-muted/30 border-dashed">
                        <CardContent className="pt-6">
                            <form onSubmit={handleAddResource} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2 md:col-span-1">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={resourceForm.category}
                                        onValueChange={(val) => setResourceForm({ ...resourceForm, category: val as any })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="github">GitHub</SelectItem>
                                            <SelectItem value="figma">Figma</SelectItem>
                                            <SelectItem value="diagram">Diagram/ERD</SelectItem>
                                            <SelectItem value="docs">Documentation</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 md:col-span-1">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. Frontend Repo"
                                        value={resourceForm.title}
                                        onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-1">
                                    <Label htmlFor="url">URL</Label>
                                    <Input
                                        id="url"
                                        type="url"
                                        placeholder="https://..."
                                        value={resourceForm.url}
                                        onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" className="flex-1" disabled={addResourceMutation.isPending}>
                                        {addResourceMutation.isPending ? 'Adding...' : 'Add'}
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={() => setShowResourceForm(false)}>Cancel</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources?.length === 0 ? (
                        <div className="col-span-full py-12 text-center border rounded-lg border-dashed text-muted-foreground">
                            No shared resources yet. Start by adding a relevant link!
                        </div>
                    ) : (
                        resources?.map((resource) => (
                            <Card key={resource.id} className="group hover:border-primary/50 transition-colors">
                                <CardContent className="p-4 flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className="mt-1 p-2 rounded-md bg-primary/10 text-primary">
                                            {getCategoryIcon(resource.category)}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-medium text-sm truncate">{resource.title}</h4>
                                            <a
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-muted-foreground hover:text-primary transition-colors truncate block"
                                            >
                                                {resource.url}
                                            </a>
                                        </div>
                                    </div>
                                    {(isHost || resource.user.id === user?.id) && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => deleteResourceMutation.mutate(resource.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </section>

            {/* Ideas & Thoughts Section */}
            <section className="space-y-4 pt-6 border-t">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Ideas & Thoughts
                    </h2>
                    <p className="text-sm text-muted-foreground">Quick technical updates, brainstorms, or reminders for the team</p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleAddNote} className="space-y-4">
                            <Textarea
                                placeholder="Share a technical thought or an idea with the team..."
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                rows={3}
                                className="resize-none"
                            />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={addNoteMutation.isPending || !noteContent.trim()}>
                                    {addNoteMutation.isPending ? 'Posting...' : 'Post Thought'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {notes?.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            The idea wall is empty. Post the first thought!
                        </div>
                    ) : (
                        notes?.map((note) => (
                            <div key={note.id} className="flex gap-4 p-4 rounded-lg bg-muted/20 border group">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">{note.user.display_name}</span>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-2 w-2" />
                                                {format(new Date(note.created_at), 'MMM d, h:mm a')}
                                            </span>
                                        </div>
                                        {(isHost || note.user.id === user?.id) && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => deleteNoteMutation.mutate(note.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
                                        {note.content}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default ProjectImplementation;
