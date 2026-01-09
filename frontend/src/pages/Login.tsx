import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { loginSchema, type LoginFormData } from '../schemas/authSchema';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data.email, data.password);
      // Navigation handled by AuthContext
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 md:p-10 relative">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[hsl(var(--accent-hive))]/[0.05] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[hsl(var(--accent-secondary))]/[0.03] rounded-full blur-[80px]" />
      </div>

      <div className="flex w-full max-w-md flex-col gap-6 relative z-10">
        <div className="glass-card-glow p-8 md:p-10 rounded-2xl flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col gap-3 text-center">
            <h1 className="font-display text-3xl font-bold text-gradient">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to continue to InterfaceHive
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {error && <ErrorMessage message={error} type="error" />}

            <div className="flex flex-col gap-5">
              <div className="grid gap-2.5">
                <Label htmlFor="email" className="font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
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
                <div className="flex items-center">
                  <Label htmlFor="password" className="font-medium">Password</Label>
                  <Link
                    to="/auth/forgot-password"
                    className="ml-auto text-sm text-[hsl(var(--accent-hive))] hover:text-[hsl(var(--accent-hive-light))] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
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

              <button type="submit" className="premium-button w-full h-12 text-base" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="sm" /> : 'Sign in'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full divider-glow" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[hsl(var(--card))] px-3 text-muted-foreground font-medium">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-dashed border-[hsl(var(--border))] hover:border-[hsl(var(--accent-hive))]/30 transition-colors"
                onClick={() => {
                  setValue('email', 'test@example.com');
                  setValue('password', 'Test1234!');
                }}
                disabled={isLoading}
              >
                Use test account
              </Button>
            </div>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/auth/register" className="text-[hsl(var(--accent-hive))] font-medium hover:text-[hsl(var(--accent-hive-light))] transition-colors">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

