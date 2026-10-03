// ============================================================
// ALUMFER — home.js
// Interacciones de la home: navegación, revelado, tira de obras,
// proceso, galería + lightbox, líneas, configurador, formulario
// y medición GA4. Sin librerías.
// ============================================================

(() => {
  'use strict';
  const doc = document.documentElement;
  doc.classList.remove('no-js');

  const WA_NUMBER = '5491163368643';
  const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ─── Navegación ─────────────────────────────────────────
  const nav = $('.nav');
  const onScroll = () => nav && nav.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('.nav__burger');
  const drawer = $('.drawer');
  const setDrawer = (open) => {
    if (!burger || !drawer) return;
    burger.setAttribute('aria-expanded', String(open));
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger?.addEventListener('click', () => setDrawer(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', drawer || document.createElement('div')).forEach(a => a.addEventListener('click', () => setDrawer(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });

  // ─── Revelado al entrar en pantalla ─────────────────────
  const revealEls = $$('.rv, .rv-img');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-in'));
  }

  // ─── Tira de obras: duplicar para el loop continuo ──────
  const track = $('.reel__track');
  if (track && !reduceMotion) {
    $$('.print', track).forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }

  // ─── Proceso: pasos con panel visual ────────────────────
  const process = $('.process');
  if (process) {
    const steps  = $$('.step', process);
    const panels = $$('.stage__panel', process);
    const STEP_MS = 6000;
    process.style.setProperty('--step-ms', `${STEP_MS}ms`);
    let current = 0;
    let timer = null;
    let inView = false;

    const show = (i) => {
      current = (i + steps.length) % steps.length;
      steps.forEach((s, n) => {
        const on = n === current;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-selected', String(on));
        // reinicia la barra de progreso
        const bar = $('.step__bar i', s);
        if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
      });
      panels.forEach((p, n) => p.classList.toggle('is-active', n === current));
    };
    const stop  = () => { clearInterval(timer); timer = null; };
    const start = () => {
      if (reduceMotion || timer || !inView || process.classList.contains('is-paused')) return;
      timer = setInterval(() => show(current + 1), STEP_MS);
    };

    steps.forEach((s, n) => s.addEventListener('click', () => {
      show(n);
      // si el usuario eligió un paso, dejamos de avanzar solos
      process.classList.add('is-paused');
      stop();
    }));
    process.addEventListener('mouseenter', () => { stop(); process.classList.add('is-paused'); });
    process.addEventListener('mouseleave', () => { process.classList.remove('is-paused'); start(); });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView) { show(current); start(); } else stop();
      }, { threshold: 0.35 }).observe(process);
    }
    show(0);
  }

  // ─── Galería: filtros, "ver más" y lightbox ─────────────
  const archive = $('.archive');
  if (archive) {
    const items   = $$('.archive__item', archive);
    const filters = $$('.filter');
    const moreBtn = $('#works-more');
    const waBtn   = $('#works-wa');
    const PAGE = 12;
    let cat = 'todos';
    let limit = PAGE;

    const WA_BY_CAT = {
      ventanas:    'Hola, quiero consultar por ventanas de aluminio',
      puertas:     'Hola, quiero consultar por puertas de aluminio',
      postigones:  'Hola, quiero consultar por postigones de aluminio',
      quinchos:    'Hola, quiero consultar por cerramiento de quincho o galería',
      techos:      'Hola, quiero consultar por techo de policarbonato',
      portones:    'Hola, quiero consultar por portones de aluminio',
      mosquiteros: 'Hola, quiero consultar por mosquiteros a medida',
    };

    const matching = () => items.filter(it => cat === 'todos' || it.dataset.cat === cat);
    const visible  = () => items.filter(it => !it.hidden);

    const render = () => {
      const list = matching();
      items.forEach(it => { it.hidden = true; });
      list.slice(0, limit).forEach(it => { it.hidden = false; });
      if (moreBtn) {
        const rest = list.length - limit;
        moreBtn.hidden = rest <= 0;
        moreBtn.querySelector('span').textContent = `Ver ${Math.min(rest, PAGE)} más`;
      }
      if (waBtn) waBtn.href = waLink(WA_BY_CAT[cat] || 'Hola, quiero pedir un presupuesto');
    };

    filters.forEach(f => f.addEventListener('click', () => {
      filters.forEach(x => x.setAttribute('aria-selected', String(x === f)));
      cat = f.dataset.cat;
      limit = PAGE;
      render();
    }));
    moreBtn?.addEventListener('click', () => { limit += PAGE; render(); });
    render();

    // Lightbox
    const lb      = $('#lightbox');
    const lbImg   = $('#lightbox-img');
    const lbLabel = $('#lightbox-label');
    const lbCount = $('#lightbox-counter');
    let lbList = [];
    let lbIdx = 0;
    let lastFocus = null;

    const paint = () => {
      const it = lbList[lbIdx];
      const img = $('img', it);
      lbImg.style.opacity = '0';
      const src = img.currentSrc || img.src;
      const tmp = new Image();
      tmp.onload = () => { lbImg.src = src; lbImg.alt = img.alt; lbImg.style.opacity = '1'; };
      tmp.src = src;
      lbLabel.textContent = it.dataset.label || '';
      lbCount.textContent = `${lbIdx + 1} / ${lbList.length}`;
    };
    const open = (it) => {
      lbList = visible();
      lbIdx = Math.max(0, lbList.indexOf(it));
      lastFocus = document.activeElement;
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => lb.classList.add('is-open'));
      paint();
      $('.lightbox__close', lb).focus();
    };
    const close = () => {
      lb.classList.remove('is-open');
      setTimeout(() => { lb.hidden = true; document.body.style.overflow = ''; lastFocus?.focus(); }, 200);
    };
    const go = (d) => { lbIdx = (lbIdx + d + lbList.length) % lbList.length; paint(); };

    items.forEach(it => it.addEventListener('click', () => open(it)));
    $('.lightbox__close', lb)?.addEventListener('click', close);
    $('.lightbox__btn--prev', lb)?.addEventListener('click', () => go(-1));
    $('.lightbox__btn--next', lb)?.addEventListener('click', () => go(1));
    lb?.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lightbox__stage')) close(); });
    document.addEventListener('keydown', (e) => {
      if (!lb || lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    });
    let x0 = 0;
    lb?.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lb?.addEventListener('touchend', (e) => {
      const dx = x0 - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 50) go(dx > 0 ? 1 : -1);
    }, { passive: true });
  }

  // ─── Líneas: selector ───────────────────────────────────
  const lineTabs = $$('.line-tab');
  lineTabs.forEach(tab => tab.addEventListener('click', () => {
    lineTabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
  }));
  // Flechas para moverse entre pestañas (patrón ARIA de tabs)
  $$('[role="tablist"]').forEach(list => list.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
    const tabs = $$('[role="tab"]', list);
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    const next = tabs[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + tabs.length) % tabs.length];
    next.focus();
    next.click();
  }));

  // ─── Configurador: vidrio + color ───────────────────────
  const win = $('.window');
  if (win) {
    const glassOpts  = $$('.glass-opt');
    const swatches   = $$('.swatch');
    const glassName  = $('#glass-name');
    const glassDesc  = $('#glass-desc');
    const colorName  = $('#color-name');
    const colorDesc  = $('#color-desc');
    const capGlass   = $('#cap-glass');
    const capColor   = $('#cap-color');
    const cta        = $('#config-wa');
    let glass = glassOpts.find(o => o.getAttribute('aria-checked') === 'true');
    let color = swatches.find(o => o.getAttribute('aria-checked') === 'true');

    const update = () => {
      win.dataset.glass = glass.dataset.glass;
      win.style.setProperty('--frame', color.dataset.frame);
      win.style.setProperty('--frame-solid', color.dataset.solid);
      glassName.textContent = glass.dataset.name;
      glassDesc.textContent = glass.dataset.desc;
      colorName.textContent = `${color.dataset.group} · ${color.dataset.name}`;
      colorDesc.textContent = color.dataset.desc;
      capGlass.textContent = glass.dataset.name;
      capColor.textContent = color.dataset.name;
      // las siglas (DVH) quedan en mayúscula
      const lc = (t) => (t === t.toUpperCase() ? t : t.toLowerCase());
      cta.href = waLink(`Hola, quiero un presupuesto de una abertura con vidrio ${lc(glass.dataset.name)} y color ${lc(color.dataset.name)} (${lc(color.dataset.group)}).`);
    };
    const pick = (list, el) => {
      list.forEach(o => { o.setAttribute('aria-checked', String(o === el)); o.tabIndex = o === el ? 0 : -1; });
      return el;
    };
    glassOpts.forEach(o => o.addEventListener('click', () => { glass = pick(glassOpts, o); update(); }));
    swatches.forEach(o => o.addEventListener('click', () => { color = pick(swatches, o); update(); }));
    // Flechas dentro de cada grupo de radios
    $$('[role="radiogroup"]').forEach(group => group.addEventListener('keydown', (e) => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
      const opts = $$('[role="radio"]', group.closest('.ctrl') || group);
      const i = opts.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      const next = opts[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length];
      next.focus();
      next.click();
    }));
    update();
  }

  // ─── Formulario → enviar.php ────────────────────────────
  const form = $('#form-cotizacion');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('[type="submit"]', form);
    const label = btn.textContent;
    btn.classList.add('is-loading');
    btn.textContent = 'Enviando…';
    try {
      const res = await fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'error');
      window.location.href = '/gracias.html';
    } catch (_) {
      btn.classList.remove('is-loading');
      btn.textContent = label;
      alert('No pudimos enviar la consulta. Escribinos por WhatsApp al (011) 6336-8643.');
    }
  });

  // ─── GA4: WhatsApp (con sección de origen) y teléfono ───
  $$('a[href^="https://wa.me"]').forEach(el => el.addEventListener('click', () => {
    const section = el.closest('section')?.id
      || (el.closest('.nav, .drawer') ? 'navbar' : null)
      || (el.closest('.mbar') ? 'mobile-bar' : null)
      || (el.closest('.lightbox') ? 'lightbox' : null)
      || (el.classList.contains('wa-float') ? 'float-button' : null)
      || 'other';
    if (typeof gtag !== 'undefined') gtag('event', 'whatsapp_click', { event_category: 'Contact', event_label: section });
    try {
      const url = new URL(el.href);
      const base = url.searchParams.get('text') || '';
      if (base && !base.includes('[desde:')) {
        url.searchParams.set('text', `${base}\n[desde: ${section} — alumfer.com.ar]`);
        el.href = url.toString();
      }
    } catch (_) {}
  }));
  $$('a[href^="tel:"]').forEach(el => el.addEventListener('click', () => {
    if (typeof gtag !== 'undefined') gtag('event', 'phone_click', { event_category: 'Contact', event_label: 'tel_link' });
  }));
})();
