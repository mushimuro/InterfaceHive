import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { reverseCredit } from '../../api/admin';
import ErrorMessage from '../ErrorMessage';

interface ReverseCreditProps {
  entryId: string;
  userName: string;
  projectTitle: string;
  amount: number;
  onSuccess?: () => void;
}

const ReverseCredit: React.FC<ReverseCreditProps> = ({
  entryId,
  userName,
  projectTitle,
  amount,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const queryClient = useQueryClient();

  const reverseMutation = useMutation({
    mutationFn: (reason: string) => reverseCredit(entryId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      setReason('');
      setShowConfirm(false);
      onSuccess?.();
    },
  });

  const handleReverse = () => {
    if (reason.trim().length < 10) {
      return;
    }
    reverseMutation.mutate(reason);
  };

  return (
    <Card className="border-orange-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-600">
          <AlertCircle className="h-5 w-5" />
          Reverse Credit
        </CardTitle>
        <CardDescription>
          Reverse this credit transaction. This creates an offsetting entry to undo the credit award.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium mb-1">User:</p>
            <p className="text-sm text-muted-foreground">{userName}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Project:</p>
            <p className="text-sm text-muted-foreground">{projectTitle}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Amount:</p>
            <p className="text-sm font-semibold text-orange-600">+{amount} credit(s)</p>
          </div>
        </div>

        {!showConfirm ? (
          <Button
            variant="outline"
            className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20"
            onClick={() => setShowConfirm(true)}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reverse Credit
          </Button>
        ) : (
          <div className="space-y-4 p-4 border border-orange-500 rounded-md bg-orange-50 dark:bg-orange-950/20">
            <div className="space-y-2">
              <Label htmlFor="reverse-reason">Reason for reversal (required)</Label>
              <Textarea
                id="reverse-reason"
                placeholder="Explain why this credit is being reversed (minimum 10 characters)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
              {reason.length > 0 && reason.length < 10 && (
                <p className="text-xs text-orange-600">
                  Reason must be at least 10 characters ({reason.length}/10)
                </p>
              )}
            </div>

            {reverseMutation.isError && (
              <ErrorMessage
                message={reverseMutation.error?.message || 'Failed to reverse credit'}
                type="error"
              />
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-orange-500 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-950/30"
                onClick={handleReverse}
                disabled={reason.trim().length < 10 || reverseMutation.isPending}
              >
                {reverseMutation.isPending ? 'Reversing...' : 'Confirm Reverse'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirm(false);
                  setReason('');
                }}
                disabled={reverseMutation.isPending}
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

export default ReverseCredit;

