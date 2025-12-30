import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { AlertCircle, Trash2 } from 'lucide-react';
import { softDeleteProject, softDeleteContribution } from '../../api/admin';
import ErrorMessage from '../ErrorMessage';

interface ModerateContentProps {
  type: 'project' | 'contribution';
  targetId: string;
  targetTitle: string;
  onSuccess?: () => void;
}

const ModerateContent: React.FC<ModerateContentProps> = ({
  type,
  targetId,
  targetTitle,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (reason: string) => {
      if (type === 'project') {
        return softDeleteProject(targetId, { reason });
      } else {
        return softDeleteContribution(targetId, { reason });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      setReason('');
      setShowConfirm(false);
      onSuccess?.();
    },
  });

  const handleDelete = () => {
    if (reason.trim().length < 10) {
      return;
    }
    deleteMutation.mutate(reason);
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          Moderate {type === 'project' ? 'Project' : 'Contribution'}
        </CardTitle>
        <CardDescription>
          Soft delete this {type}. This action will close the {type} but preserve all data for audit purposes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Target:</p>
          <p className="text-sm text-muted-foreground">{targetTitle}</p>
        </div>

        {!showConfirm ? (
          <Button
            variant="destructive"
            onClick={() => setShowConfirm(true)}
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete {type === 'project' ? 'Project' : 'Contribution'}
          </Button>
        ) : (
          <div className="space-y-4 p-4 border border-destructive rounded-md bg-destructive/5">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for deletion (required)</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this content is being removed (minimum 10 characters)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
              {reason.length > 0 && reason.length < 10 && (
                <p className="text-xs text-destructive">
                  Reason must be at least 10 characters ({reason.length}/10)
                </p>
              )}
            </div>

            {deleteMutation.isError && (
              <ErrorMessage
                message={deleteMutation.error?.message || 'Failed to delete content'}
                type="error"
              />
            )}

            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={reason.trim().length < 10 || deleteMutation.isPending}
                className="flex-1"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirm(false);
                  setReason('');
                }}
                disabled={deleteMutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModerateContent;

