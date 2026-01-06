/**
 * InterfaceHive Landing Page
 * Main JavaScript - GSAP, Lottie, Three.js Integration
 */

/* ===================================
   GSAP Intro & General Animations
   =================================== */
function initAnimations() {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Hero section intro sequence
    const heroTimeline = gsap.timeline({ defaults: { ease: 'power2.out' } });

    heroTimeline
        .to('.lottie-container', {
            opacity: 1,
            duration: 0.8,
            delay: 0.2
        })
        .to('.hero-headline', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out'
        }, '-=0.4')
        .to('.hero-subheadline', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out'
        }, '-=0.6')
        .to('.hero-ctas', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out'
        }, '-=0.6');

    // Set initial states for hero elements
    gsap.set('.hero-headline', { y: 30 });
    gsap.set('.hero-subheadline', { y: 20 });
    gsap.set('.hero-ctas', { y: 20 });

    // Floating animation for Lottie container
    gsap.to('.lottie-container', {
        y: -15,
        duration: 2.5,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true
    });

    // CTA button hover micro-interactions (enhanced beyond CSS)
    const ctaButtons = document.querySelectorAll('.btn-primary');
    ctaButtons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, {
                scale: 1.05,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
}

/* ===================================
   Lottie Animation Integration
   =================================== */
function initLottie() {
    // Load collaboration/teamwork themed Lottie animation
    // Using a publicly available animation from LottieFiles
    const lottieContainer = document.getElementById('lottie-hero');

    if (!lottieContainer) {
        console.warn('Lottie container not found');
        return;
    }

    try {
        const animation = lottie.loadAnimation({
            container: lottieContainer,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            // Using a connection/network animation that represents collaboration
            path: 'https://lottie.host/a7ff6b3b-9f7f-4d8e-9b4e-8c3f4e5d6a7b/1234567890.json'
        });

        // Fallback: If the specific animation fails, create a simple shape
        animation.addEventListener('data_failed', () => {
            console.warn('Lottie animation failed to load, using fallback');
            createLottieFallback(lottieContainer);
        });

        // Control playback speed on scroll (optional enhancement)
        ScrollTrigger.create({
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            onUpdate: (self) => {
                // Speed up animation as user scrolls down
                const speed = 1 + (self.progress * 0.5);
                animation.setSpeed(speed);
            }
        });

    } catch (error) {
        console.warn('Lottie initialization error:', error);
        createLottieFallback(lottieContainer);
    }
}

/**
 * Fallback animation if Lottie fails to load
 * Creates a simple animated SVG hexagon
 */
function createLottieFallback(container) {
    container.innerHTML = `
        <svg width="200" height="200" viewBox="0 0 200 200" style="filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.3));">
            <polygon
                points="100,20 170,60 170,140 100,180 30,140 30,60"
                fill="none"
                stroke="#f59e0b"
                stroke-width="3"
                opacity="0.8"
            >
                <animate
                    attributeName="stroke-width"
                    values="3;5;3"
                    dur="2s"
                    repeatCount="indefinite"
                />
                <animate
                    attributeName="opacity"
                    values="0.8;1;0.8"
                    dur="2s"
                    repeatCount="indefinite"
                />
            </polygon>
            <polygon
                points="100,50 150,80 150,140 100,170 50,140 50,80"
                fill="rgba(245, 158, 11, 0.1)"
                stroke="#fbbf24"
                stroke-width="2"
                opacity="0.6"
            >
                <animate
                    attributeName="opacity"
                    values="0.6;0.9;0.6"
                    dur="3s"
                    repeatCount="indefinite"
                />
            </polygon>
        </svg>
    `;
}

/* ===================================
   How It Works Section Animations
   =================================== */
function initHowItWorks() {
    // Section header reveal
    gsap.to('.section-header', {
        scrollTrigger: {
            trigger: '.how-it-works',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
    });

    gsap.set('.section-header', { y: 30 });

    // Workflow steps staggered reveal
    gsap.to('.workflow-step', {
        scrollTrigger: {
            trigger: '.workflow',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
    });

    // Workflow connectors fade in
    gsap.to('.workflow-connector', {
        scrollTrigger: {
            trigger: '.workflow',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        opacity: 0.5,
        duration: 0.5,
        stagger: 0.2,
        delay: 0.3
    });

    gsap.set('.workflow-connector', { opacity: 0 });

    // Stats cards reveal with counting animation
    gsap.to('.stat-card', {
        scrollTrigger: {
            trigger: '.stats-grid',
            start: 'top 85%',
            toggleActions: 'play none none none',
            onEnter: () => animateCounters()
        },
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
    });
}

/**
 * Animate stat counters when they come into view
 */
function animateCounters() {
    const statValues = document.querySelectorAll('.stat-value');

    statValues.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'), 10);
        const duration = 2; // seconds

        // Use GSAP to animate the number
        gsap.to(stat, {
            innerText: target,
            duration: duration,
            ease: 'power2.out',
            snap: { innerText: 1 },
            onUpdate: function() {
                // Format large numbers with commas
                const current = Math.round(this.targets()[0].innerText);
                stat.innerText = current.toLocaleString();
            }
        });
    });
}

/* ===================================
   ScrollTrigger-Based Animations
   =================================== */
function initScrollTriggers() {
    // Feature cards staggered reveal
    gsap.to('.feature-card', {
        scrollTrigger: {
            trigger: '.features',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
    });

    // CTA section dramatic entrance
    gsap.to('.cta-content', {
        scrollTrigger: {
            trigger: '.cta',
            start: 'top 75%',
            toggleActions: 'play none none none'
        },
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: 'back.out(1.4)'
    });

    gsap.set('.cta-content', { scale: 0.9 });

    // Parallax effect on hero gradient
    gsap.to('.hero-gradient', {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        },
        y: 200,
        opacity: 0.3
    });
}

/* ===================================
   Initialization
   =================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules in sequence
    initAnimations();
    initLottie();
    initHowItWorks();
    initScrollTriggers();

    // Add smooth scroll behavior for anchor links (if any are added)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    console.log('🐝 InterfaceHive landing page initialized');
});

/* ===================================
   Performance Monitoring (Optional)
   =================================== */
if ('PerformanceObserver' in window) {
    const perfObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            // Log any long tasks (> 50ms) for optimization
            if (entry.duration > 50) {
                console.warn('Long task detected:', entry.name, entry.duration.toFixed(2) + 'ms');
            }
        }
    });

    try {
        perfObserver.observe({ entryTypes: ['measure', 'navigation'] });
    } catch (e) {
        // Some browsers may not support all entry types
        console.log('Performance monitoring not fully supported');
    }
}
