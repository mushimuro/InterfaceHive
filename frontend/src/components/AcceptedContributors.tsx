import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Users, Award } from 'lucide-react';

interface Contributor {
  id: string;
  display_name: string;
  bio?: string;
  skills?: string[];
  total_credits: number;
}

interface AcceptedContributorsProps {
  contributors: Contributor[];
}

const AcceptedContributors: React.FC<AcceptedContributorsProps> = ({ contributors }) => {
  if (!contributors || contributors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Accepted Contributors
          </CardTitle>
          <CardDescription>No accepted contributions yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Be the first to contribute to this project!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get unique contributors (in case of duplicates)
  const uniqueContributors = Array.from(
    new Map(contributors.map(c => [c.id, c])).values()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Accepted Contributors ({uniqueContributors.length})
        </CardTitle>
        <CardDescription>
          Contributors who have had their work accepted for this project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {uniqueContributors.map((contributor) => (
            <Link
              key={contributor.id}
              to={`/users/${contributor.id}`}
              className="block group"
            >
              <div className="flex items-start gap-4 p-4 rounded-lg border hover:border-primary hover:shadow-md transition-all">
                {/* Avatar Placeholder */}
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {contributor.display_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Contributor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold group-hover:text-primary transition-colors">
                      {contributor.display_name}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Award className="h-3 w-3" />
                      <span>{contributor.total_credits} credits</span>
                    </div>
                  </div>

                  {contributor.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {contributor.bio}
                    </p>
                  )}

                  {contributor.skills && contributor.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {contributor.skills.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {contributor.skills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{contributor.skills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AcceptedContributors;

