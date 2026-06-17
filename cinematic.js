// ============================================================
// ALUMFER — Cinematic Engine
// Lenis + GSAP ScrollTrigger + SplitType
// ============================================================

window.__cinematicPending = true;

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile       = window.matchMedia('(max-width: 768px)').matches;
  const hasTouch       = window.matchMedia('(hover: none)').matches;

  if (!window.gsap || !window.ScrollTrigger) {
    window.__cinematicPending = false;
    return;
  }

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('cinematic');

    // ── 1. Lenis smooth scroll ───────────────────────────────
    let lenis = null;
    if (!prefersReduced && window.Lenis) {
      lenis = new Lenis({
        duration:        1.2,
        easing:          t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel:     true,
        smoothTouch:     false,
        wheelMultiplier: 1.0,
        touchMultiplier: 2.0,
      });

      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      lenis.on('scroll', ScrollTrigger.update);

      // Scroll progress bar
      const progressBar = document.querySelector('.scroll-progress');
      if (progressBar) {
        lenis.on('scroll', ({ progress }) => {
          progressBar.style.transform = `scaleX(${progress})`;
        });
      }

      // Anchor links via Lenis
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

    // ── 2. Hero ──────────────────────────────────────────────
    initHero(lenis);

    // ── 3. Section headers ───────────────────────────────────
    if (!prefersReduced) initSectionHeaders();

    // ── 4. Features ──────────────────────────────────────────
    if (!prefersReduced) initFeatures();

    // ── 5. Generic reveals ───────────────────────────────────
    if (!prefersReduced) initReveals();

    // ── 6. Gallery ───────────────────────────────────────────
    if (!prefersReduced) initGallery();

    // ── 7. Catalog tab transitions ───────────────────────────
    initCatalogTransitions();

    // ── 8. Magnetic buttons ──────────────────────────────────
    if (!hasTouch && !isMobile && !prefersReduced) initMagneticButtons();
  }

  // ────────────────────────────────────────────────────────────
  // HERO
  // ────────────────────────────────────────────────────────────
  function initHero(lenis) {
    const hero        = document.querySelector('.hero');
    const heroBg      = document.querySelector('.hero__bg');
    const heroTitle   = document.querySelector('.hero__title');
    const heroSub     = document.querySelector('.hero__subtitle');
    const heroActions = document.querySelector('.hero__actions');
    const heroStats   = document.querySelector('.hero__stats');

    if (!hero || prefersReduced) return;

    // Background parallax scrub
    if (heroBg) {
      gsap.to(heroBg, {
        yPercent: 28,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
    }

    // Title word-by-word entrance (GSAP from — no pre-hide)
    if (heroTitle) {
      const tl = gsap.timeline({ delay: 0.15 });

      if (window.SplitType) {
        const split = new SplitType(heroTitle, { types: 'lines,words' });
        // Each word clips upward from its own overflow container
        split.words.forEach(word => {
          const clip = document.createElement('span');
          clip.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;';
          word.parentNode.insertBefore(clip, word);
          clip.appendChild(word);
        });
        tl.from(split.words, {
          yPercent:  110,
          duration:  0.9,
          ease:      'power4.out',
          stagger:   0.04,
          clearProps: 'transform',
        });
      } else {
        tl.from(heroTitle, {
          y: 40, opacity: 0, duration: 0.9, ease: 'power4.out',
          clearProps: 'all',
        });
      }

      if (heroSub) {
        tl.from(heroSub, {
          y: 20, opacity: 0, duration: 0.65, ease: 'power3.out',
          clearProps: 'all',
        }, '-=0.5');
      }
      if (heroActions) {
        tl.from(heroActions, {
          y: 16, opacity: 0, duration: 0.55, ease: 'power3.out',
          clearProps: 'all',
        }, '-=0.45');
      }
      if (heroStats) {
        tl.from(Array.from(heroStats.children), {
          y: 14, opacity: 0, duration: 0.5, ease: 'power3.out',
          stagger: 0.07, clearProps: 'all',
        }, '-=0.4');
      }
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
          start: 'top 88%',
          toggleActions: 'play none none none',
          once: true,
        },
        onComplete() {
          // Ensure is-visible is set for CSS ::after rule animation
          el.classList.add('is-visible');
        },
      });

      if (eyebrow) {
        tl.from(eyebrow, {
          x: -20, opacity: 0, duration: 0.5, ease: 'power3.out',
          clearProps: 'all',
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
            y: 36, opacity: 0, duration: 0.7, ease: 'power3.out',
            stagger: 0.08, clearProps: 'all',
          }, eyebrow ? 0.08 : 0);
        } else {
          tl.from(heading, {
            y: 28, opacity: 0, duration: 0.7, ease: 'power3.out',
            clearProps: 'all',
          }, eyebrow ? 0.08 : 0);
        }
      }
    });
  }

  // ────────────────────────────────────────────────────────────
  // FEATURES
  // ────────────────────────────────────────────────────────────
  function initFeatures() {
    const grid = document.querySelector('.features-grid');
    if (!grid) return;

    gsap.from(grid.querySelectorAll('.feature'), {
      y: 50, opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.1,
      clearProps: 'all',
      scrollTrigger: {
        trigger: grid,
        start: 'top 82%',
        toggleActions: 'play none none none',
        once: true,
      },
    });
  }

  // ────────────────────────────────────────────────────────────
  // GENERIC REVEALS
  // ────────────────────────────────────────────────────────────
  function initReveals() {
    gsap.utils.toArray('.reveal').forEach(el => {
      if (el.classList.contains('section-header')) return;
      if (el.closest('.features-grid')) return;
      if (el.classList.contains('works-tabs')) return;

      gsap.from(el, {
        y: 28, opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: el,
          start: 'top 87%',
          toggleActions: 'play none none none',
          once: true,
        },
      });
    });
  }

  // ────────────────────────────────────────────────────────────
  // GALLERY — clip-path reveal
  // ────────────────────────────────────────────────────────────
  function initGallery() {
    const grid = document.querySelector('.works-grid');
    if (!grid) return;

    // Animate items as they enter viewport — from() so no pre-hide
    ScrollTrigger.batch(grid.querySelectorAll('.works-item:not(.is-hidden)'), {
      onEnter: batch => {
        gsap.from(batch, {
          clipPath: 'inset(0 100% 0 0)',
          duration: 0.75,
          ease:     'power3.inOut',
          stagger:  0.06,
          clearProps: 'clipPath',
        });
      },
      start: 'top 95%',
      once:  true,
    });

    // After tab filter, animate newly visible items
    document.querySelectorAll('.works-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        setTimeout(() => {
          const visible = grid.querySelectorAll('.works-item:not(.is-hidden)');
          gsap.from(visible, {
            clipPath: 'inset(0 100% 0 0)',
            duration: 0.6,
            ease:     'power3.inOut',
            stagger:  0.05,
            clearProps: 'clipPath',
          });
        }, 60);
      });
    });
  }

  // ────────────────────────────────────────────────────────────
  // CATALOG TAB TRANSITIONS
  // ────────────────────────────────────────────────────────────
  function initCatalogTransitions() {
    document.querySelectorAll('.catalog-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        if (prefersReduced) return;
        const panelId = tab.dataset.tab;
        const panel   = document.querySelector(`.catalog-panel[data-panel="${panelId}"]`);
        if (!panel) return;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const cards = panel.querySelectorAll('.catalog-card');
            if (!cards.length) return;
            gsap.from(cards, {
              y: 24, opacity: 0, scale: 0.97,
              duration: 0.45,
              ease: 'power3.out',
              stagger: 0.04,
              clearProps: 'all',
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
    document.querySelectorAll('.btn--primary, .btn--whatsapp, .btn--ghost, .navbar__cta').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width  * 0.5) * 0.3;
        const y = (e.clientY - r.top  - r.height * 0.5) * 0.3;
        gsap.to(btn, { x, y, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
      });
    });
  }

})();
