import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contributionSchema, type ContributionFormData } from '../schemas/contributionSchema';
import { type Contribution } from '../api/contributions';

type ContributionFormValues = ContributionFormData;
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { X, Plus, Link as LinkIcon, Paperclip, Clock, Edit2, Trash2 } from 'lucide-react';
import ErrorMessage from './ErrorMessage';

interface ContributionFormProps {
  projectTitle: string;
  onSubmit: (data: ContributionFormValues) => void;
  isLoading?: boolean;
  isHost?: boolean;
  hasExistingContribution?: boolean;
  existingContribution?: Contribution;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const ContributionForm: React.FC<ContributionFormProps> = ({
  projectTitle,
  onSubmit,
  isLoading = false,
  isHost = false,
  hasExistingContribution = false,
  existingContribution,
  onDelete,
  isDeleting = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      title: '',
      body: '',
      links: [],
      attachments: [],
    },
  });

  // Pre-fill form when existingContribution changes or isEditing is toggled
  useEffect(() => {
    if (existingContribution && isEditing) {
      reset({
        title: existingContribution.title || '',
        body: existingContribution.body || '',
        links: existingContribution.links || [],
        attachments: existingContribution.attachments || [],
      });
    }
  }, [existingContribution, isEditing, reset]);

  const [currentLink, setCurrentLink] = useState('');
  const [currentAttachment, setCurrentAttachment] = useState('');
  const links = watch('links', []);
  const attachments = watch('attachments', []);


  const addLink = () => {
    if (currentLink && links && links.length < 10) {
      try {
        new URL(currentLink); // Validate URL
        if (!links.includes(currentLink)) {
          setValue('links', [...links, currentLink], { shouldValidate: true });
          setCurrentLink('');
          clearErrors('links');
        } else {
          setError('links', { type: 'manual', message: 'This link has already been added.' });
        }
      } catch {
        setError('links', { type: 'manual', message: 'Invalid URL format.' });
      }
    } else if (links && links.length >= 10) {
      setError('links', { type: 'manual', message: 'Maximum 10 links allowed.' });
    }
  };

  const removeLink = (linkToRemove: string) => {
    setValue('links', links?.filter((link) => link !== linkToRemove) || [], { shouldValidate: true });
    clearErrors('links');
  };

  const addAttachment = () => {
    if (currentAttachment && attachments && attachments.length < 5) {
      try {
        new URL(currentAttachment); // Validate URL
        if (!attachments.includes(currentAttachment)) {
          setValue('attachments', [...attachments, currentAttachment], { shouldValidate: true });
          setCurrentAttachment('');
          clearErrors('attachments');
        } else {
          setError('attachments', { type: 'manual', message: 'This attachment has already been added.' });
        }
      } catch {
        setError('attachments', { type: 'manual', message: 'Invalid URL format.' });
      }
    } else if (attachments && attachments.length >= 5) {
      setError('attachments', { type: 'manual', message: 'Maximum 5 attachments allowed.' });
    }
  };

  const removeAttachment = (attachmentToRemove: string) => {
    setValue('attachments', attachments?.filter((att) => att !== attachmentToRemove) || [], { shouldValidate: true });
    clearErrors('attachments');
  };

  if (isHost) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-amber-800">Cannot Request to Join</CardTitle>
          <CardDescription className="text-amber-700">
            You are the host of this project and are already its main contributor.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleFormSubmit = async (data: ContributionFormValues) => {
    await onSubmit(data);
    setIsEditing(false); // Stop editing after submission
  };

  if (hasExistingContribution && !isEditing) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-blue-800 dark:text-blue-400">the request is currently under review</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Thank you for your interest! The project host has been notified and is currently reviewing your application.
        </p>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Application
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Withdrawing...' : 'Withdraw Application'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{isEditing ? 'Edit Request' : 'Request to Join'}</CardTitle>
          <CardDescription>
            Tell the host why you'd like to join <strong>{projectTitle}</strong> and what you can contribute.
          </CardDescription>
        </div>
        {isEditing && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {errors.root?.serverError && (
            <ErrorMessage message={errors.root.serverError.message || 'An unexpected error occurred'} type="error" />
          )}

          {/* Body (Required) */}
          <div className="space-y-2">
            <Label htmlFor="body">
              Reason for applying <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="body"
              rows={8}
              placeholder="Why do you want to join? What would you like to do? What is your relevant experience?"
              {...register('body')}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Minimum 5 words, maximum 5000 characters
            </p>
            {errors.body && <p className="text-sm text-red-500">{errors.body.message}</p>}
          </div>

          {/* Links */}
          <div className="space-y-2">
            <Label htmlFor="links">
              Resource Links <span className="text-muted-foreground text-sm">(GitHub, Portfolio, etc. - Max 10)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="links"
                type="url"
                placeholder="https://github.com/username/repo"
                value={currentLink}
                onChange={(e) => setCurrentLink(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLink();
                  }
                }}
                disabled={isLoading || (links && links.length >= 10)}
              />
              <Button
                type="button"
                onClick={addLink}
                disabled={isLoading || !currentLink || (links && links.length >= 10)}
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.links && <p className="text-sm text-red-500">{errors.links.message}</p>}
            {links && links.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {links.map((link, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1">
                    <LinkIcon className="h-3 w-3" />
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline max-w-[200px] truncate"
                    >
                      {link}
                    </a>
                    <button
                      type="button"
                      onClick={() => removeLink(link)}
                      className="ml-1 hover:text-destructive"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label htmlFor="attachments">
              Attachments <span className="text-muted-foreground text-sm">(URLs - Max 5)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="attachments"
                type="url"
                placeholder="https://example.com/file.pdf"
                value={currentAttachment}
                onChange={(e) => setCurrentAttachment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAttachment();
                  }
                }}
                disabled={isLoading || (attachments && attachments.length >= 5)}
              />
              <Button
                type="button"
                onClick={addAttachment}
                disabled={isLoading || !currentAttachment || (attachments && attachments.length >= 5)}
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.attachments && <p className="text-sm text-red-500">{errors.attachments.message}</p>}
            {attachments && attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attachments.map((attachment, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1">
                    <Paperclip className="h-3 w-3" />
                    <a
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline max-w-[200px] truncate"
                    >
                      {attachment}
                    </a>
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment)}
                      className="ml-1 hover:text-destructive"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t">
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (isEditing ? 'Updating...' : 'Sending Request...') : (isEditing ? 'Update Application' : 'Send Request to Join')}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Your application will be reviewed by the project host
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContributionForm;
