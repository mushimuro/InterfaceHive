import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from './ui/badge';
import { Clock, Award, User } from 'lucide-react';
import { type Project } from '../api/projects';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const difficultyColors = {
    easy: 'bg-green-100/50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-500/20',
    intermediate: 'bg-amber-100/50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-500/20',
    advanced: 'bg-red-100/50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-500/20',
  };

  return (
    <Link to={`/projects/${project.id}`} className="block group h-full project-card-item">
      <div className="glass-card h-full p-6 flex flex-col gap-4 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group-hover:border-amber-500/30">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold line-clamp-2 flex-1 group-hover:text-gradient transition-all">
              {project.title}
            </h3>
            {project.difficulty && (
              <Badge
                className={`${difficultyColors[project.difficulty as keyof typeof difficultyColors]} border text-[10px] py-0 h-5 lowercase`}
                variant="outline"
              >
                {project.difficulty}
              </Badge>
            )}
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {project.description}
          </p>
        </div>

        <div className="mt-auto space-y-4">
          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {project.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] font-normal border-amber-500/10 bg-amber-500/5">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="outline" className="text-[10px] font-normal opacity-50">
                  +{project.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {project.estimated_time && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500/70" />
                <span>{project.estimated_time}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-amber-500/70" />
              <span>{project.contribution_count} contribs</span>
            </div>
          </div>

          {/* Host */}
          <div className="flex items-center gap-2 pt-3 border-t border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center border border-amber-500/10">
              <User className="h-4 w-4 text-amber-500/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">
                {project.host.display_name}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {project.host.total_credits} credits
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
