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

  // Lenis drives the progress bar when active; fallback here
  if (progressBar && !window.__cinematicPending) {
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
            observer.unobserve(entry.target);
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

  if (heroBg && !window.__cinematicPending) {
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

  // ─── Features: dots indicadores de scroll ────────────────
  const featuresGrid = document.querySelector('.features-grid');
  const featuresDots = document.querySelectorAll('.features-dot');
  if (featuresGrid && featuresDots.length) {
    featuresGrid.addEventListener('scroll', () => {
      const cardWidth = featuresGrid.querySelector('.feature')?.offsetWidth || 1;
      const idx = Math.round(featuresGrid.scrollLeft / (cardWidth + 16));
      featuresDots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    }, { passive: true });
  }

  // ─── Works grid: filtrado + lightbox ─────────────────────
  const worksGrid   = document.getElementById('works-grid');
  const worksTabs   = document.querySelectorAll('.works-tab');
  const worksCount  = document.getElementById('works-count');
  const lightbox    = document.getElementById('lightbox');
  const lbImg       = document.getElementById('lightbox-img');
  const lbLabel     = document.getElementById('lightbox-label');
  const lbCounter   = document.getElementById('lightbox-counter');
  const lbClose     = document.getElementById('lightbox-close');
  const lbPrev      = document.getElementById('lightbox-prev');
  const lbNext      = document.getElementById('lightbox-next');

  if (worksGrid) {
    let allItems     = Array.from(worksGrid.querySelectorAll('.works-item'));
    let currentCat   = 'ventanas';
    let visibleItems = [];
    let lbIndex      = 0;

    function getVisible() {
      return allItems.filter(item => item.dataset.cat === currentCat);
    }

    function updateCount() {
      if (worksCount) {
        worksCount.textContent = `${visibleItems.length} ${visibleItems.length === 1 ? 'trabajo' : 'trabajos'}`;
      }
    }

    function filterCat(cat) {
      currentCat = cat;
      allItems.forEach(item => {
        item.classList.toggle('is-hidden', item.dataset.cat !== cat);
      });
      visibleItems = getVisible();
      updateCount();
    }

    // Sliding indicator for works tabs
    const worksTabsNav  = document.querySelector('.works-tabs__nav');
    const worksIndicator = document.querySelector('.works-tabs__indicator');

    function moveWorksIndicator(activeTab) {
      if (!worksIndicator || !worksTabsNav || !activeTab) return;
      const navRect = worksTabsNav.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      worksIndicator.style.left  = `${tabRect.left - navRect.left + worksTabsNav.scrollLeft}px`;
      worksIndicator.style.width = `${tabRect.width}px`;
    }

    // Tabs
    worksTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        worksTabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        moveWorksIndicator(tab);
        filterCat(tab.dataset.cat);
      });
    });

    // Lightbox open
    allItems.forEach(item => {
      item.addEventListener('click', () => {
        if (item.classList.contains('is-hidden')) return;
        visibleItems = getVisible();
        lbIndex = visibleItems.indexOf(item);
        openLightbox();
      });
    });

    function openLightbox() {
      const item = visibleItems[lbIndex];
      const img  = item.querySelector('.works-item__img');
      lbImg.src  = img.src;
      lbImg.alt  = img.alt;
      lbLabel.textContent   = item.querySelector('.works-item__label').textContent;
      lbCounter.textContent = `${lbIndex + 1} / ${visibleItems.length}`;
      lightbox.hidden = false;
      document.documentElement.style.overflow = 'hidden';
      requestAnimationFrame(() => lightbox.style.opacity = '1');
    }

    function closeLightbox() {
      lightbox.style.opacity = '0';
      setTimeout(() => {
        lightbox.hidden = true;
        document.documentElement.style.overflow = '';
      }, 250);
    }

    function lbGoTo(index) {
      lbIndex = (index + visibleItems.length) % visibleItems.length;
      const item = visibleItems[lbIndex];
      // Immediately clear old image so nothing shows while loading
      lbImg.src = '';
      lbImg.style.opacity = '0';
      lbLabel.textContent   = item.querySelector('.works-item__label').textContent;
      lbCounter.textContent = `${lbIndex + 1} / ${visibleItems.length}`;
      const newSrc = item.querySelector('.works-item__img').src;
      const tmp = new Image();
      tmp.onload = () => { lbImg.src = newSrc; lbImg.alt = item.querySelector('.works-item__img').alt; lbImg.style.opacity = '1'; };
      tmp.src = newSrc;
    }

    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lbPrev)  lbPrev.addEventListener('click', () => lbGoTo(lbIndex - 1));
    if (lbNext)  lbNext.addEventListener('click', () => lbGoTo(lbIndex + 1));

    lightbox?.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (lightbox?.hidden) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  lbGoTo(lbIndex - 1);
      if (e.key === 'ArrowRight') lbGoTo(lbIndex + 1);
    });

    // Touch swipe en lightbox
    let touchStartX = 0;
    lightbox?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    lightbox?.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) lbGoTo(lbIndex + (diff > 0 ? 1 : -1));
    }, { passive: true });

    // Init
    filterCat('ventanas');
    requestAnimationFrame(() => {
      const initActive = document.querySelector('.works-tab.is-active');
      moveWorksIndicator(initActive);
    });
  }

  // ─── Catalog tabs + sliding indicator ────────────────────
  const catalogTabsNav   = document.querySelector('.catalog-tabs__nav');
  const catalogIndicator = document.querySelector('.catalog-tabs__indicator');

  function moveCatalogIndicator(activeTab) {
    if (!catalogIndicator || !catalogTabsNav || !activeTab) return;
    const navRect = catalogTabsNav.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    catalogIndicator.style.left  = `${tabRect.left - navRect.left + catalogTabsNav.scrollLeft}px`;
    catalogIndicator.style.width = `${tabRect.width}px`;
  }

  document.querySelectorAll('.catalog-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.catalog-tab').forEach(t => t.classList.remove('is-active'));
      document.querySelectorAll('.catalog-panel').forEach(p => p.classList.remove('is-active'));
      tab.classList.add('is-active');
      document.querySelector(`.catalog-panel[data-panel="${target}"]`).classList.add('is-active');
      moveCatalogIndicator(tab);
    });
  });

  requestAnimationFrame(() => {
    moveCatalogIndicator(document.querySelector('.catalog-tab.is-active'));
  });

  // ─── Poliestireno Fantasía toggle ────────────────────────
  const fantasiaCard = document.querySelector('.fantasia-card');
  if (fantasiaCard) {
    const toggle = () => {
      const wrap = fantasiaCard.closest('.fantasia-wrap');
      const isOpen = wrap.classList.toggle('is-open');
      fantasiaCard.setAttribute('aria-expanded', isOpen);
      wrap.querySelector('.fantasia-grid').setAttribute('aria-hidden', !isOpen);
    };
    fantasiaCard.addEventListener('click', toggle);
    fantasiaCard.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  }

  // ─── Formulario: envío al endpoint propio (enviar.php) ────
  const contactForm = document.querySelector('.contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Loading state
      const submitBtn = contactForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('btn--loading');
        submitBtn.textContent = 'Enviando…';
      }

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(contactForm)
        });
        const data = await response.json();
        if (data.success) {
          window.location.href = 'gracias.html';
        } else {
          throw new Error(data.message);
        }
      } catch {
        alert('Hubo un error al enviar. Por favor escribinos por WhatsApp.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('btn--loading');
          submitBtn.textContent = 'Enviar consulta';
        }
      }
    });
  }

  // ─── Catalog card grid + inline detail expand ────────────
  document.querySelectorAll('.catalog-card-grid').forEach(grid => {
    const detail = grid.nextElementSibling; // .catalog-inline-detail
    if (!detail || !detail.classList.contains('catalog-inline-detail')) return;

    const detailImg  = detail.querySelector('.catalog-inline-detail__img');
    const detailTag  = detail.querySelector('.catalog-inline-detail__tag');
    const detailName = detail.querySelector('.catalog-inline-detail__name');
    const detailDesc = detail.querySelector('.catalog-inline-detail__desc');

    let activeCard = null;

    grid.querySelectorAll('.catalog-card').forEach(card => {
      card.addEventListener('click', () => {
        // Toggle off if same card clicked again
        if (activeCard === card) {
          activeCard = null;
          card.classList.remove('is-active');
          detail.classList.remove('is-open');
          return;
        }

        // Update active card
        grid.querySelectorAll('.catalog-card').forEach(c => c.classList.remove('is-active'));
        card.classList.add('is-active');
        activeCard = card;

        // Populate detail
        if (detailImg)  { detailImg.src = card.dataset.img || ''; detailImg.alt = card.dataset.label || ''; }
        if (detailTag)  detailTag.textContent  = card.dataset.label || '';
        if (detailName) detailName.textContent = card.dataset.name  || '';
        if (detailDesc) detailDesc.textContent = card.dataset.desc  || '';

        // Open with animation then scroll into view
        detail.classList.add('is-open');
        // Wait for grid-template-rows expansion before scrolling
        setTimeout(() => {
          detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 120);
      });
    });
  });

  // ─── Smooth anchor links ──────────────────────────────────
  // Lenis handles this when cinematic.js is active
  if (!window.__cinematicPending) {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const offset = 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  // ─── Info-card toggle (colores / terminaciones) ───────────
  document.querySelectorAll('.info-card__toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.info-card');
      if (!card) return;
      const isOpen = card.classList.toggle('is-open');
      btn.setAttribute('aria-label', isOpen ? 'Cerrar descripción' : 'Ver descripción');
    });
  });

  // ─── GA4 + source tracking para links de WhatsApp ─────────
  document.querySelectorAll('a[href^="https://wa.me"]').forEach(el => {
    el.addEventListener('click', () => {
      const section = el.closest('section')?.id
        || (el.closest('nav') ? 'navbar' : null)
        || (el.closest('.mobile-bar') ? 'mobile-bar' : null)
        || (el.closest('.lightbox') ? 'lightbox' : null)
        || (el.closest('.whatsapp-float') ? 'float-button' : null)
        || 'other';

      if (typeof gtag !== 'undefined') {
        gtag('event', 'whatsapp_click', {
          event_category: 'Contact',
          event_label: section
        });
      }

      // Append source section to the WhatsApp message
      try {
        const url = new URL(el.href);
        const base = url.searchParams.get('text') || '';
        if (base && !base.includes('[desde:')) {
          url.searchParams.set('text', `${base}\n[desde: ${section} — alumfer.com.ar]`);
          el.href = url.toString();
        }
      } catch (_) {}
    });
  });

  // ─── GA4: tracking de click en teléfono ──────────────────
  document.querySelectorAll('a[href^="tel:"]').forEach(el => {
    el.addEventListener('click', () => {
      if (typeof gtag === 'undefined') return;
      gtag('event', 'phone_click', {
        event_category: 'Contact',
        event_label: 'tel_link'
      });
    });
  });

});
