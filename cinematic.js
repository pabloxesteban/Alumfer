// ============================================================
// ALUMFER — Cinematic Engine
// Lenis + GSAP · Solo hero, interacciones y tab-transitions
// Los reveals generales los maneja el IntersectionObserver de main.js
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

      const progressBar = document.querySelector('.scroll-progress');
      if (progressBar) {
        lenis.on('scroll', ({ progress }) => {
          progressBar.style.transform = `scaleX(${progress})`;
        });
      }

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

    // ── 2. Hero entrance (sobre el fold, seguro) ─────────────
    if (!prefersReduced) initHero();

    // ── 3. Hero background parallax ──────────────────────────
    if (!prefersReduced) initHeroParallax();

    // ── 4. Gallery: animación al cambiar tab ─────────────────
    initGalleryTabAnimation();

    // ── 5. Catalog: animación al cambiar categoría ───────────
    initCatalogTransitions();

    // ── 6. Magnetic buttons (solo desktop) ───────────────────
    if (!hasTouch && !isMobile && !prefersReduced) initMagneticButtons();
  }

  // ────────────────────────────────────────────────────────────
  // HERO ENTRANCE — título palabra por palabra
  // ────────────────────────────────────────────────────────────
  function initHero() {
    const heroTitle   = document.querySelector('.hero__title');
    const heroSub     = document.querySelector('.hero__subtitle');
    const heroActions = document.querySelector('.hero__actions');
    const heroStats   = document.querySelector('.hero__stats');

    if (!heroTitle) return;

    const tl = gsap.timeline({ delay: 0.1 });

    if (window.SplitType) {
      const split = new SplitType(heroTitle, { types: 'lines,words' });

      split.words.forEach(word => {
        const clip = document.createElement('span');
        clip.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;';
        word.parentNode.insertBefore(clip, word);
        clip.appendChild(word);
      });

      tl.from(split.words, {
        yPercent:   110,
        duration:   0.85,
        ease:       'power4.out',
        stagger:    0.04,
        clearProps: 'transform',
      });
    } else {
      tl.from(heroTitle, {
        y: 36, opacity: 0, duration: 0.85, ease: 'power4.out',
        clearProps: 'all',
      });
    }

    if (heroSub) {
      tl.from(heroSub, {
        y: 18, opacity: 0, duration: 0.6, ease: 'power3.out',
        clearProps: 'all',
      }, '-=0.5');
    }
    if (heroActions) {
      tl.from(heroActions, {
        y: 14, opacity: 0, duration: 0.5, ease: 'power3.out',
        clearProps: 'all',
      }, '-=0.42');
    }
    if (heroStats) {
      tl.from(Array.from(heroStats.children), {
        y: 12, opacity: 0, duration: 0.45, ease: 'power3.out',
        stagger: 0.06, clearProps: 'all',
      }, '-=0.38');
    }
  }

  // ────────────────────────────────────────────────────────────
  // HERO PARALLAX — fondo scrub
  // ────────────────────────────────────────────────────────────
  function initHeroParallax() {
    const heroBg = document.querySelector('.hero__bg');
    const hero   = document.querySelector('.hero');
    if (!heroBg || !hero) return;

    gsap.to(heroBg, {
      yPercent: 28,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start:   'top top',
        end:     'bottom top',
        scrub:   true,
      },
    });
  }

  // ────────────────────────────────────────────────────────────
  // GALLERY TAB ANIMATION — clip-path al filtrar
  // ────────────────────────────────────────────────────────────
  function initGalleryTabAnimation() {
    const grid = document.querySelector('.works-grid');
    if (!grid || prefersReduced) return;

    document.querySelectorAll('.works-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        setTimeout(() => {
          const visible = Array.from(grid.querySelectorAll('.works-item:not(.is-hidden)'));
          if (!visible.length) return;
          gsap.fromTo(visible,
            { clipPath: 'inset(0 100% 0 0)' },
            {
              clipPath:   'inset(0 0% 0 0)',
              duration:   0.6,
              ease:       'power3.inOut',
              stagger:    0.05,
              clearProps: 'clipPath',
            }
          );
        }, 60);
      });
    });
  }

  // ────────────────────────────────────────────────────────────
  // CATALOG TAB TRANSITIONS
  // ────────────────────────────────────────────────────────────
  function initCatalogTransitions() {
    if (prefersReduced) return;

    document.querySelectorAll('.catalog-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const panelId = tab.dataset.tab;
        const panel   = document.querySelector(`.catalog-panel[data-panel="${panelId}"]`);
        if (!panel) return;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const cards = panel.querySelectorAll('.catalog-card, .product-row');
            if (!cards.length) return;
            gsap.fromTo(cards,
              { y: 20, opacity: 0 },
              {
                y: 0, opacity: 1,
                duration: 0.4,
                ease:     'power3.out',
                stagger:  0.04,
                clearProps: 'all',
              }
            );
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
