// ============================================================
// ALUMFER — site.js
// Interacciones de todo el sitio (cada bloque se activa sólo si su sección existe): navegación, revelado, tira de obras,
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

  // ─── Dock mobile: se esconde donde ya hay formulario o pie ──
  const mbar = $('.mbar');
  const hideZones = $$('#contacto, #presupuesto, .footer');
  if (mbar && hideZones.length && 'IntersectionObserver' in window) {
    const seen = new Set();
    const dockObs = new IntersectionObserver((entries) => {
      entries.forEach(e => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      mbar.classList.toggle('is-hidden', seen.size > 0);
    }, { threshold: 0.15 });
    hideZones.forEach(z => dockObs.observe(z));
  }

  // ─── Dibujos animados en las fichas informativas ────────
  // Cada ficha recibe el dibujo de la abertura de la que habla (según su
  // título). Se trazan al entrar en pantalla y después se mueven en loop.
  const L = (d, i = 0) => `class="d" pathLength="1" style="--i:${i}" ${d}`;
  const FX = {
    corr: `<rect ${L('x="4" y="6" width="56" height="36" rx="1"')}/><rect ${L('x="8" y="10" width="25" height="28"', 1)}/><g class="mv-slide"><rect class="glass" ${L('x="31" y="10" width="25" height="28"', 2)}/><path ${L('d="M35 21v6"', 3)}/></g><path ${L('d="M40 46h12m0 0-3-2.5m3 2.5-3 2.5"', 3)}/>`,
    abrir: `<rect ${L('x="10" y="4" width="44" height="40" rx="1"')}/><g class="mv-swing"><rect class="glass" ${L('x="14" y="8" width="36" height="32"', 1)}/><path ${L('d="M50 8 14 24l36 16"', 2)} stroke-dasharray="2 2.5"/><path ${L('d="M46 22v5"', 3)}/></g>`,
    band: `<rect ${L('x="4" y="10" width="56" height="28" rx="1"')}/><g class="mv-tilt"><rect class="glass" ${L('x="8" y="14" width="48" height="20"', 1)}/><path ${L('d="M8 34 32 14l24 20"', 2)} stroke-dasharray="2 2.5"/></g>`,
    puerta: `<path ${L('d="M4 46h56"')}/><rect ${L('x="18" y="3" width="28" height="43" rx="1"', 1)}/><g class="mv-swing"><rect class="glass" ${L('x="21" y="6" width="22" height="40"', 2)}/><path ${L('d="M21 30h22"', 3)}/><path ${L('d="M39 24v5"', 3)}/></g>`,
    mosq: `<rect ${L('x="4" y="6" width="56" height="36" rx="1"')}/><rect ${L('x="8" y="10" width="25" height="28"', 1)}/><g class="mv-slide"><rect ${L('x="31" y="10" width="25" height="28"', 2)}/><path class="mesh" ${L('d="M31 15h25M31 20h25M31 25h25M31 30h25M31 35h25M36 10v28M41 10v28M46 10v28M51 10v28"', 3)}/></g>`,
    dvh: `<path ${L('d="M30 4v40M38 4v40"')}/><path class="air" ${L('d="M30 4h8M30 44h8"', 1)}/><g class="mv-cold"><path ${L('d="M4 16h18m0 0-4-3m4 3-4 3"', 2)}/><path ${L('d="M4 32h18m0 0-4-3m4 3-4 3"', 3)}/></g><g class="mv-warm"><path ${L('d="M60 24H46m0 0 4-3m-4 3 4 3"', 4)}/></g>`,
    cerr: `<path ${L('d="M2 12 32 4l30 8"')}/><path ${L('d="M4 44h56"', 1)}/><rect ${L('x="6" y="14" width="52" height="30"', 1)}/><path ${L('d="M19 14v30M45 14v30"', 2)}/><g class="mv-slide"><rect class="glass" ${L('x="26" y="16" width="16" height="26"', 3)}/></g>`,
    techo: `<path ${L('d="M4 22 60 12"')}/><path ${L('d="M8 21v23M56 13v31"', 1)}/><path ${L('d="M4 44h56"', 2)}/><g class="mv-rain"><path ${L('d="M18 2v5M30 0v5M42 1v5M52 -1v5"', 3)}/></g>`,
    seco: `<path class="wall" ${L('d="M4 4h12v40H4zM48 4h12v40H48z"')}/><g class="mv-insert"><rect ${L('x="18" y="8" width="28" height="34" rx="1"', 1)}/><path ${L('d="M32 8v34"', 2)}/></g>`,
    cota: `<rect class="glass" ${L('x="12" y="4" width="40" height="30" rx="1"')}/><path ${L('d="M32 4v30"', 1)}/><path ${L('d="M12 40h40M12 37v6M52 37v6"', 2)}/><path ${L('d="M6 4v30M3 4h6M3 34h6"', 3)}/><circle class="mv-dot" cx="12" cy="40" r="1.8" fill="currentColor" stroke="none"/>`,
    taller: `<g class="mv-join-l"><path ${L('d="M6 38V12h8v18h12v8z"')}/></g><g class="mv-join-r"><path ${L('d="M58 38V12h-8v18H38v8z"', 1)}/></g><path ${L('d="M4 44h56"', 2)}/>`,
    envio: `<path ${L('d="M2 44h60"')}/><g class="mv-drive"><path ${L('d="M6 18h30v20H6zM36 24h10l6 7v7H36z"', 1)}/><circle ${L('cx="15" cy="39" r="4"', 2)}/><circle ${L('cx="44" cy="39" r="4"', 2)}/><rect class="glass" ${L('x="10" y="21" width="14" height="13"', 3)}/></g>`,
  };
  const pickFx = (t) => {
    t = t.toLowerCase();
    const rules = [
      [/dvh|doble vidri|vidriado|avenida|ruido|fr[ií]o|t[eé]rmic|ac[uú]stic|aislaci/, 'dvh'],
      [/mosquiter/, 'mosq'],
      [/corrediz/, 'corr'],
      [/banderol|ventiluz|oscilo/, 'band'],
      [/batient|de abrir|abrir/, 'abrir'],
      [/puerta|local|frente|acceso/, 'puerta'],
      [/cerramient|quincho|galer|balc/, 'cerr'],
      [/techo|policarb|p[eé]rgola|patio/, 'techo'],
      [/seco|marco existente|reemplaz|casa|romper|obra/, 'seco'],
      [/env[ií]o|entreg|retir/, 'envio'],
      [/f[aá]brica|fabric|taller|directo|intermediar|a[nñ]os/, 'taller'],
    ];
    const hit = rules.find(([re]) => re.test(t));
    return hit ? hit[1] : 'cota';
  };
  $$('.feature').forEach(card => {
    const title = $('.feature__title, h3', card);
    if (!title || $('.fx-ico', card)) return;
    const kind = pickFx(title.textContent);
    const ico = `<svg class="fx-ico fx-${kind}" viewBox="0 0 64 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${FX[kind]}</svg>`;
    title.insertAdjacentHTML('beforebegin', ico);
  });

  // ─── Revelado al entrar en pantalla ─────────────────────
  const revealEls = $$('.rv, .rv-img, .reveal');
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

  // ─── Formulario: el cliente elige WhatsApp o email ──────
  // (mismo comportamiento que tenía main.js: botón con data-channel)
  const WA_NUM = '5491163368643';
  function consultaPorWhatsApp(data) {
    const lineas = ['Hola Alumfer, quiero pedir un presupuesto.', ''];
    for (const [k, v] of data.entries()) {
      if (k === 'botcheck') continue;
      const t = String(v).trim();
      if (t) lineas.push(k === 'Consulta' ? `\n${t}` : `*${k}:* ${t}`);
    }
    lineas.push('', '[desde: formulario — alumfer.com.ar]');
    const url = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(lineas.join('\n'))}`;
    if (typeof gtag !== 'undefined') gtag('event', 'whatsapp_click', { event_category: 'Contact', event_label: 'contact-form' });
    // WhatsApp en otra pestaña y esta a gracias.html; si se bloquea la pestaña, WhatsApp acá mismo
    const win = window.open(url, '_blank');
    if (win) { win.opener = null; window.location.href = '/gracias.html'; } else window.location.href = url;
  }
  $$('form[action$="enviar.php"]').forEach(form => form.addEventListener('submit', async (e) => {
    if (form.closest('.cad')) return;
    e.preventDefault();
    const data = new FormData(form);
    if (data.get('botcheck')) { window.location.href = '/gracias.html'; return; }
    const btn = e.submitter || $('[type="submit"]', form);
    if (btn && btn.dataset.channel === 'whatsapp') { consultaPorWhatsApp(data); return; }
    const botones = $$('[type="submit"]', form);
    const label = btn.textContent;
    botones.forEach(b => { b.disabled = true; });
    btn.classList.add('is-loading');
    btn.textContent = 'Enviando…';
    try {
      const res = await fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: data });
      const r = await res.json();
      if (!r.success) throw new Error(r.message || 'error');
      window.location.href = '/gracias.html';
    } catch (_) {
      botones.forEach(b => { b.disabled = false; });
      btn.classList.remove('is-loading');
      btn.textContent = label;
      alert('No pudimos enviar la consulta por email. Probá con el botón de WhatsApp o escribinos al (011) 6336-8643.');
    }
  }));

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
