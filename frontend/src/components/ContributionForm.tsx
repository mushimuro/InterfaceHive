import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contributionSchema, type ContributionFormData } from '../schemas/contributionSchema';

type ContributionFormValues = ContributionFormData;
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { X, Plus, Link as LinkIcon, Paperclip } from 'lucide-react';
import ErrorMessage from './ErrorMessage';

interface ContributionFormProps {
  projectTitle: string;
  onSubmit: (data: ContributionFormValues) => void;
  isLoading?: boolean;
  isHost?: boolean;
  hasExistingContribution?: boolean;
}

const ContributionForm: React.FC<ContributionFormProps> = ({
  projectTitle,
  onSubmit,
  isLoading = false,
  isHost = false,
  hasExistingContribution = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  const [currentLink, setCurrentLink] = useState('');
  const [currentAttachment, setCurrentAttachment] = useState('');
  const links = watch('links', []);
  const attachments = watch('attachments', []);

  // Check if form should be disabled
  const isFormDisabled = isHost || hasExistingContribution;

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
          <CardTitle className="text-amber-800">Cannot Submit Contribution</CardTitle>
          <CardDescription className="text-amber-700">
            You are the host of this project and cannot submit a contribution to your own project.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (hasExistingContribution) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-800">Contribution Already Submitted</CardTitle>
          <CardDescription className="text-blue-700">
            You have already submitted a contribution to this project. Only one contribution per project is allowed.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Contribution</CardTitle>
        <CardDescription>
          Share your work on <strong>{projectTitle}</strong>. The project host will review your submission.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root?.serverError && (
            <ErrorMessage message={errors.root.serverError.message || 'An unexpected error occurred'} type="error" />
          )}

          {/* Title (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-muted-foreground text-sm">(Optional)</span>
            </Label>
            <Input
              id="title"
              placeholder="Brief title for your contribution"
              {...register('title')}
              disabled={isFormDisabled}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          {/* Body (Required) */}
          <div className="space-y-2">
            <Label htmlFor="body">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="body"
              rows={8}
              placeholder="Describe what you've built, how it works, and any relevant details..."
              {...register('body')}
              disabled={isFormDisabled}
            />
            <p className="text-xs text-muted-foreground">
              Minimum 50 characters, maximum 5000 characters
            </p>
            {errors.body && <p className="text-sm text-red-500">{errors.body.message}</p>}
          </div>

          {/* Links */}
          <div className="space-y-2">
            <Label htmlFor="links">
              Links <span className="text-muted-foreground text-sm">(GitHub, Demo, etc. - Max 10)</span>
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
                disabled={isFormDisabled || (links && links.length >= 10)}
              />
              <Button
                type="button"
                onClick={addLink}
                disabled={isFormDisabled || !currentLink || (links && links.length >= 10)}
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
                disabled={isFormDisabled || (attachments && attachments.length >= 5)}
              />
              <Button
                type="button"
                onClick={addAttachment}
                disabled={isFormDisabled || !currentAttachment || (attachments && attachments.length >= 5)}
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
            <Button type="submit" className="w-full" size="lg" disabled={isLoading || isFormDisabled}>
              {isLoading ? 'Submitting...' : 'Submit Contribution'}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Your submission will be reviewed by the project host
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContributionForm;

