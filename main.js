// ============================================================
// ALUMFER — main.js
// Interacciones: navbar scroll, reveal, contador, parallax, nav mobile
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ─── Navbar: cambio de estado al scrollear ────────────────
  const navbar = document.querySelector('.navbar');

  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 60) {
        navbar.classList.add('navbar--scrolled');
        navbar.classList.remove('navbar--transparent');
      } else {
        navbar.classList.remove('navbar--scrolled');
        navbar.classList.add('navbar--transparent');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // estado inicial
  }

  // ─── Barra de progreso de scroll ─────────────────────────
  const progressBar = document.querySelector('.scroll-progress');

  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const total    = document.body.scrollHeight - window.innerHeight;
      progressBar.style.transform = `scaleX(${scrolled / total})`;
    }, { passive: true });
  }

  // ─── Reveal al entrar en viewport ────────────────────────
  const revealEls = document.querySelectorAll('.reveal, .section-header');

  if (revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // solo una vez
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(el => observer.observe(el));
  }

  // ─── Contador animado de cifras ───────────────────────────
  // Uso: <span class="count-up" data-target="500" data-suffix="+">0</span>
  const counters = document.querySelectorAll('.count-up');

  if (counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el     = entry.target;
          const target = parseInt(el.dataset.target, 10) || 0;
          const suffix = el.dataset.suffix || '';
          const duration = 1400;
          const start  = performance.now();

          const update = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(update);
          };

          requestAnimationFrame(update);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(el => counterObserver.observe(el));
  }

  // ─── Parallax suave en el hero ────────────────────────────
  const heroBg = document.querySelector('.hero__bg');

  if (heroBg) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY * 0.28;
      heroBg.style.transform = `translateY(${y}px)`;
    }, { passive: true });
  }

  // ─── Menú mobile ─────────────────────────────────────────
  const menuBtn  = document.querySelector('.navbar__menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuBtn && mobileNav) {
    let isOpen = false;

    const toggleMenu = () => {
      isOpen = !isOpen;
      mobileNav.classList.toggle('is-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';

      // Animación de las barras del hamburger
      const bars = menuBtn.querySelectorAll('span');
      if (isOpen) {
        bars[0].style.transform = 'translateY(6.5px) rotate(45deg)';
        bars[1].style.opacity   = '0';
        bars[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
      } else {
        bars[0].style.transform = '';
        bars[1].style.opacity   = '';
        bars[2].style.transform = '';
      }
    };

    menuBtn.addEventListener('click', toggleMenu);

    const closeBtn = mobileNav.querySelector('.mobile-nav__close');
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);

    // Cerrar al hacer click en un link del menú
    mobileNav.querySelectorAll('.mobile-nav__link').forEach(link => {
      link.addEventListener('click', () => {
        if (isOpen) toggleMenu();
      });
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) toggleMenu();
    });
  }

  // ─── Works carousel ───────────────────────────────────────
  const track      = document.getElementById('carousel-track');
  const dotsWrap   = document.getElementById('carousel-dots');
  const worksTabs  = document.querySelectorAll('.works-tab');

  if (track) {
    let allSlides = Array.from(track.querySelectorAll('.carousel__slide'));
    let visibleSlides = allSlides;
    let current = 0;

    function buildDots() {
      dotsWrap.innerHTML = '';
      visibleSlides.forEach((_, i) => {
        const d = document.createElement('button');
        d.className = 'carousel__dot' + (i === current ? ' is-active' : '');
        d.setAttribute('aria-label', `Slide ${i + 1}`);
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
      });
    }

    const isMobile = () => window.innerWidth <= 768;

    function goTo(index) {
      current = (index + visibleSlides.length) % visibleSlides.length;
      if (isMobile()) {
        visibleSlides[current].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      } else {
        const offset = visibleSlides[current].offsetLeft;
        track.style.transform = `translateX(-${offset}px)`;
      }
      dotsWrap.querySelectorAll('.carousel__dot').forEach((d, i) =>
        d.classList.toggle('is-active', i === current)
      );
    }

    function filterCat(cat) {
      current = 0;
      allSlides.forEach(s => {
        const show = s.dataset.cat === cat;
        s.style.display = show ? 'block' : 'none';
      });
      if (isMobile()) {
        track.scrollLeft = 0;
        visibleSlides = allSlides.filter(s => s.dataset.cat === cat);
        buildDots();
      } else {
        track.style.transition = 'none';
        track.style.transform = 'translateX(0)';
        requestAnimationFrame(() => {
          track.style.transition = '';
          visibleSlides = allSlides.filter(s => s.dataset.cat === cat);
          buildDots();
        });
      }
    }

    document.querySelector('.carousel__btn--prev')
      .addEventListener('click', () => goTo(current - 1));
    document.querySelector('.carousel__btn--next')
      .addEventListener('click', () => goTo(current + 1));

    worksTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        worksTabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        filterCat(tab.dataset.cat);
      });
    });

    // Sincroniza dots con swipe nativo en mobile
    track.addEventListener('scroll', () => {
      if (!isMobile()) return;
      const slideWidth = track.clientWidth;
      const newIndex = Math.round(track.scrollLeft / slideWidth);
      if (newIndex !== current && newIndex < visibleSlides.length) {
        current = newIndex;
        dotsWrap.querySelectorAll('.carousel__dot').forEach((d, i) =>
          d.classList.toggle('is-active', i === current)
        );
      }
    }, { passive: true });

    // init
    filterCat('ventanas');
  }

  // ─── Catalog tabs ─────────────────────────────────────────
  document.querySelectorAll('.catalog-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.catalog-tab').forEach(t => t.classList.remove('is-active'));
      document.querySelectorAll('.catalog-panel').forEach(p => p.classList.remove('is-active'));
      tab.classList.add('is-active');
      document.querySelector(`.catalog-panel[data-panel="${target}"]`).classList.add('is-active');
    });
  });

  // ─── Smooth anchor links ──────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 72; // altura del navbar
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

});
