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
    EASY: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    ADVANCED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-xl line-clamp-2 flex-1">
              {project.title}
            </CardTitle>
            {project.difficulty && (
              <Badge className={difficultyColors[project.difficulty]}>
                {project.difficulty}
              </Badge>
            )}
          </div>
          <CardDescription className="line-clamp-3">
            {project.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {project.tags.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{project.tags.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs">{project.estimated_time || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                <span className="text-xs">{project.contribution_count} contributions</span>
              </div>
            </div>

            {/* Host */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-3 w-3 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">
                  {project.host.display_name}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {project.host.total_credits} credits
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProjectCard;

