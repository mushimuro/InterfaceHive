import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { registerSchema, type RegisterFormData } from '../schemas/authSchema';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Layers } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const Register: React.FC = () => {
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
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Layers className="size-4" />
          </div>
          InterfaceHive
        </a>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-muted-foreground text-sm">
              Enter your information to create an account
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {error && <ErrorMessage message={error} type="error" />}

            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  type="text"
                  placeholder="John Doe"
                  required
                  {...register('display_name')}
                  disabled={isLoading}
                />
                {errors.display_name && (
                  <p className="text-sm text-red-500">{errors.display_name.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  {...register('password')}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  required
                  {...register('confirm_password')}
                  disabled={isLoading}
                />
                {errors.confirm_password && (
                  <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="sm" /> : 'Create Account'}
              </Button>
            </div>
          </form>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            Already have an account?{' '}
            <Link to="/auth/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

