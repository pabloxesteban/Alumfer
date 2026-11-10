// ============================================================
// ALUMFER — site.js
// Interacciones de todo el sitio (cada bloque se activa sólo si su sección existe): navegación, revelado, tira de obras,
// proceso, galería + lightbox, líneas, formulario
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
    // El menú arranca justo debajo de la barra de navegación (la barra del local la corre hacia abajo arriba de todo)
    const nav = burger.closest('.nav');
    if (open && nav) drawer.style.top = Math.max(0, nav.getBoundingClientRect().bottom) + 'px';
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

  // ─── Animación de la empresa: sólo corre cuando se ve ───
  const ens = $('.casa');
  if (ens && 'IntersectionObserver' in window) {
    ens.classList.add('is-pausado');
    new IntersectionObserver((es) => es.forEach((e) => ens.classList.toggle('is-pausado', !e.isIntersecting)), { threshold: 0.15 }).observe(ens);
  }

  // ─── Visor de fotos: animación y gestos (home y páginas internas) ──
  // Cambia la foto entrando desde el costado hacia el que se deslizó.
  const mostrarFoto = (lb, img, src, alt, dir = 0) => {
    quitarZoom(lb, img);
    img.style.transition = 'opacity 140ms';
    img.style.opacity = '0';
    const tmp = new Image();
    tmp.onload = tmp.onerror = () => {
      img.src = src; img.alt = alt;
      img.style.transition = 'none';
      img.style.transform = reduceMotion ? '' : (dir ? `translateX(${dir * 56}px)` : 'scale(0.96)');
      void img.offsetWidth;
      img.style.transition = 'transform 360ms var(--ease), opacity 260ms var(--ease)';
      img.style.transform = '';
      img.style.opacity = '1';
    };
    tmp.src = src;
  };
  const quitarZoom = (lb, img) => {
    if (!lb.classList.contains('is-zoom')) return;
    lb.classList.remove('is-zoom');
    img.style.transition = 'transform 260ms var(--ease)';
    img.style.transform = '';
  };
  // Deslizar a los costados: la foto sigue al dedo y pasa a la siguiente.
  // Deslizar hacia abajo: cierra. Doble toque (o doble clic): zoom.
  const gestosVisor = (lb, img, go, close) => {
    const ZOOM = 2.2;
    let x0 = 0, y0 = 0, dx = 0, dy = 0, eje = null, ultimoToque = 0, zx = 0, zy = 0, bx = 0, by = 0;
    const zoomEn = (x, y) => {
      const r = img.getBoundingClientRect();
      img.style.transformOrigin = `${((x - r.left) / r.width) * 100}% ${((y - r.top) / r.height) * 100}%`;
      zx = zy = 0;
      img.style.transition = 'transform 280ms var(--ease)';
      img.style.transform = `scale(${ZOOM})`;
      lb.classList.add('is-zoom');
    };
    const alternarZoom = (x, y) => (lb.classList.contains('is-zoom') ? quitarZoom(lb, img) : zoomEn(x, y));
    img.addEventListener('dblclick', (e) => alternarZoom(e.clientX, e.clientY));
    lb.addEventListener('touchstart', (e) => {
      if (e.target.closest('.comparar')) { eje = 'comparar'; return; }
      if (e.touches.length > 1) { eje = 'pinza'; return; }
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; dx = dy = 0; eje = null; bx = zx; by = zy;
    }, { passive: true });
    lb.addEventListener('touchmove', (e) => {
      if (eje === 'pinza' || eje === 'comparar' || e.touches.length > 1) return;
      dx = e.touches[0].clientX - x0; dy = e.touches[0].clientY - y0;
      img.style.transition = 'none';
      if (lb.classList.contains('is-zoom')) {
        zx = bx + dx; zy = by + dy;
        img.style.transform = `translate(${zx}px, ${zy}px) scale(${ZOOM})`;
        return;
      }
      if (!eje && Math.hypot(dx, dy) > 8) eje = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (eje === 'x') img.style.transform = `translateX(${dx}px) rotate(${dx / 60}deg)`;
      if (eje === 'y' && dy > 0) {
        img.style.transform = `translateY(${dy}px) scale(${1 - Math.min(dy, 320) / 1400})`;
        lb.style.setProperty('--lb-fondo', String(Math.max(0.3, 0.94 - dy / 500)));
      }
    }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (eje === 'comparar') { eje = null; return; }
      if (lb.classList.contains('is-zoom') && Math.hypot(dx, dy) > 8) return;
      lb.style.removeProperty('--lb-fondo');
      if (eje === 'x' && Math.abs(dx) > 60) {
        img.style.transition = 'transform 180ms ease-in, opacity 180ms';
        img.style.transform = `translateX(${dx > 0 ? 40 : -40}vw)`;
        img.style.opacity = '0';
        setTimeout(() => go(dx > 0 ? -1 : 1), 120);
      } else if (eje === 'y' && dy > 110) {
        img.style.transition = 'transform 220ms ease-in, opacity 220ms';
        img.style.transform = `translateY(${dy + 160}px) scale(0.9)`;
        img.style.opacity = '0';
        close();
        setTimeout(() => { img.style.transform = ''; img.style.opacity = '1'; }, 300);
      } else if (eje) {
        img.style.transition = 'transform 260ms var(--ease)';
        img.style.transform = '';
      } else if (e.target === img && e.changedTouches.length) {
        const ahora = Date.now();
        if (ahora - ultimoToque < 300) { alternarZoom(e.changedTouches[0].clientX, e.changedTouches[0].clientY); ultimoToque = 0; }
        else ultimoToque = ahora;
      }
      eje = null;
    }, { passive: true });
  };

  // ─── Comparador: dos fotos encimadas y una barra que se arrastra ──
  const crearComparador = () => {
    const el = document.createElement('div');
    el.className = 'comparar';
    el.hidden = true;
    el.innerHTML = `
      <img class="comparar__b" alt="">
      <img class="comparar__a" alt="">
      <span class="comparar__et comparar__et--a mono"></span>
      <span class="comparar__et comparar__et--b mono"></span>
      <span class="comparar__mano" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-label="Deslizá para comparar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6-6 6 6 6M15 6l6 6-6 6"/></svg>
      </span>`;
    const [imgB, imgA] = $$('img', el);
    const mano = $('.comparar__mano', el);
    const poner = (pct) => {
      pct = Math.max(0, Math.min(100, pct));
      el.style.setProperty('--pos', `${pct}%`);
      mano.setAttribute('aria-valuenow', String(Math.round(pct)));
    };
    const desdePuntero = (x) => { const r = el.getBoundingClientRect(); poner(((x - r.left) / r.width) * 100); };
    let arrastrando = false;
    el.addEventListener('pointerdown', (e) => {
      arrastrando = true;
      el.classList.remove('is-amague');
      el.setPointerCapture(e.pointerId);
      desdePuntero(e.clientX);
    });
    el.addEventListener('pointermove', (e) => { if (arrastrando) desdePuntero(e.clientX); });
    el.addEventListener('pointerup', () => { arrastrando = false; });
    el.addEventListener('pointercancel', () => { arrastrando = false; });
    el.addEventListener('click', (e) => e.stopPropagation());
    mano.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      e.stopPropagation();
      el.classList.remove('is-amague');
      poner(parseFloat(mano.getAttribute('aria-valuenow')) + (e.key === 'ArrowRight' ? 5 : -5));
    });
    // Tamaño: lo más grande que entre en el espacio libre del visor, con la proporción de la foto
    const ajustar = () => {
      if (el.hidden || !el.parentElement) return;
      if (!imgB.naturalWidth) return;
      const ratio = imgB.naturalWidth / imgB.naturalHeight;
      const st = el.parentElement, cs = getComputedStyle(st);
      const libreW = st.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const libreH = st.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const w = Math.max(0, Math.min(libreW, libreH * ratio));
      el.style.width = `${w}px`;
      el.style.height = `${w / ratio}px`;
    };
    window.addEventListener('resize', ajustar);
    // el rótulo de abajo puede ocupar una o dos líneas: se recalcula cuando cambia el espacio libre
    let observado = false;
    return {
      el,
      mostrar(a, b) {
        imgA.src = a.src; imgA.alt = a.alt;
        imgB.src = b.src; imgB.alt = b.alt;
        $('.comparar__et--a', el).textContent = a.tag;
        $('.comparar__et--b', el).textContent = b.tag;
        imgB.onload = ajustar;
        poner(50);
        el.hidden = false;
        if (imgB.complete && imgB.naturalWidth) requestAnimationFrame(ajustar);
        if (!observado && 'ResizeObserver' in window && el.parentElement) { observado = true; new ResizeObserver(() => ajustar()).observe(el.parentElement); }
        el.classList.remove('is-amague');
        if (!reduceMotion) { void el.offsetWidth; el.classList.add('is-amague'); }
      },
      ocultar() { el.hidden = true; el.classList.remove('is-amague'); },
    };
  };

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

    // fotos apaisadas a doble ancho
    items.forEach(it => { const img = $('img', it); if (img && +img.getAttribute('width') > +img.getAttribute('height') * 1.2) it.classList.add('is-ancho'); });
    const render = () => {
      const list = matching();
      items.forEach(it => { it.hidden = true; it.classList.remove('is-grande'); });
      // la primera vertical de cada filtro, destacada en grande
      const destacada = list.slice(0, limit).find(it => !it.classList.contains('is-ancho'));
      if (destacada) destacada.classList.add('is-grande');
      // completar la última fila de la grilla (sin huecos)
      const cols = getComputedStyle(archive).gridTemplateColumns.split(' ').length;
      const celdas = (it) => (it.classList.contains('is-grande') ? (cols > 2 ? 4 : 2) : it.classList.contains('is-ancho') ? 2 : 1);
      let n = Math.min(limit, list.length), total = list.slice(0, n).reduce((t, it) => t + celdas(it), 0);
      while (total % cols && n < list.length) { total += celdas(list[n]); n++; }
      list.slice(0, n).forEach(it => { it.hidden = false; });
      limit = Math.max(limit, n);
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
    const lbTabs  = $('#lightbox-tabs');
    let lbList = [];
    let lbIdx = 0;
    let lbDir = 0; // dirección de la animación al cambiar de foto
    let lbSub = 0; // foto dentro de una serie (antes / después, cerrada / abierta…)
    let lastFocus = null;

    // Un trabajo puede traer varias fotos en data-fotos: [{src, tag, alt}]
    const fotosDe = (it) => {
      if (!('fotos' in it.dataset)) return null;
      try { return JSON.parse(it.dataset.fotos); } catch (e) { return null; }
    };

    // Si la serie tiene un par para comparar (antes / después, cerrada / abierta),
    // se suma un primer paso "Comparar" con la barra deslizable.
    const PARES = [[/antes/i, /despu/i], [/cerrad/i, /abiert/i]];
    const serie = (it) => {
      const fotos = fotosDe(it);
      if (!fotos) return null;
      for (const [ra, rb] of PARES) {
        const a = fotos.find(x => ra.test(x.tag)), b = fotos.find(x => rb.test(x.tag));
        if (a && b) return [{ comparar: true, tag: 'Comparar', a, b }, ...fotos];
      }
      return fotos;
    };
    const comp = crearComparador();
    $('.lightbox__stage', lb)?.appendChild(comp.el);

    const paint = () => {
      const it = lbList[lbIdx];
      const img = $('img', it);
      const fotos = serie(it);
      const f = fotos ? fotos[lbSub] : null;
      if (f && f.comparar) {
        quitarZoom(lb, lbImg);
        lbImg.hidden = true;
        comp.mostrar(f.a, f.b);
      } else {
        comp.ocultar();
        lbImg.hidden = false;
        const src = f ? f.src : (img.currentSrc || img.src);
        const alt = f ? f.alt : img.alt;
        mostrarFoto(lb, lbImg, src, alt, lbDir);
      }
      lbDir = 0;
      lbLabel.textContent = (it.dataset.label || '') + (f ? ` · ${f.comparar ? `${f.a.tag} / ${f.b.tag}` : f.tag}` : '');
      lbCount.textContent = `${lbIdx + 1} / ${lbList.length}`;
      if (lbTabs) {
        lbTabs.hidden = !fotos;
        lbTabs.textContent = '';
        (fotos || []).forEach((x, i) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'lightbox__tab mono';
          b.setAttribute('role', 'tab');
          b.setAttribute('aria-selected', String(i === lbSub));
          b.textContent = x.tag;
          b.addEventListener('click', () => { if (i !== lbSub) { lbDir = i > lbSub ? 1 : -1; lbSub = i; paint(); } });
          lbTabs.appendChild(b);
        });
        // precargar el resto de la serie para que el cambio sea instantáneo
        (fotos || []).forEach(x => { if (x.src) new Image().src = x.src; });
      }
      // precargar los trabajos vecinos para que deslizar sea inmediato
      [-1, 1].forEach(d => { const v = $('img', lbList[(lbIdx + d + lbList.length) % lbList.length]); if (v) new Image().src = v.currentSrc || v.src; });
    };
    const open = (it) => {
      lbList = visible();
      lbIdx = Math.max(0, lbList.indexOf(it));
      lbSub = 0;
      lastFocus = document.activeElement;
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => lb.classList.add('is-open'));
      paint();
      $('.lightbox__close', lb).focus();
    };
    const close = () => {
      lb.classList.remove('is-open');
      quitarZoom(lb, lbImg);
      setTimeout(() => { lb.hidden = true; document.body.style.overflow = ''; lastFocus?.focus(); }, 200);
    };
    // Flechas / deslizar: primero recorren las fotos de la serie, después pasan al otro trabajo
    const go = (d) => {
      lbDir = d;
      const fotos = serie(lbList[lbIdx]);
      if (fotos && lbSub + d >= 0 && lbSub + d < fotos.length) { lbSub += d; paint(); return; }
      lbIdx = (lbIdx + d + lbList.length) % lbList.length;
      const sig = serie(lbList[lbIdx]);
      lbSub = sig && d < 0 ? sig.length - 1 : 0;
      paint();
    };

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
    if (lb) gestosVisor(lb, lbImg, go, close);
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
    // el origen queda en GA4; el mensaje que ve el cliente va limpio
    if (typeof gtag !== 'undefined') gtag('event', 'whatsapp_click', { event_category: 'Contact', event_label: section });
  }));
  $$('a[href^="tel:"]').forEach(el => el.addEventListener('click', () => {
    if (typeof gtag !== 'undefined') gtag('event', 'phone_click', { event_category: 'Contact', event_label: 'tel_link' });
  }));

  // ─── Visor en páginas internas: tocar una foto la abre en grande ──
  const fotosSueltas = $$('.obras-strip__item img, .phero__photo img');
  if (!$('#lightbox') && fotosSueltas.length) {
    const waHref = $('.mbar .btn--wa')?.href || waLink('Hola, quiero pedir un presupuesto');
    const v = document.createElement('div');
    v.className = 'lightbox';
    v.id = 'visor';
    v.hidden = true;
    v.setAttribute('role', 'dialog');
    v.setAttribute('aria-modal', 'true');
    v.setAttribute('aria-label', 'Foto ampliada');
    v.innerHTML = `
      <div class="lightbox__stage"><img class="lightbox__img" alt=""></div>
      <button type="button" class="lightbox__close" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      <button type="button" class="lightbox__btn lightbox__btn--prev" aria-label="Anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m15 18-6-6 6-6"/></svg></button>
      <button type="button" class="lightbox__btn lightbox__btn--next" aria-label="Siguiente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m9 18 6-6-6-6"/></svg></button>
      <div class="lightbox__bar">
        <span class="mono lightbox__label"></span>
        <span class="mono lightbox__count"></span>
        <a class="btn btn--wa" target="_blank" rel="noopener">Consultar por un trabajo así</a>
      </div>`;
    document.body.appendChild(v);
    const vImg = $('.lightbox__img', v);
    const vLabel = $('.lightbox__label', v);
    const vCount = $('.lightbox__count', v);
    $('.btn--wa', v).href = waHref;
    if (fotosSueltas.length < 2) $$('.lightbox__btn', v).forEach(b => b.remove());
    let vi = 0;
    let vFoco = null;
    const pintar = (dir = 0) => {
      const img = fotosSueltas[vi];
      const fc = img.closest('figure')?.querySelector('figcaption');
      const cap = fc ? (fc.children.length ? [...fc.children].map(x => x.textContent.trim()).filter(Boolean).join(' · ') : fc.textContent.trim()) : '';
      mostrarFoto(v, vImg, img.currentSrc || img.src, img.alt, dir);
      vLabel.textContent = cap || '';
      vCount.textContent = fotosSueltas.length > 1 ? `${vi + 1} / ${fotosSueltas.length}` : '';
      [-1, 1].forEach(d => { const s = fotosSueltas[(vi + d + fotosSueltas.length) % fotosSueltas.length]; new Image().src = s.currentSrc || s.src; });
    };
    const ir = (d) => { vi = (vi + d + fotosSueltas.length) % fotosSueltas.length; pintar(d); };
    const abrir = (i) => {
      vi = i; vFoco = document.activeElement;
      v.hidden = false;
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => v.classList.add('is-open'));
      pintar();
      $('.lightbox__close', v).focus();
    };
    const cerrar = () => {
      v.classList.remove('is-open');
      quitarZoom(v, vImg);
      setTimeout(() => { v.hidden = true; document.body.style.overflow = ''; vFoco?.focus(); }, 200);
    };
    fotosSueltas.forEach((img, i) => {
      const t = img.closest('figure') || img;
      t.classList.add('ampliable');
      t.tabIndex = 0;
      t.setAttribute('role', 'button');
      t.setAttribute('aria-label', `Ampliar foto: ${img.alt}`);
      t.addEventListener('click', () => abrir(i));
      t.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(i); } });
    });
    $('.lightbox__close', v).addEventListener('click', cerrar);
    $('.lightbox__btn--prev', v)?.addEventListener('click', () => ir(-1));
    $('.lightbox__btn--next', v)?.addEventListener('click', () => ir(1));
    v.addEventListener('click', (e) => { if (e.target === v || e.target.classList.contains('lightbox__stage')) cerrar(); });
    document.addEventListener('keydown', (e) => {
      if (v.hidden) return;
      if (e.key === 'Escape') cerrar();
      if (e.key === 'ArrowLeft' && fotosSueltas.length > 1) ir(-1);
      if (e.key === 'ArrowRight' && fotosSueltas.length > 1) ir(1);
    });
    gestosVisor(v, vImg, (d) => (fotosSueltas.length > 1 ? ir(d) : pintar()), cerrar);
  }

  // ─── Scroll: barra de progreso, menú que se esconde y "volver arriba" ──
  const progreso = document.createElement('div');
  progreso.className = 'scroll-prog';
  progreso.setAttribute('aria-hidden', 'true');
  nav?.appendChild(progreso);

  const subir = document.createElement('button');
  subir.type = 'button';
  subir.className = 'subir';
  subir.setAttribute('aria-label', 'Volver arriba');
  subir.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  subir.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  document.body.appendChild(subir);

  const navMovil = window.matchMedia('(max-width: 960px)');
  let yPrevia = window.scrollY;
  let pendiente = false;
  const alScrollear = () => {
    pendiente = false;
    const y = window.scrollY;
    const max = doc.scrollHeight - window.innerHeight;
    progreso.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    const delta = y - yPrevia;
    if (Math.abs(delta) < 6) return;
    const bajando = delta > 0;
    const menuAbierto = burger?.getAttribute('aria-expanded') === 'true';
    nav?.classList.toggle('is-oculta', navMovil.matches && bajando && y > 220 && !menuAbierto);
    subir.classList.toggle('is-visible', !bajando && y > window.innerHeight * 1.5);
    yPrevia = y;
  };
  window.addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(alScrollear); } }, { passive: true });
  alScrollear();

  // ─── Carruseles deslizables: puntos que muestran cuántas hay ──
  // y un pequeño "amague" la primera vez que se ven, para invitar a deslizar.
  const tocable = window.matchMedia('(hover: none)').matches;
  $$('.extras, .quotes, .features-grid, .product-list, .reviews-grid, .reel, .seguir__grid').forEach(sc => {
    const tarjetas = () => $$(':scope > *, :scope > .reel__track > *', sc)
      .filter(x => !x.classList.contains('reel__track') && x.getAttribute('aria-hidden') !== 'true' && x.getClientRects().length);
    const puntos = document.createElement('div');
    puntos.className = 'puntos';
    puntos.setAttribute('aria-hidden', 'true');
    sc.insertAdjacentElement('afterend', puntos);
    let lista = [];
    const ir = (el) => {
      const pad = parseFloat(getComputedStyle(sc).scrollPaddingLeft) || 0;
      sc.scrollBy({ left: el.getBoundingClientRect().left - sc.getBoundingClientRect().left - pad, behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    const armar = () => {
      lista = tarjetas();
      const desborda = sc.scrollWidth > sc.clientWidth + 4 && lista.length > 1;
      puntos.hidden = !desborda;
      if (!desborda) return;
      puntos.textContent = '';
      lista.forEach((el) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.tabIndex = -1;
        b.addEventListener('click', () => ir(el));
        puntos.appendChild(b);
      });
      marcar();
    };
    const marcar = () => {
      if (puntos.hidden) return;
      const izq = sc.getBoundingClientRect().left + (parseFloat(getComputedStyle(sc).scrollPaddingLeft) || 0);
      let activo = 0, mejor = Infinity;
      lista.forEach((el, i) => { const d = Math.abs(el.getBoundingClientRect().left - izq); if (d < mejor) { mejor = d; activo = i; } });
      if (sc.scrollLeft >= sc.scrollWidth - sc.clientWidth - 4) activo = lista.length - 1;
      $$('button', puntos).forEach((b, i) => b.classList.toggle('is-on', i === activo));
    };
    let rafP = 0;
    sc.addEventListener('scroll', () => { cancelAnimationFrame(rafP); rafP = requestAnimationFrame(marcar); }, { passive: true });
    window.addEventListener('resize', armar);
    armar();

    if (tocable && !reduceMotion && 'IntersectionObserver' in window) {
      const amague = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting || puntos.hidden || sc.scrollLeft > 4) return;
        amague.disconnect();
        sc.classList.add('is-amague');
        setTimeout(() => sc.classList.remove('is-amague'), 1300);
      }, { threshold: 0.6 });
      amague.observe(sc);
      sc.addEventListener('touchstart', () => { amague.disconnect(); sc.classList.remove('is-amague'); }, { passive: true, once: true });
    }
  });

  // ─── Fotos: aparecen suaves cuando terminan de cargar ──
  $$('img[loading="lazy"]').forEach(img => {
    if (img.complete && img.naturalWidth) return;
    img.classList.add('img-carga');
    const lista = () => img.classList.add('img-lista');
    img.addEventListener('load', lista, { once: true });
    img.addEventListener('error', lista, { once: true });
  });

  // ─── Grillas de fotos y servicios: entran escalonadas ──
  if ('IntersectionObserver' in window && !reduceMotion) {
    const escalonados = $$('.archive__item, .obras-strip__item, .svc');
    const io2 = new IntersectionObserver((entries) => {
      let n = 0;
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.style.transitionDelay = `${Math.min(n++, 6) * 70}ms`;
        el.classList.add('is-in');
        io2.unobserve(el);
        // al terminar, se sacan las clases para no pisar el efecto al pasar el mouse
        setTimeout(() => { el.classList.remove('aparece', 'is-in'); el.style.transitionDelay = ''; }, 1300);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    escalonados.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) return; // lo que ya se ve, queda quieto
      el.classList.add('aparece');
      io2.observe(el);
    });
  }

  // ─── Cifras del inicio: cuentan hasta su valor al verse ──
  const cifras = $$('.stat__n').map(n => {
    const t = n.firstChild;
    if (!t || t.nodeType !== 3) return null;
    const final = t.textContent.trim();
    const valor = parseFloat(final.replace(',', '.'));
    return isNaN(valor) ? null : { t, final, valor, dec: final.includes(',') ? 1 : 0 };
  }).filter(Boolean);
  if (cifras.length && 'IntersectionObserver' in window && !reduceMotion) {
    const contar = (c) => {
      const t0 = performance.now(), dur = 1400;
      const paso = (ahora) => {
        const p = Math.min(1, (ahora - t0) / dur);
        const v = c.valor * (1 - Math.pow(1 - p, 3));
        c.t.textContent = p < 1 ? v.toFixed(c.dec).replace('.', ',') : c.final;
        if (p < 1) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    };
    const caja = cifras[0].t.parentElement.closest('.hero__stats') || cifras[0].t.parentElement;
    cifras.forEach(c => { c.t.textContent = (0).toFixed(c.dec).replace('.', ','); });
    const ioC = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      ioC.disconnect();
      cifras.forEach(contar);
    }, { threshold: 0.4 });
    ioC.observe(caja);
  }

  // ─── Guías: tiempo de lectura e índice que marca dónde estás ──
  const indice = $('.toc');
  if (indice) {
    // Minutos de lectura: el texto de la guía, sin formulario ni pie (unas 200 palabras por minuto)
    const cuerpo = $$('main section').filter(sec => !sec.matches('#presupuesto, .seguir') && !sec.querySelector('form'));
    const palabras = cuerpo.reduce((n, sec) => n + (sec.innerText || sec.textContent).split(/\s+/).filter(Boolean).length, 0);
    const minutos = Math.max(1, Math.round(palabras / 200));
    const destino = $('.phero .crumbs') || $('.phero__text');
    if (destino) {
      const p = document.createElement('p');
      p.className = 'lectura mono';
      p.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>${minutos} min de lectura`;
      destino.insertAdjacentElement(destino.classList.contains('crumbs') ? 'afterend' : 'afterbegin', p);
    }

    // Índice: resalta la sección que estás leyendo y la mantiene a la vista en la fila
    const enlaces = $$('a[href^="#"]', indice);
    const secciones = enlaces.map(a => document.getElementById(a.getAttribute('href').slice(1))).map(h => h && (h.closest('section') || h));
    let actual = -1;
    const marcarIndice = () => {
      const corte = indice.getBoundingClientRect().bottom + window.innerHeight * 0.25;
      let i = -1;
      secciones.forEach((sec, n) => { if (sec && sec.getBoundingClientRect().top < corte) i = n; });
      // pasada la última sección del índice (formulario, pie), no queda nada marcado
      const ult = secciones[secciones.length - 1];
      if (ult && ult.getBoundingClientRect().bottom < indice.getBoundingClientRect().bottom) i = -1;
      indice.classList.toggle('is-pegado', indice.getBoundingClientRect().top <= (nav?.getBoundingClientRect().bottom || 0) + 1);
      if (i === actual) return;
      actual = i;
      enlaces.forEach((a, n) => (n === i ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
      const a = enlaces[i];
      const fila = $('ol', indice);
      if (a && fila) fila.scrollTo({ left: a.parentElement.offsetLeft - fila.clientWidth / 2 + a.offsetWidth / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    let rafI = 0;
    window.addEventListener('scroll', () => { cancelAnimationFrame(rafI); rafI = requestAnimationFrame(marcarIndice); }, { passive: true });
    marcarIndice();
  }
})();
