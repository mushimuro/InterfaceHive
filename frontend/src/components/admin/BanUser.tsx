import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { AlertCircle, UserX, UserCheck } from 'lucide-react';
import { banUser, unbanUser } from '../../api/admin';
import ErrorMessage from '../ErrorMessage';

interface BanUserProps {
  userId: string;
  userName: string;
  userEmail: string;
  isActive: boolean;
  onSuccess?: () => void;
}

const BanUser: React.FC<BanUserProps> = ({
  userId,
  userName,
  userEmail,
  isActive,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const queryClient = useQueryClient();

  const banMutation = useMutation({
    mutationFn: (data: { action: 'ban' | 'unban'; reason: string }) => {
      if (data.action === 'ban') {
        return banUser(userId, { reason: data.reason });
      } else {
        return unbanUser(userId, { reason: data.reason });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setReason('');
      setShowConfirm(false);
      onSuccess?.();
    },
  });

  const handleAction = (action: 'ban' | 'unban') => {
    if (reason.trim().length < 10) {
      return;
    }
    banMutation.mutate({ action, reason });
  };

  const actionText = isActive ? 'Ban' : 'Unban';
  const actionDescription = isActive
    ? 'Ban this user. This will deactivate their account and prevent them from logging in.'
    : 'Unban this user. This will reactivate their account and allow them to log in again.';

  return (
    <Card className={isActive ? 'border-destructive' : 'border-green-500'}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isActive ? 'text-destructive' : 'text-green-600'}`}>
          <AlertCircle className="h-5 w-5" />
          {actionText} User
        </CardTitle>
        <CardDescription>{actionDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium mb-1">User:</p>
            <p className="text-sm text-muted-foreground">{userName}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Email:</p>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Status:</p>
            <p className={`text-sm font-medium ${isActive ? 'text-green-600' : 'text-red-600'}`}>
              {isActive ? 'Active' : 'Banned'}
            </p>
          </div>
        </div>

        {!showConfirm ? (
          <Button
            variant={isActive ? 'destructive' : 'default'}
            onClick={() => setShowConfirm(true)}
            className="w-full"
          >
            {isActive ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
            {actionText} User
          </Button>
        ) : (
          <div className={`space-y-4 p-4 border rounded-md ${
            isActive ? 'border-destructive bg-destructive/5' : 'border-green-500 bg-green-50 dark:bg-green-950/20'
          }`}>
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Reason (required)</Label>
              <Textarea
                id="ban-reason"
                placeholder={`Explain why this user is being ${isActive ? 'banned' : 'unbanned'} (minimum 10 characters)...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
              {reason.length > 0 && reason.length < 10 && (
                <p className={`text-xs ${isActive ? 'text-destructive' : 'text-red-600'}`}>
                  Reason must be at least 10 characters ({reason.length}/10)
                </p>
              )}
            </div>

            {banMutation.isError && (
              <ErrorMessage
                message={banMutation.error?.message || `Failed to ${actionText.toLowerCase()} user`}
                type="error"
              />
            )}

            <div className="flex gap-2">
              <Button
                variant={isActive ? 'destructive' : 'default'}
                onClick={() => handleAction(isActive ? 'ban' : 'unban')}
                disabled={reason.trim().length < 10 || banMutation.isPending}
                className="flex-1"
              >
                {banMutation.isPending ? `${actionText}ning...` : `Confirm ${actionText}`}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirm(false);
                  setReason('');
                }}
                disabled={banMutation.isPending}
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

export default BanUser;

