import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail, resendVerification } from '../api/auth';
import { Button } from '../components/ui/button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { CheckCircle, XCircle, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const containerRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".verify-card", {
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: "power3.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('PROTOCOL_ERROR: No verification token detected.');
        return;
      }

      try {
        const response = await verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Identity verified successfully.');
        setEmail(response.data?.email || '');
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error.response?.data?.detail ||
          'VERIFICATION_FAILED: The link has potentially decayed or is unauthorized.'
        );
      }
    };

    verify();
  }, [token]);

  const handleResend = async () => {
    if (!email) return;
    try {
      await resendVerification(email);
      setMessage('Identity packet resent. Check your encrypted inbox.');
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'SYST_FAIL: Unable to resend packet.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4" ref={containerRef}>
      <div className="verify-card glass-card w-full max-w-md p-10 rounded-[40px] text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-hive/5 rounded-full blur-3xl -mr-16 -mt-16" />

        <div className="relative z-10 space-y-8">
          <div className="flex justify-center">
            {status === 'loading' && (
              <div className="p-6 rounded-full bg-accent-hive/5 border border-accent-hive/10 flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            )}
            {status === 'success' && (
              <div className="p-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-lg shadow-green-500/20">
                <ShieldCheck className="h-16 w-16 text-green-400" />
              </div>
            )}
            {status === 'error' && (
              <div className="p-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-lg shadow-red-500/20">
                <XCircle className="h-16 w-16 text-red-400" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
              {status === 'loading' && 'Authenticating'}
              {status === 'success' && 'Identity Verified'}
              {status === 'error' && 'Auth Terminated'}
            </h1>
            <p className="text-muted-foreground text-sm font-light">
              {status === 'loading' && 'Processing neural handshake protocol...'}
              {status === 'success' && 'Your uplink is now secure and authenticated.'}
              {status === 'error' && 'We were unable to verify your analyst credentials.'}
            </p>
          </div>

          <div className="py-2">
            {message && (
              <ErrorMessage
                message={message}
                type={status === 'success' ? 'success' : 'error'}
              />
            )}
          </div>

          <div className="grid gap-4">
            {status === 'success' && (
              <Link to="/auth/login" className="premium-button w-full h-12 rounded-2xl flex items-center justify-center gap-2">
                Access Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            {status === 'error' && email && (
              <button
                onClick={handleResend}
                className="premium-button w-full h-12 rounded-2xl flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700"
              >
                <Mail className="h-4 w-4" />
                Resend Identity Packet
              </button>
            )}

            <Link to="/" className="glass-card h-12 rounded-2xl flex items-center justify-center text-sm font-bold border-white/10 hover:bg-white/5 transition-all">
              Return to Collective
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
