import React from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { type ProjectFormData } from '../schemas/projectSchema';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import LoadingSpinner from './LoadingSpinner';

interface ProjectFormProps {
  form: UseFormReturn<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => void;
  isLoading: boolean;
  submitLabel?: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  form,
  onSubmit,
  isLoading,
  submitLabel = 'Create Project',
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const difficulty = watch('difficulty');
  const status = watch('status');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Project Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="Build a responsive navigation menu"
          {...register('title')}
          disabled={isLoading}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe your project and what you need help with..."
          rows={5}
          {...register('description')}
          disabled={isLoading}
        />
        <p className="text-sm text-muted-foreground">
          Minimum 50 characters. Be clear and detailed about what you need.
        </p>
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* What It Does */}
      <div className="space-y-2">
        <Label htmlFor="what_it_does">What It Does (Optional)</Label>
        <Textarea
          id="what_it_does"
          placeholder="Explain what the current system/project does..."
          rows={3}
          {...register('what_it_does')}
          disabled={isLoading}
        />
        {errors.what_it_does && (
          <p className="text-sm text-red-500">{errors.what_it_does.message}</p>
        )}
      </div>

      {/* Inputs/Dependencies */}
      <div className="space-y-2">
        <Label htmlFor="inputs_dependencies">Inputs & Dependencies (Optional)</Label>
        <Textarea
          id="inputs_dependencies"
          placeholder="List any existing code, APIs, or resources the contributor needs..."
          rows={3}
          {...register('inputs_dependencies')}
          disabled={isLoading}
        />
        {errors.inputs_dependencies && (
          <p className="text-sm text-red-500">{errors.inputs_dependencies.message}</p>
        )}
      </div>

      {/* Desired Outputs */}
      <div className="space-y-2">
        <Label htmlFor="desired_outputs">
          Desired Outputs <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="desired_outputs"
          placeholder="Describe what you want the contributor to deliver..."
          rows={4}
          {...register('desired_outputs')}
          disabled={isLoading}
        />
        <p className="text-sm text-muted-foreground">
          Be specific about deliverables (code, documentation, design files, etc.)
        </p>
        {errors.desired_outputs && (
          <p className="text-sm text-red-500">{errors.desired_outputs.message}</p>
        )}
      </div>

      {/* Difficulty & Estimated Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty Level (Optional)</Label>
          <Select
            value={difficulty || ''}
            onValueChange={(value) => setValue('difficulty', (value === 'none' ? '' : value) as any)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Optional)</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          {errors.difficulty && (
            <p className="text-sm text-red-500">{errors.difficulty.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimated_time">Estimated Time (Optional)</Label>
          <Input
            id="estimated_time"
            type="text"
            placeholder="e.g., 2-4 hours"
            {...register('estimated_time')}
            disabled={isLoading}
          />
          {errors.estimated_time && (
            <p className="text-sm text-red-500">{errors.estimated_time.message}</p>
          )}
        </div>
      </div>

      {/* GitHub URL */}
      <div className="space-y-2">
        <Label htmlFor="github_url">GitHub Repository URL (Optional)</Label>
        <Input
          id="github_url"
          type="url"
          placeholder="https://github.com/username/repo"
          {...register('github_url')}
          disabled={isLoading}
        />
        {errors.github_url && (
          <p className="text-sm text-red-500">{errors.github_url.message}</p>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (Optional)</Label>
        <Input
          id="tags"
          type="text"
          placeholder="react, typescript, ui (comma-separated, max 5)"
          onChange={(e) => {
            const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
            setValue('tags', tags);
          }}
          disabled={isLoading}
        />
        <p className="text-sm text-muted-foreground">
          Add up to 5 tags, separated by commas
        </p>
        {errors.tags && (
          <p className="text-sm text-red-500">{errors.tags.message}</p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={status}
          onValueChange={(value) => setValue('status', value as any)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft (not visible to others)</SelectItem>
            <SelectItem value="open">Open (accepting contributions)</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-sm text-red-500">{errors.status.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <LoadingSpinner size="sm" /> : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;

