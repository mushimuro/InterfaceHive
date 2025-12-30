import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail, resendVerification } from '../api/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { CheckCircle, XCircle } from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        const response = await verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
        setEmail(response.data?.email || '');
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error.response?.data?.detail ||
          'Verification failed. The token may be invalid or expired.'
        );
      }
    };

    verify();
  }, [token]);

  const handleResend = async () => {
    if (!email) return;

    try {
      await resendVerification(email);
      setMessage('Verification email resent. Please check your inbox.');
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Failed to resend verification email');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <div className="flex justify-center mb-4">
              <LoadingSpinner size="lg" />
            </div>
          )}
          {status === 'success' && (
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          )}
          {status === 'error' && (
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
          )}
          
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' && 'Verifying Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we verify your email address...'}
            {status === 'success' && 'Your email has been successfully verified'}
            {status === 'error' && 'We couldn\'t verify your email address'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {message && (
            <ErrorMessage
              message={message}
              type={status === 'success' ? 'success' : 'error'}
            />
          )}

          {status === 'success' && (
            <p className="text-center text-muted-foreground">
              You can now log in to your account and start collaborating on projects.
            </p>
          )}

          {status === 'error' && (
            <p className="text-center text-muted-foreground">
              The verification link may have expired or is invalid. 
              {email && ' You can request a new verification email.'}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          {status === 'success' && (
            <Button asChild className="w-full">
              <Link to="/auth/login">Go to Login</Link>
            </Button>
          )}

          {status === 'error' && email && (
            <Button
              onClick={handleResend}
              variant="outline"
              className="w-full"
            >
              Resend Verification Email
            </Button>
          )}

          <Button asChild variant="outline" className="w-full">
            <Link to="/">Back to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;

