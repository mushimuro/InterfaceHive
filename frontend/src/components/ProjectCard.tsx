import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from './ui/badge';
import { Clock, Award, User, ArrowUpRight } from 'lucide-react';
import { type Project } from '../api/projects';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const difficultyConfig = {
    easy: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/20',
      dot: 'bg-emerald-500',
    },
    intermediate: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20',
      dot: 'bg-amber-500',
    },
    advanced: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/20',
      dot: 'bg-rose-500',
    },
  };

  const difficulty = difficultyConfig[project.difficulty as keyof typeof difficultyConfig];

  return (
    <Link to={`/projects/${project.id}`} className="block group h-full project-card-item">
      <article className="card-interactive h-full p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-base font-semibold leading-snug line-clamp-2 flex-1 group-hover:text-gradient transition-colors duration-300">
              {project.title}
            </h3>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-[hsl(var(--accent-hive))] transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0 mt-0.5" />
          </div>

          {/* Difficulty badge */}
          {project.difficulty && difficulty && (
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${difficulty.bg} ${difficulty.text} ${difficulty.border} border`}>
              <span className={`w-1.5 h-1.5 rounded-full ${difficulty.dot}`} />
              {project.difficulty}
            </div>
          )}

          <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {project.description}
          </p>
        </div>

        <div className="mt-auto space-y-4">
          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="badge-hive text-[10px] font-medium py-0.5"
                >
                  {tag}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium text-muted-foreground/60 bg-muted/50">
                  +{project.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {project.estimated_time && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[hsl(var(--accent-hive))]/60" />
                <span>{project.estimated_time}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-[hsl(var(--accent-hive))]/60" />
              <span>{project.contribution_count} contribs</span>
            </div>
          </div>

          {/* Divider */}
          <div className="divider-glow" />

          {/* Host */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--accent-hive))]/20 to-[hsl(var(--accent-hive-dark))]/20 flex items-center justify-center border border-[hsl(var(--accent-hive))]/10">
                <User className="h-4 w-4 text-[hsl(var(--accent-hive))]/70" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[hsl(var(--card))]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {project.host.display_name}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                <span className="text-[hsl(var(--accent-hive))]">{project.host.total_credits}</span> credits
              </p>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ProjectCard;
