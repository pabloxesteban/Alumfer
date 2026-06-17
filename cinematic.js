// ============================================================
// ALUMFER — Cinematic Engine
// Lenis + GSAP ScrollTrigger + SplitType
// Requires CDN scripts: gsap, ScrollTrigger, Lenis, SplitType
// ============================================================

// Immediately signal to main.js that cinematic engine is loading
window.__cinematicPending = true;

(function () {
  'use strict';

  // ── Environment detection ─────────────────────────────────
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile       = window.matchMedia('(max-width: 768px)').matches;
  const hasTouch       = window.matchMedia('(hover: none)').matches;

  // ── Guard: require GSAP ───────────────────────────────────
  if (!window.gsap || !window.ScrollTrigger) {
    console.warn('[cinematic] GSAP or ScrollTrigger not loaded — engine disabled.');
    window.__cinematicPending = false;
    return;
  }

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    gsap.registerPlugin(ScrollTrigger);

    // Mark cinematic active on <html> for CSS scoping
    document.documentElement.classList.add('cinematic');

    // ── 1. Custom cursor ─────────────────────────────────────
    if (!hasTouch && !isMobile) initCursor();

    // ── 2. Lenis smooth scroll ───────────────────────────────
    let lenis = null;
    if (!prefersReduced && window.Lenis) {
      lenis = new Lenis({
        duration:       1.2,
        easing:         t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel:    true,
        smoothTouch:    false,
        wheelMultiplier: 1.0,
        touchMultiplier: 2.0,
        infinite:       false,
      });

      // Sync Lenis with GSAP ticker (frame-perfect)
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      lenis.on('scroll', ScrollTrigger.update);

      // Drive scroll progress bar via Lenis
      const progressBar = document.querySelector('.scroll-progress');
      if (progressBar) {
        lenis.on('scroll', ({ progress }) => {
          progressBar.style.transform = `scaleX(${progress})`;
        });
      }

      // Allow hash links to work with Lenis
      document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
          const target = document.querySelector(a.getAttribute('href'));
          if (target) {
            e.preventDefault();
            lenis.scrollTo(target, { offset: -72, duration: 1.4 });
          }
        });
      });

      window.__lenis = lenis;
    }

    // ── 3. Hero: cinematic entrance ──────────────────────────
    initHero(lenis);

    // ── 4. Section header reveals ────────────────────────────
    if (!prefersReduced) initSectionHeaders();

    // ── 5. Features stagger ──────────────────────────────────
    if (!prefersReduced) initFeatures();

    // ── 6. Generic reveals ───────────────────────────────────
    if (!prefersReduced) initReveals();

    // ── 7. Gallery clip-path reveals ─────────────────────────
    if (!prefersReduced) initGallery();

    // ── 8. Catalog tab transitions ───────────────────────────
    initCatalogTransitions();

    // ── 9. Magnetic buttons ──────────────────────────────────
    if (!hasTouch && !isMobile && !prefersReduced) initMagneticButtons();

    // ── 10. Scroll velocity: navbar compress ─────────────────
    if (lenis && !prefersReduced) initNavbarVelocity(lenis);

    // ── 11. Parallax depth on selected elements ───────────────
    if (!prefersReduced && !isMobile) initParallax();
  }

  // ────────────────────────────────────────────────────────────
  // CUSTOM CURSOR
  // ────────────────────────────────────────────────────────────
  function initCursor() {
    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.className  = 'cine-cursor';
    ring.className = 'cine-cursor cine-cursor--ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = 0, my = 0;
    let rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      // Dot follows instantly
      gsap.set(dot, { x: mx, y: my });
    });

    // Ring follows with lag
    gsap.ticker.add(() => {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      gsap.set(ring, { x: rx, y: ry });
    });

    // Expand on interactive elements
    const interactives = 'a, button, input, textarea, .catalog-card, .works-item, .works-tab, .catalog-tab';
    document.querySelectorAll(interactives).forEach(el => {
      el.addEventListener('mouseenter', () => dot.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => dot.classList.remove('is-hovering'));
    });

    // Hide when leaving window
    document.addEventListener('mouseleave', () => gsap.to([dot, ring], { opacity: 0, duration: 0.3 }));
    document.addEventListener('mouseenter', () => gsap.to([dot, ring], { opacity: 1, duration: 0.3 }));
  }

  // ────────────────────────────────────────────────────────────
  // HERO CINEMATIC SEQUENCE
  // ────────────────────────────────────────────────────────────
  function initHero(lenis) {
    const hero     = document.querySelector('.hero');
    const heroBg   = document.querySelector('.hero__bg');
    const heroContent = document.querySelector('.hero__content');
    const heroTitle   = document.querySelector('.hero__title');
    const heroSub     = document.querySelector('.hero__subtitle');
    const heroActions = document.querySelector('.hero__actions');
    const heroStats   = document.querySelector('.hero__stats');

    if (!hero) return;

    // Add scroll hint
    const hint = document.createElement('div');
    hint.className = 'scroll-hint';
    hint.innerHTML = `
      <div class="scroll-hint__mouse"><div class="scroll-hint__dot"></div></div>
      <span>Scroll</span>
    `;
    hero.appendChild(hint);

    if (prefersReduced) return;

    // ── Hero background: scrub parallax ──
    if (heroBg) {
      gsap.to(heroBg, {
        yPercent: 28,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end:   'bottom top',
          scrub: true,
        },
      });
    }

    // ── Hero content: fade & lift on scroll-out ──
    if (heroContent) {
      gsap.to(heroContent, {
        yPercent: -10,
        opacity:  0,
        ease:     'none',
        scrollTrigger: {
          trigger: hero,
          start: '55% top',
          end:   'bottom top',
          scrub: 1,
        },
      });
    }

    // ── Title: word-by-word reveal ──
    if (heroTitle) {
      const tl = gsap.timeline({ delay: 0.15 });

      if (window.SplitType) {
        const split = new SplitType(heroTitle, { types: 'lines,words' });

        // Wrap each word in an overflow clip
        split.words.forEach(word => {
          const clip = document.createElement('span');
          clip.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;';
          word.parentNode.insertBefore(clip, word);
          clip.appendChild(word);
          word.style.display = 'inline-block';
        });

        tl.from(split.words, {
          yPercent:  105,
          opacity:   0,
          duration:  0.9,
          ease:      'power4.out',
          stagger:   0.045,
        });
      } else {
        tl.from(heroTitle, {
          y:       40,
          opacity: 0,
          duration: 0.9,
          ease:    'power4.out',
        });
      }

      // Subtitle, actions, stats cascade
      if (heroSub) {
        tl.from(heroSub, {
          y:       24,
          opacity: 0,
          duration: 0.7,
          ease:    'power3.out',
        }, '-=0.5');
      }
      if (heroActions) {
        tl.from(heroActions, {
          y:       20,
          opacity: 0,
          duration: 0.6,
          ease:    'power3.out',
        }, '-=0.45');
      }
      if (heroStats) {
        tl.from(heroStats.children, {
          y:       20,
          opacity: 0,
          duration: 0.5,
          ease:    'power3.out',
          stagger: 0.08,
        }, '-=0.4');
      }

      // Fade scroll hint after hero starts
      tl.to('.scroll-hint', { opacity: 0.6, duration: 0.5 }, '-=0.2');
    }

    // Fade scroll hint on first scroll
    if (lenis) {
      const fadeHint = () => {
        gsap.to('.scroll-hint', { opacity: 0, duration: 0.4, onComplete: () => {
          const h = document.querySelector('.scroll-hint');
          if (h) h.remove();
        }});
        lenis.off('scroll', fadeHint);
      };
      lenis.on('scroll', fadeHint);
    }
  }

  // ────────────────────────────────────────────────────────────
  // SECTION HEADERS
  // ────────────────────────────────────────────────────────────
  function initSectionHeaders() {
    gsap.utils.toArray('.section-header').forEach(el => {
      const eyebrow = el.querySelector('.eyebrow');
      const heading = el.querySelector('h2, h3');
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start:   'top 88%',
          toggleActions: 'play none none none',
        },
      });

      if (eyebrow) {
        tl.from(eyebrow, {
          x:       -24,
          opacity: 0,
          duration: 0.55,
          ease:    'power3.out',
        }, 0);
      }

      if (heading) {
        if (window.SplitType) {
          const split = new SplitType(heading, { types: 'lines' });
          split.lines.forEach(line => {
            const clip = document.createElement('span');
            clip.style.cssText = 'display:block;overflow:hidden;';
            line.parentNode.insertBefore(clip, line);
            clip.appendChild(line);
          });
          tl.from(split.lines, {
            y:       40,
            opacity: 0,
            duration: 0.75,
            ease:    'power3.out',
            stagger: 0.09,
          }, eyebrow ? 0.1 : 0);
        } else {
          tl.from(heading, {
            y:       30,
            opacity: 0,
            duration: 0.75,
            ease:    'power3.out',
          }, eyebrow ? 0.1 : 0);
        }
      }

      // Animate the blue rule line (::after)
      tl.from(el, {
        '--rule-scale': 0,
        duration: 0.6,
        ease: 'power3.out',
        onStart() {
          el.style.setProperty('--rule-scale', '0');
          el.style.cssText += `
            --rule-after-origin: left;
          `;
        },
        onComplete() {
          el.style.removeProperty('--rule-scale');
        },
      }, 0.2);

      // Simpler: use GSAP to scaleX the ::after via a proxy element
      // We'll use a CSS class-based approach since ::after isn't directly animatable
      tl.add(() => el.classList.add('is-visible'), 0.15);
    });
  }

  // ────────────────────────────────────────────────────────────
  // FEATURES GRID
  // ────────────────────────────────────────────────────────────
  function initFeatures() {
    const grid = document.querySelector('.features-grid');
    if (!grid) return;

    const features = grid.querySelectorAll('.feature');

    // Set initial state immediately (prevent flash of visible)
    gsap.set(features, { y: 60, opacity: 0 });

    gsap.to(features, {
      y:       0,
      opacity: 1,
      duration: 0.75,
      ease:    'power3.out',
      stagger: { each: 0.1, from: 'start' },
      scrollTrigger: {
        trigger: grid,
        start:   'top 82%',
        toggleActions: 'play none none none',
      },
      clearProps: 'transform,opacity',
    });

    // SVG stroke draw on icons (desktop only)
    if (!isMobile) {
      features.forEach(feature => {
        const paths = feature.querySelectorAll('.feature__icon svg path, .feature__icon svg rect, .feature__icon svg circle, .feature__icon svg polyline, .feature__icon svg line');
        if (!paths.length) return;

        // Calculate real length and set dasharray
        paths.forEach(p => {
          const len = p.getTotalLength ? p.getTotalLength() : 80;
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });

        gsap.to(paths, {
          strokeDashoffset: 0,
          duration: 1.0,
          ease: 'power2.inOut',
          stagger: 0.05,
          scrollTrigger: {
            trigger: feature,
            start:   'top 85%',
            toggleActions: 'play none none none',
          },
        });
      });
    }
  }

  // ────────────────────────────────────────────────────────────
  // GENERIC REVEALS
  // ────────────────────────────────────────────────────────────
  function initReveals() {
    gsap.utils.toArray('.reveal').forEach(el => {
      // Skip elements already handled by specific initializers
      if (el.classList.contains('section-header')) return;
      if (el.closest('.features-grid')) return;
      if (el.classList.contains('works-tabs')) return;

      gsap.from(el, {
        y:       30,
        opacity: 0,
        duration: 0.75,
        ease:    'power3.out',
        scrollTrigger: {
          trigger: el,
          start:   'top 87%',
          toggleActions: 'play none none none',
        },
        clearProps: 'transform,opacity',
      });
    });
  }

  // ────────────────────────────────────────────────────────────
  // GALLERY: clip-path cinematic reveal
  // ────────────────────────────────────────────────────────────
  function initGallery() {
    const grid = document.querySelector('.works-grid');
    if (!grid) return;

    // Initial visible items: clip-path reveal left to right
    const initialItems = Array.from(grid.querySelectorAll('.works-item:not(.is-hidden)'));

    // Set initial clip-path (all clipped)
    gsap.set(initialItems, { clipPath: 'inset(0 100% 0 0)' });

    ScrollTrigger.batch(initialItems, {
      onEnter: batch => {
        gsap.to(batch, {
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.8,
          ease:     'power3.inOut',
          stagger:  { each: 0.07 },
          clearProps: 'clipPath',
        });
      },
      start:  'top 94%',
      once:   true,
    });

    // When tab changes, animate new visible items
    // (main.js handles filter; we listen to a custom event or hook class changes)
    document.querySelectorAll('.works-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        // Small delay to let main.js remove is-hidden class first
        setTimeout(() => {
          const visible = Array.from(grid.querySelectorAll('.works-item:not(.is-hidden)'));
          gsap.from(visible, {
            clipPath: 'inset(0 100% 0 0)',
            duration: 0.6,
            ease:     'power3.inOut',
            stagger:  { each: 0.05 },
            clearProps: 'clipPath',
          });
        }, 50);
      });
    });
  }

  // ────────────────────────────────────────────────────────────
  // CATALOG: tab scene transitions
  // ────────────────────────────────────────────────────────────
  function initCatalogTransitions() {
    document.querySelectorAll('.catalog-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        if (prefersReduced) return;
        const panelId = tab.dataset.tab;
        const panel   = document.querySelector(`.catalog-panel[data-panel="${panelId}"]`);
        if (!panel) return;

        // Wait for main.js to activate the panel
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const cards = panel.querySelectorAll('.catalog-card');
            if (!cards.length) return;

            gsap.from(cards, {
              y:        28,
              opacity:  0,
              scale:    0.97,
              duration: 0.5,
              ease:     'power3.out',
              stagger:  0.04,
              clearProps: 'transform,opacity',
            });
          });
        });
      });
    });
  }

  // ────────────────────────────────────────────────────────────
  // MAGNETIC BUTTONS
  // ────────────────────────────────────────────────────────────
  function initMagneticButtons() {
    const targets = document.querySelectorAll(
      '.btn--primary, .btn--whatsapp, .btn--ghost, .navbar__cta'
    );

    targets.forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width  * 0.5) * 0.32;
        const y = (e.clientY - rect.top  - rect.height * 0.5) * 0.32;
        gsap.to(btn, {
          x, y,
          duration: 0.35,
          ease:     'power2.out',
          overwrite: 'auto',
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0, y: 0,
          duration: 0.7,
          ease:     'elastic.out(1, 0.4)',
          overwrite: 'auto',
        });
      });
    });
  }

  // ────────────────────────────────────────────────────────────
  // NAVBAR: scroll velocity compress
  // ────────────────────────────────────────────────────────────
  function initNavbarVelocity(lenis) {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastVelocity = 0;

    lenis.on('scroll', ({ velocity }) => {
      if (Math.abs(velocity) === Math.abs(lastVelocity)) return;
      lastVelocity = velocity;

      if (Math.abs(velocity) > 0.8) {
        gsap.to(navbar, {
          scaleY:          velocity > 0 ? 0.94 : 1,
          duration:        0.25,
          ease:            'power2.out',
          transformOrigin: 'top center',
          overwrite:       'auto',
        });
      } else if (Math.abs(velocity) < 0.15) {
        gsap.to(navbar, {
          scaleY:   1,
          duration: 0.6,
          ease:     'power3.out',
          overwrite: 'auto',
        });
      }
    });
  }

  // ────────────────────────────────────────────────────────────
  // PARALLAX DEPTH
  // ────────────────────────────────────────────────────────────
  function initParallax() {
    // Section intros/eyebrows: subtle upward drift
    gsap.utils.toArray('.eyebrow').forEach(el => {
      const section = el.closest('section');
      if (!section) return;
      gsap.to(el, {
        y:    -18,
        ease: 'none',
        scrollTrigger: {
          trigger:   section,
          start:     'top bottom',
          end:       'bottom top',
          scrub:     1.5,
        },
      });
    });

    // Contact map: parallax depth
    const map = document.querySelector('.contact-map');
    if (map) {
      gsap.to(map, {
        y:    -30,
        ease: 'none',
        scrollTrigger: {
          trigger:   map,
          start:     'top bottom',
          end:       'bottom top',
          scrub:     1,
        },
      });
    }
  }

})();
