import React, { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';

const VerifyEmailSent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".sent-card", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4" ref={containerRef}>
      <div className="sent-card glass-card w-full max-w-md p-10 rounded-[40px] text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-hive/5 rounded-full blur-3xl -mr-16 -mt-16" />

        <div className="relative z-10 space-y-8">
          <div className="flex justify-center">
            <div className="p-6 rounded-full bg-accent-hive/10 border border-accent-hive/20 flex items-center justify-center shadow-lg shadow-accent-hive/20">
              <Mail className="h-16 w-16 text-accent-hive" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase">Packet Dispatched</h1>
            <p className="text-muted-foreground text-sm font-light leading-relaxed">
              We've transmitted an identity verification link to your neural address. Please verify to access the hive archives.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-left space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-accent-hive mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">Check your primary inbox and spam protocols.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-accent-hive mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">The link will naturally decay after 24 hours.</p>
            </div>
          </div>

          <div className="grid gap-4">
            <Button asChild className="premium-button w-full h-12 rounded-2xl flex items-center justify-center gap-2">
              <Link to="/auth/login" className="w-full h-full flex items-center justify-center">
                Return to Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Link to="/" className="glass-card h-12 rounded-2xl flex items-center justify-center text-sm font-bold border-white/10 hover:bg-white/5 transition-all">
              Home Interface
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailSent;
