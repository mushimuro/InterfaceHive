import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormData } from '../schemas/profileSchema';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { X, Plus } from 'lucide-react';
import ErrorMessage from './ErrorMessage';

interface ProfileFormProps {
  initialData?: ProfileFormData;
  onSubmit: (data: ProfileFormData) => void;
  isLoading?: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData || {
      display_name: '',
      bio: '',
      skills: [],
      github_url: '',
      portfolio_url: '',
    },
  });

  const [currentSkill, setCurrentSkill] = useState('');
  const skills = watch('skills', initialData?.skills || []);

  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key as keyof ProfileFormData, value);
      });
    }
  }, [initialData, setValue]);

  const addSkill = () => {
    if (currentSkill && skills && !skills.includes(currentSkill) && skills.length < 20) {
      setValue('skills', [...skills, currentSkill], { shouldValidate: true });
      setCurrentSkill('');
      clearErrors('skills');
    } else if (skills && skills.includes(currentSkill)) {
      setError('skills', { type: 'manual', message: 'Skill already added.' });
    } else if (skills && skills.length >= 20) {
      setError('skills', { type: 'manual', message: 'Maximum 20 skills allowed.' });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setValue('skills', skills?.filter((skill) => skill !== skillToRemove) || [], { shouldValidate: true });
    clearErrors('skills');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your profile information to help others learn more about you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root?.serverError && (
            <ErrorMessage message={errors.root.serverError.message} type="error" />
          )}

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display_name">
              Display Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="display_name"
              {...register('display_name')}
              placeholder="Your name"
              disabled={isLoading}
            />
            {errors.display_name && (
              <p className="text-sm text-red-500">{errors.display_name.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">
              Bio <span className="text-muted-foreground text-sm">(Optional)</span>
            </Label>
            <Textarea
              id="bio"
              rows={5}
              {...register('bio')}
              placeholder="Tell us about yourself..."
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Maximum 1000 characters
            </p>
            {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label htmlFor="skills">
              Skills <span className="text-muted-foreground text-sm">(Max 20)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="skills"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="e.g., React, Python, Design"
                disabled={isLoading || (skills && skills.length >= 20)}
              />
              <Button
                type="button"
                onClick={addSkill}
                disabled={isLoading || !currentSkill || (skills && skills.length >= 20)}
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.skills && <p className="text-sm text-red-500">{errors.skills.message}</p>}
            {skills && skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1 pr-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
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

          {/* GitHub URL */}
          <div className="space-y-2">
            <Label htmlFor="github_url">
              GitHub URL <span className="text-muted-foreground text-sm">(Optional)</span>
            </Label>
            <Input
              id="github_url"
              type="url"
              {...register('github_url')}
              placeholder="https://github.com/username"
              disabled={isLoading}
            />
            {errors.github_url && (
              <p className="text-sm text-red-500">{errors.github_url.message}</p>
            )}
          </div>

          {/* Portfolio URL */}
          <div className="space-y-2">
            <Label htmlFor="portfolio_url">
              Portfolio URL <span className="text-muted-foreground text-sm">(Optional)</span>
            </Label>
            <Input
              id="portfolio_url"
              type="url"
              {...register('portfolio_url')}
              placeholder="https://yourportfolio.com"
              disabled={isLoading}
            />
            {errors.portfolio_url && (
              <p className="text-sm text-red-500">{errors.portfolio_url.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t">
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;

