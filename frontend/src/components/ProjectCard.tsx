import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, Award, User } from 'lucide-react';
import { type Project } from '../api/projects';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const difficultyColors = {
    EASY: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-0',
    ADVANCED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0',
  };

  return (
    <Link to={`/projects/${project.id}`} className="block group">
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 bg-card">
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2 flex-1 group-hover:text-primary transition-colors">
              {project.title}
            </CardTitle>
            {project.difficulty && (
              <Badge className={difficultyColors[project.difficulty]} variant="secondary">
                {project.difficulty}
              </Badge>
            )}
          </div>
          <CardDescription className="line-clamp-2 text-sm">
            {project.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs font-normal">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="outline" className="text-xs font-normal">
                  +{project.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {project.estimated_time && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{project.estimated_time}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5" />
              <span>{project.contribution_count}</span>
            </div>
          </div>

          {/* Host */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {project.host.display_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {project.host.total_credits} credits
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProjectCard;

