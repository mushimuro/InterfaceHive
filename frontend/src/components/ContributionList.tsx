import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { type Contribution } from '../api/contributions';
import { User, Calendar, Link as LinkIcon, Paperclip, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ContributionListProps {
  contributions: Contribution[];
  isHost?: boolean;
  onAccept?: (contributionId: string) => void;
  onDecline?: (contributionId: string) => void;
  isProcessing?: boolean;
}

const ContributionList: React.FC<ContributionListProps> = ({
  contributions,
  isHost = false,
  onAccept,
  onDecline,
  isProcessing = false,
}) => {
  const [localProcessingId, setLocalProcessingId] = useState<string | null>(null);

  if (!contributions || contributions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No contributions yet.</p>
          {!isHost && (
            <p className="text-sm text-muted-foreground mt-2">
              Be the first to contribute to this project!
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        );
      case 'declined':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="h-3 w-3 mr-1" />
            Declined
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {contributions.map((contribution) => (
        <Card key={contribution.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {contribution.title && (
                  <CardTitle className="text-xl mb-2">{contribution.title}</CardTitle>
                )}
                <CardDescription className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{contribution.contributor.display_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(contribution.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </CardDescription>
              </div>
              {getStatusBadge(contribution.status)}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Body */}
            <div className="whitespace-pre-wrap text-sm">{contribution.body}</div>

            {/* Links */}
            {contribution.links && contribution.links.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" />
                  Links
                </h4>
                <div className="flex flex-wrap gap-2">
                  {contribution.links.map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <LinkIcon className="h-3 w-3" />
                      {link.length > 50 ? `${link.substring(0, 50)}...` : link}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {contribution.attachments && contribution.attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-1">
                  <Paperclip className="h-4 w-4" />
                  Attachments
                </h4>
                <div className="flex flex-wrap gap-2">
                  {contribution.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <Paperclip className="h-3 w-3" />
                      Attachment {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Decision Info */}
            {contribution.decided_by_name && contribution.decided_at && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                {contribution.status === 'accepted' ? 'Accepted' : 'Declined'} by{' '}
                {contribution.decided_by_name} on{' '}
                {format(new Date(contribution.decided_at), 'MMM d, yyyy')}
              </div>
            )}

            {/* Host Actions */}
            {isHost && contribution.status === 'pending' && onAccept && onDecline && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    setLocalProcessingId(contribution.id);
                    onAccept(contribution.id);
                  }}
                  disabled={isProcessing || localProcessingId === contribution.id}
                  className="flex-1"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button
                  onClick={() => {
                    setLocalProcessingId(contribution.id);
                    onDecline(contribution.id);
                  }}
                  disabled={isProcessing || localProcessingId === contribution.id}
                  variant="destructive"
                  className="flex-1"
                  size="sm"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ContributionList;

