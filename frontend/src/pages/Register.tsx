import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { registerSchema, type RegisterFormData } from '../schemas/authSchema';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await registerUser(data.email, data.password, data.confirm_password, data.display_name);
      // Navigation handled by AuthContext
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 md:p-10 relative">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[hsl(var(--accent-hive))]/[0.05] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-[hsl(var(--accent-secondary))]/[0.03] rounded-full blur-[80px]" />
      </div>

      <div className="flex w-full max-w-md flex-col gap-6 relative z-10">
        <div className="glass-card-glow p-8 md:p-10 rounded-2xl flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col gap-3 text-center">
            <h1 className="font-display text-3xl font-bold text-gradient">{t('auth.registerTitle')}</h1>
            <p className="text-muted-foreground">
              {t('auth.registerSubtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {error && <ErrorMessage message={error} type="error" />}

            <div className="flex flex-col gap-5">
              <div className="grid gap-2.5">
                <Label htmlFor="email" className="font-medium">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  required
                  className="h-11 bg-background/50 border-[hsl(var(--border))] focus:border-[hsl(var(--accent-hive))]/50 transition-colors"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-2.5">
                <Label htmlFor="display_name" className="font-medium">{t('auth.displayName')}</Label>
                <Input
                  id="display_name"
                  type="text"
                  placeholder={t('auth.displayNamePlaceholder')}
                  required
                  className="h-11 bg-background/50 border-[hsl(var(--border))] focus:border-[hsl(var(--accent-hive))]/50 transition-colors"
                  {...register('display_name')}
                  disabled={isLoading}
                />
                {errors.display_name && (
                  <p className="text-sm text-destructive">{errors.display_name.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2.5">
                  <Label htmlFor="password" className="font-medium">{t('auth.password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    className="h-11 bg-background/50 border-[hsl(var(--border))] focus:border-[hsl(var(--accent-hive))]/50 transition-colors"
                    {...register('password')}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
                <div className="grid gap-2.5">
                  <Label htmlFor="confirm_password" className="font-medium">{t('auth.confirmPassword')}</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    required
                    className="h-11 bg-background/50 border-[hsl(var(--border))] focus:border-[hsl(var(--accent-hive))]/50 transition-colors"
                    {...register('confirm_password')}
                    disabled={isLoading}
                  />
                  {errors.confirm_password && (
                    <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
                  )}
                </div>
              </div>
              <button type="submit" className="premium-button w-full h-12 text-base mt-2" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="sm" /> : t('auth.registerButton')}
              </button>
            </div>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/auth/login" className="text-[hsl(var(--accent-hive))] font-medium hover:text-[hsl(var(--accent-hive-light))] transition-colors">
              {t('auth.signIn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

