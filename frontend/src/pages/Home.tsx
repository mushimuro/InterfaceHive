import React, { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/Landing.css';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Lottie fallback SVG component (Animated Hexagon)
// Moved outside to prevent re-creation on every render
const LottieFallback = () => (
  <svg width="200" height="200" viewBox="0 0 200 200" style={{ filter: 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.3))' }}>
    <polygon
      points="100,20 170,60 170,140 100,180 30,140 30,60"
      fill="none"
      stroke="#f59e0b"
      strokeWidth="3"
      opacity="0.8"
    >
      <animate attributeName="stroke-width" values="3;5;3" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
    </polygon>
    <polygon
      points="100,50 150,80 150,140 100,170 50,140 50,80"
      fill="rgba(245, 158, 11, 0.1)"
      stroke="#fbbf24"
      strokeWidth="2"
      opacity="0.6"
    >
      <animate attributeName="opacity" values="0.6;0.9;0.6" dur="3s" repeatCount="indefinite" />
    </polygon>
  </svg>
);

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Intro Sequence
      const heroTl = gsap.timeline({ defaults: { ease: "power2.out" } });
      heroTl
        .from(".lottie-container", { opacity: 0, scale: 0.8, duration: 0.8, delay: 0.2 })
        .from(".hero-headline", { opacity: 0, y: 30, duration: 1, ease: "power3.out" }, "-=0.4")
        .from(".hero-subheadline", { opacity: 0, y: 20, duration: 1, ease: "power3.out" }, "-=0.6")
        .from(".hero-ctas", { opacity: 0, y: 20, duration: 1, ease: "power3.out" }, "-=0.6");

      // Hero Floating Animation
      gsap.to(".lottie-container", {
        y: -15,
        duration: 2.5,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true
      });

      // Parallax Hero Gradient
      gsap.to(".hero-gradient", {
        scrollTrigger: {
          trigger: ".landing-hero",
          start: "top top",
          end: "bottom top",
          scrub: 1
        },
        y: 200,
        opacity: 0.3
      });

      // Feature Cards reveal
      gsap.to(".feature-card", {
        scrollTrigger: {
          trigger: ".landing-features",
          start: "top 80%",
          toggleActions: "play none none none"
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out"
      });

      // How It Works reveal
      gsap.to(".section-header", {
        scrollTrigger: {
          trigger: ".how-it-works",
          start: "top 80%",
          toggleActions: "play none none none"
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.to(".workflow-step", {
        scrollTrigger: {
          trigger: ".workflow",
          start: "top 80%",
          toggleActions: "play none none none"
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      });

      gsap.to(".workflow-connector", {
        scrollTrigger: {
          trigger: ".workflow",
          start: "top 80%",
          toggleActions: "play none none none"
        },
        opacity: 0.5,
        duration: 0.5,
        stagger: 0.2,
        delay: 0.3
      });

      // Stats Counters
      const statElements = document.querySelectorAll('.stat-value');
      gsap.to(".stat-card", {
        scrollTrigger: {
          trigger: ".stats-grid",
          start: "top 85%",
          toggleActions: "play none none none",
          onEnter: () => {
            statElements.forEach(el => {
              const stat = el as HTMLElement;
              const target = parseInt(stat.getAttribute('data-count') || '0', 10);
              gsap.to(stat, {
                innerText: target,
                duration: 2,
                ease: "power2.out",
                snap: { innerText: 1 },
                onUpdate: function () {
                  const current = Math.round(Number(this.targets()[0].innerText));
                  stat.textContent = current.toLocaleString();
                }
              });
            });
          }
        },
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out"
      });

      // CTA Reveal
      gsap.to(".cta-content", {
        scrollTrigger: {
          trigger: ".landing-cta",
          start: "top 75%",
          toggleActions: "play none none none"
        },
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: "back.out(1.4)"
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="landing-page text-foreground bg-background">
      {/* Hero Section */}
      <section className="landing-hero" id="hero">
        <div className="hero-content">
          <div className="lottie-container">
            <LottieFallback />
          </div>

          <h1 className="hero-headline">{t('home.hero.title')}</h1>

          <p className="hero-subheadline">
            {t('home.hero.subtitle')}
          </p>

          <div className="hero-ctas">
            {user ? (
              <Link to="/projects" className="landing-btn btn-primary-landing">
                {t('home.hero.browseProjects')}
                <span className="btn-glow"></span>
              </Link>
            ) : (
              <>
                <Link to="/auth/register" className="landing-btn btn-primary-landing">
                  {t('home.hero.cta')}
                  <span className="btn-glow"></span>
                </Link>
                <Link to="/projects" className="landing-btn btn-secondary-landing">
                  {t('home.hero.browseProjects')}
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="hero-gradient"></div>
        <div className="hexagon-pattern"></div>
      </section>

      {/* Feature Section */}
      <section className="landing-features" id="features">
        <div className="features-grid">
          {/* Feature 1 */}
          <article className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 16L28 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 16V30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 16L4 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="feature-title">{t('home.features.publishCalls.title')}</h3>
            <p className="feature-description">
              {t('home.features.publishCalls.description')}
            </p>
          </article>

          {/* Feature 2 */}
          <article className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M16 11V16L19 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 6V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 30V26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M6 16H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M30 16H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="feature-title">{t('home.features.creditSystem.title')}</h3>
            <p className="feature-description">
              {t('home.features.creditSystem.description')}
            </p>
          </article>

          {/* Feature 3 */}
          <article className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M28 20V28H4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 13L13 18L24 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                <circle cx="24" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h3 className="feature-title">{t('home.features.realtimeChat.title')}</h3>
            <p className="feature-description">
              {t('home.features.realtimeChat.description')}
            </p>
          </article>

          {/* Feature 4 */}
          <article className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2L20 10L29 11.5L22.5 18L24 27L16 22.5L8 27L9.5 18L3 11.5L12 10L16 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="feature-title">{t('home.features.qualityReviews.title')}</h3>
            <p className="feature-description">
              {t('home.features.qualityReviews.description')}
            </p>
          </article>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works">
        <div className="container mx-auto">
          <div className="section-header">
            <h2 className="section-headline">{t('home.howItWorks.title')}</h2>
            <p className="section-subheadline">
              {t('home.howItWorks.subtitle')}
            </p>
          </div>

          <div className="workflow">
            <div className="workflow-step">
              <div className="step-number">1</div>
              <div className="step-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 16H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M16 24H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M16 32H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="feature-title text-xl">{t('home.howItWorks.step1.title')}</h3>
              <p className="step-description">{t('home.howItWorks.step1.description')}</p>
            </div>

            <div className="workflow-connector">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <path d="M10 20H30M30 20L22 12M30 20L22 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="workflow-step">
              <div className="step-number">2</div>
              <div className="step-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M24 8L24 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M16 24L24 32L32 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 40H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="feature-title text-xl">{t('home.howItWorks.step2.title')}</h3>
              <p className="step-description">{t('home.howItWorks.step2.description')}</p>
            </div>

            <div className="workflow-connector">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <path d="M10 20H30M30 20L22 12M30 20L22 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="workflow-step">
              <div className="step-number">3</div>
              <div className="step-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" />
                  <path d="M24 14V24L30 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="feature-title text-xl">{t('home.howItWorks.step3.title')}</h3>
              <p className="step-description">{t('home.howItWorks.step3.description')}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value" data-count="500">0</div>
              <div className="stat-label">{t('home.stats.activeProjects')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" data-count="2000">0</div>
              <div className="stat-label">{t('home.stats.contributors')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" data-count="10000">0</div>
              <div className="stat-label">{t('home.stats.creditsAwarded')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" data-count="95">0</div>
              <span className="stat-suffix">%</span>
              <div className="stat-label">{t('home.stats.satisfactionRate')}</div>
            </div>
          </div>
        </div>

        {/* Decorative Honeycomb Pattern */}
        <div className="honeycomb-decoration">
          <svg width="100%" height="100%" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="honeycomb-react" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
                <path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100" fill="none" stroke="rgba(245, 158, 11, 0.1)" strokeWidth="1" />
                <path d="M28 0L28 34L0 50L0 16L28 0" fill="rgba(245, 158, 11, 0.03)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#honeycomb-react)" />
          </svg>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta" id="cta">
        <div className="cta-background"></div>
        <div className="cta-content" style={{ scale: 0.9 }}>
          <h2 className="cta-headline">{t('home.cta.title')}</h2>
          <p className="text-lg text-muted-foreground mb-12">
            {t('home.cta.subtitle')}
          </p>
          {user ? (
            <Link to="/projects/create" className="landing-btn btn-primary-landing px-12 py-4 text-xl">
              {t('home.cta.createFirstCall')}
              <span className="btn-glow"></span>
            </Link>
          ) : (
            <Link to="/auth/register" className="landing-btn btn-primary-landing px-12 py-4 text-xl">
              {t('home.cta.createAccount')}
              <span className="btn-glow"></span>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
