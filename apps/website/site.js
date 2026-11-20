// ============================================================
// ALUMFER — site.js
// Interacciones de todo el sitio (cada bloque se activa sólo si su sección existe): navegación, revelado, tira de obras,
// proceso, galería + visor de fotos, líneas, formulario
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

  // ─── Visor de fotos (galería del inicio y fotos de las páginas internas) ──
  // Una obra = { titulo, fotos: [{ src, alt, tag, mini }], wa, cap }.
  // Se recorre foto por foto; al terminar las fotos de una obra pasa a la siguiente.
  // Gestos: deslizar a los costados (la foto sigue al dedo), deslizar hacia abajo
  // para cerrar, pellizcar o doble toque para ampliar. El botón "atrás" del
  // celular cierra el visor en vez de salir de la página.
  const ICO_CERRAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  const ICO_ANT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
  const ICO_SIG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
  const ICO_WA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

  const crearVisor = () => {
    const v = document.createElement('div');
    v.className = 'visor';
    v.hidden = true;
    v.setAttribute('role', 'dialog');
    v.setAttribute('aria-modal', 'true');
    v.setAttribute('aria-labelledby', 'visor-titulo');
    v.innerHTML = `
      <div class="visor__top">
        <div class="visor__head"><h2 class="visor__title" id="visor-titulo"></h2><p class="visor__count" aria-live="polite"></p></div>
        <button type="button" class="visor__close" aria-label="Cerrar">${ICO_CERRAR}</button>
      </div>
      <div class="visor__stage">
        <img class="visor__img" alt="" draggable="false">
        <button type="button" class="visor__nav visor__nav--prev" aria-label="Foto anterior">${ICO_ANT}</button>
        <button type="button" class="visor__nav visor__nav--next" aria-label="Foto siguiente">${ICO_SIG}</button>
      </div>
      <div class="visor__bottom">
        <div class="visor__thumbs" role="group" aria-label="Fotos de este trabajo" hidden></div>
        <p class="visor__cap"></p>
        <a class="btn btn--wa visor__cta" href="${waLink('Hola, quiero pedir un presupuesto')}" target="_blank" rel="noopener">${ICO_WA}<span>Consultar por este trabajo</span></a>
      </div>`;
    document.body.appendChild(v);
    const titulo = $('.visor__title', v), cuenta = $('.visor__count', v), cap = $('.visor__cap', v);
    const stage = $('.visor__stage', v), img = $('.visor__img', v), thumbs = $('.visor__thumbs', v);
    const cta = $('.visor__cta', v), btnAnt = $('.visor__nav--prev', v), btnSig = $('.visor__nav--next', v);

    let obras = [], io = 0, fo = 0, abierto = false, enHistoria = false, alCerrar = null, thumbsDe = -1, pedido = 0;
    let esperandoAtras = false, tragarAtras = false;
    let fondos = []; // elementos de la página que quedan inertes mientras el visor está abierto

    // ── Zoom y arrastre ──
    let esc = 1, tx = 0, ty = 0;
    const aplicar = (anim) => {
      img.style.transition = anim && !reduceMotion ? 'transform 200ms var(--ease)' : 'none';
      img.style.transform = esc === 1 && !tx && !ty ? '' : `translate(${tx}px, ${ty}px) scale(${esc})`;
      v.classList.toggle('is-zoom', esc > 1);
    };
    const limitar = () => {
      const mx = (img.clientWidth * (esc - 1)) / 2, my = (img.clientHeight * (esc - 1)) / 2;
      tx = Math.max(-mx, Math.min(mx, tx));
      ty = Math.max(-my, Math.min(my, ty));
    };
    const sinZoom = (anim) => { esc = 1; tx = ty = 0; aplicar(anim); };
    const zoomEn = (x, y, s = 2.5) => {
      const r = img.getBoundingClientRect();
      const ox = x - (r.left + r.width / 2), oy = y - (r.top + r.height / 2);
      esc = s; tx = -ox * (s - 1); ty = -oy * (s - 1);
      limitar(); aplicar(true);
    };

    const total = () => obras.reduce((n, o) => n + o.fotos.length, 0);

    const pintar = (dir = 0) => {
      const o = obras[io], f = o.fotos[fo], varias = o.fotos.length > 1;
      sinZoom(false);
      titulo.textContent = o.titulo;
      cuenta.textContent = varias ? `Foto ${fo + 1} de ${o.fotos.length}` : (obras.length > 1 ? `Trabajo ${io + 1} de ${obras.length}` : '');
      cap.textContent = varias ? (f.tag || '') : (o.cap || '');
      cta.href = o.href || waLink(o.wa || 'Hola, quiero pedir un presupuesto');
      btnAnt.hidden = btnSig.hidden = total() < 2;

      // foto: si ya está en caché se cambia al instante; si no, aparece al cargar
      const n = ++pedido;
      const tmp = new Image();
      const poner = () => {
        if (n !== pedido) return;
        img.src = f.src; img.alt = f.alt || o.titulo;
        img.classList.remove('is-cargando');
        esc = 1; tx = ty = 0; v.classList.remove('is-zoom'); // la foto nueva siempre arranca sin zoom
        if (dir && !reduceMotion) {
          img.style.transition = 'none';
          img.style.transform = `translateX(${dir * 24}px)`;
          void img.offsetWidth;
          img.style.transition = 'transform 200ms var(--ease), opacity 150ms linear';
          img.style.transform = '';
        } else { img.style.transition = ''; img.style.transform = ''; }
      };
      tmp.src = f.src;
      if (tmp.complete && tmp.naturalWidth) poner();
      else { img.classList.add('is-cargando'); tmp.onload = tmp.onerror = poner; }

      // miniaturas: se arman una vez por obra (así no se pierde el foco al tocarlas)
      if (thumbsDe !== io) {
        thumbsDe = io;
        thumbs.textContent = '';
        thumbs.hidden = !varias;
        if (varias) o.fotos.forEach((x, i) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'visor__thumb';
          b.setAttribute('aria-label', `Foto ${i + 1}${x.tag ? `: ${x.tag}` : ''}`);
          b.innerHTML = `<img src="${x.mini || x.src}" alt="" loading="lazy" decoding="async">`;
          b.addEventListener('click', () => { if (i !== fo) { const d = i > fo ? 1 : -1; fo = i; pintar(d); } });
          thumbs.appendChild(b);
        });
      }
      $$('.visor__thumb', thumbs).forEach((b, i) => b.setAttribute('aria-current', String(i === fo)));
      const act = thumbs.children[fo];
      if (act) thumbs.scrollLeft = act.offsetLeft - (thumbs.clientWidth - act.offsetWidth) / 2;

      // precargar la foto anterior y la siguiente
      [vecina(-1), vecina(1)].forEach(x => { if (x) new Image().src = x.src; });
    };
    const vecina = (d) => {
      const o = obras[io];
      if (fo + d >= 0 && fo + d < o.fotos.length) return o.fotos[fo + d];
      if (obras.length < 2) return null;
      const p = obras[(io + d + obras.length) % obras.length];
      return d < 0 ? p.fotos[p.fotos.length - 1] : p.fotos[0];
    };
    const ir = (d) => {
      if (total() < 2) return;
      const o = obras[io];
      if (fo + d >= 0 && fo + d < o.fotos.length) fo += d;
      else if (obras.length > 1) {
        io = (io + d + obras.length) % obras.length;
        fo = d < 0 ? obras[io].fotos.length - 1 : 0;
      } else fo = d < 0 ? o.fotos.length - 1 : 0;
      pintar(d);
    };

    const abrir = (lista, i = 0, j = 0, cb = null) => {
      obras = lista; io = i; fo = j; alCerrar = cb; thumbsDe = -1; abierto = true;
      v.hidden = false;
      doc.classList.add('visor-abierto');
      fondos = Array.from(document.body.children).filter(el => el !== v && !el.inert);
      fondos.forEach(el => { el.inert = true; });
      // el navegador no debe devolver el scroll a donde estaba al abrir: al cerrar
      // se va a la obra que se estaba mirando
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      if (esperandoAtras) tragarAtras = true; // el "atrás" del cierre anterior todavía no llegó
      else if (!enHistoria) { history.pushState({ visor: 1 }, ''); enHistoria = true; }
      requestAnimationFrame(() => v.classList.add('is-open'));
      pintar();
      $('.visor__close', v).focus();
    };
    // volver a la tarjeta de la obra que se estaba mirando (cuando el historial ya se acomodó)
    const volver = () => {
      const destino = alCerrar ? alCerrar(io) : null;
      destino?.focus({ preventScroll: true });
      if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
    };
    const cerrar = (desdeAtras = false) => {
      if (!abierto) return;
      abierto = false;
      v.classList.remove('is-open');
      fondos.forEach(el => { el.inert = false; });
      doc.classList.remove('visor-abierto');
      v.style.removeProperty('background-color');
      setTimeout(() => { if (!abierto) v.hidden = true; }, reduceMotion ? 0 : 180);
      if (enHistoria && !desdeAtras) { enHistoria = false; esperandoAtras = true; history.back(); }
      else { enHistoria = false; volver(); }
    };
    window.addEventListener('popstate', () => {
      if (esperandoAtras) {
        // llegó el "atrás" que pidió el cierre
        esperandoAtras = false;
        if (tragarAtras) { tragarAtras = false; history.pushState({ visor: 1 }, ''); enHistoria = true; return; }
        volver();
        return;
      }
      if (abierto) { enHistoria = false; cerrar(true); return; }
      // se llegó a una entrada vieja del visor (por "adelante" o al recargar): se limpia
      if (history.state && history.state.visor) history.replaceState(null, '');
    });
    if (history.state && history.state.visor) history.replaceState(null, '');

    $('.visor__close', v).addEventListener('click', () => cerrar());
    btnAnt.addEventListener('click', () => ir(-1));
    btnSig.addEventListener('click', () => ir(1));
    // en computadora, un clic fuera de la foto cierra
    stage.addEventListener('click', (e) => {
      if (recienArrastre) { recienArrastre = false; return; } // soltar después de mover la foto ampliada no cierra
      if (e.target === stage && matchMedia('(hover: hover)').matches) cerrar();
    });

    document.addEventListener('keydown', (e) => {
      if (!abierto) return;
      if (e.key === 'Escape') { e.preventDefault(); cerrar(); }
      else if (e.key === 'ArrowLeft') ir(-1);
      else if (e.key === 'ArrowRight') ir(1);
      else if (e.key === 'Tab') {
        // el foco no sale del visor
        const f = $$('button:not([hidden]), a[href]', v).filter(x => x.offsetParent !== null);
        if (!f.length) return;
        const pri = f[0], ult = f[f.length - 1];
        if (e.shiftKey && document.activeElement === pri) { e.preventDefault(); ult.focus(); }
        else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); pri.focus(); }
      }
    });

    // ── Gestos táctiles ──
    let x0 = 0, y0 = 0, dx = 0, dy = 0, eje = null, bx = 0, by = 0, d0 = 0, s0 = 1, ultimoToque = 0, tocoHace = 0;
    const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    stage.addEventListener('touchstart', (e) => {
      tocoHace = Date.now();
      if (e.target.closest('.visor__nav')) { eje = 'boton'; return; }
      if (e.touches.length === 2) { eje = 'pinza'; d0 = dist(e.touches); s0 = esc; return; }
      if (e.touches.length > 2) return;
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; dx = dy = 0; eje = null; bx = tx; by = ty;
    }, { passive: true });
    stage.addEventListener('touchmove', (e) => {
      if (eje === 'boton') return;
      if (eje === 'pinza' && e.touches.length === 2) {
        esc = Math.max(1, Math.min(4, s0 * (dist(e.touches) / d0)));
        limitar(); aplicar(false);
        return;
      }
      if (e.touches.length !== 1 || eje === 'pinza') return;
      dx = e.touches[0].clientX - x0; dy = e.touches[0].clientY - y0;
      if (esc > 1) { tx = bx + dx; ty = by + dy; limitar(); aplicar(false); return; }
      if (!eje && Math.hypot(dx, dy) > 10) eje = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      img.style.transition = 'none';
      if (eje === 'x') img.style.transform = `translateX(${dx}px)`;
      if (eje === 'y' && dy > 0) {
        img.style.transform = `translateY(${dy}px)`;
        v.style.backgroundColor = `rgba(12, 14, 17, ${Math.max(0.35, 1 - dy / 400)})`;
      }
    }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (eje === 'boton') { eje = null; return; }
      if (eje === 'pinza') {
        if (e.touches.length === 0) { if (esc < 1.08) sinZoom(true); eje = null; }
        return;
      }
      const movio = Math.hypot(dx, dy) > 10;
      if (esc > 1 && movio) { eje = null; return; }
      if (eje === 'x' && Math.abs(dx) > 50 && total() > 1) {
        ir(dx > 0 ? -1 : 1);
      } else if (eje === 'y' && dy > 100) {
        cerrar();
      } else if (eje) {
        img.style.transition = reduceMotion ? 'none' : 'transform 200ms var(--ease)';
        img.style.transform = '';
        v.style.removeProperty('background-color');
      } else if (!movio && e.target === img && e.changedTouches.length) {
        const ahora = Date.now(), t = e.changedTouches[0];
        if (ahora - ultimoToque < 300) { esc > 1 ? sinZoom(true) : zoomEn(t.clientX, t.clientY); ultimoToque = 0; }
        else ultimoToque = ahora;
      }
      eje = null; dx = dy = 0;
    }, { passive: true });
    // con mouse: doble clic amplía y se arrastra para mirar
    img.addEventListener('dblclick', (e) => {
      if (Date.now() - tocoHace < 800) return; // ya lo resolvió el doble toque
      esc > 1 ? sinZoom(true) : zoomEn(e.clientX, e.clientY);
    });
    let arrastre = null, recienArrastre = false;
    img.addEventListener('mousedown', (e) => { if (esc > 1) { e.preventDefault(); arrastre = { x: e.clientX - tx, y: e.clientY - ty, movio: false }; } });
    window.addEventListener('mousemove', (e) => { if (arrastre) { arrastre.movio = true; tx = e.clientX - arrastre.x; ty = e.clientY - arrastre.y; limitar(); aplicar(false); } });
    window.addEventListener('mouseup', () => { if (arrastre?.movio) { recienArrastre = true; setTimeout(() => { recienArrastre = false; }, 0); } arrastre = null; });
    window.addEventListener('resize', () => { if (abierto && esc > 1) { limitar(); aplicar(false); } });

    return { abrir };
  };
  let visorUnico = null;
  const visor = () => (visorUnico ||= crearVisor());

  // ─── Galería: filtros, "ver más" y visor ────────────────
  const archive = $('.archive');
  if (archive) {
    visor(); // se crea ya, así la medición de WhatsApp también toma su botón
    const items   = $$('.archive__item', archive);
    const filters = $$('.filter');
    const barra   = $('.filters');
    const estado  = $('#works-status');
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

    // los números de cada filtro salen de la grilla (no hay que actualizarlos a mano)
    filters.forEach(f => {
      const n = f.dataset.cat === 'todos' ? items.length : items.filter(it => it.dataset.cat === f.dataset.cat).length;
      const s = $('.filter__n', f);
      if (s) s.textContent = String(n);
      if (!n) f.hidden = true;
    });

    const matching = () => items.filter(it => cat === 'todos' || it.dataset.cat === cat);

    const render = () => {
      const list = matching();
      items.forEach(it => { it.hidden = true; });
      list.slice(0, limit).forEach(it => { it.hidden = false; });
      const rest = list.length - limit;
      if (moreBtn) {
        moreBtn.hidden = rest <= 0;
        moreBtn.querySelector('span').textContent = `Ver ${Math.min(rest, PAGE)} más`;
      }
      if (waBtn) waBtn.href = waLink(WA_BY_CAT[cat] || 'Hola, quiero pedir un presupuesto');
    };

    const finBarra = () => barra?.classList.toggle('is-fin', barra.scrollLeft >= barra.scrollWidth - barra.clientWidth - 4);
    barra?.addEventListener('scroll', finBarra, { passive: true });
    window.addEventListener('resize', finBarra);
    finBarra();

    filters.forEach(f => f.addEventListener('click', () => {
      filters.forEach(x => x.setAttribute('aria-pressed', String(x === f)));
      cat = f.dataset.cat;
      limit = PAGE;
      render();
      // el filtro elegido queda a la vista
      if (barra) barra.scrollTo({ left: f.offsetLeft - (barra.clientWidth - f.offsetWidth) / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
      if (estado) { const n = matching().length; estado.textContent = `${n} ${n === 1 ? 'trabajo' : 'trabajos'}`; }
    }));
    moreBtn?.addEventListener('click', () => {
      const primero = matching()[limit];
      limit += PAGE;
      render();
      primero?.focus({ preventScroll: true });
    });
    render();

    // cada tarjeta es una obra: una o varias fotos
    const mini = (src) => `fotos-grilla/${src.replace(/\.[a-z]+$/i, '')}.webp`;
    const obraDe = (it) => {
      const img = $('img', it);
      let fotos = null;
      if ('fotos' in it.dataset) { try { fotos = JSON.parse(it.dataset.fotos); } catch (e) { fotos = null; } }
      if (!fotos) fotos = [{ src: it.dataset.full || img.src, alt: img.alt, tag: '' }];
      const tit = it.dataset.titulo || 'Trabajo';
      return {
        titulo: tit,
        fotos: fotos.map(f => ({ ...f, mini: mini(f.src) })),
        wa: `Hola, vi en la web el trabajo ${it.dataset.num || ''} (${tit}) y quiero pedir un presupuesto`.replace(/\s+/g, ' '),
      };
    };
    items.forEach(it => it.addEventListener('click', () => {
      const lista = matching();
      visor().abrir(lista.map(obraDe), Math.max(0, lista.indexOf(it)), 0, (i) => {
        // al cerrar, volver a la tarjeta de la obra que se estaba mirando
        const destino = lista[i];
        if (destino.hidden) { limit = Math.ceil((i + 1) / PAGE) * PAGE; render(); }
        const r = destino.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) destino.scrollIntoView({ block: 'center', behavior: 'instant' });
        return destino;
      });
    }));
  }

  // ─── Fotos de las páginas internas: tocar una la abre en grande ──
  const fotosSueltas = $$('.obras-strip__item img, .phero__photo img');
  if (!archive && fotosSueltas.length) {
    visor();
    const waHref = $('.mbar .btn--wa')?.href || waLink('Hola, quiero pedir un presupuesto');
    const obras = fotosSueltas.map(img => {
      const fc = img.closest('figure')?.querySelector('figcaption');
      const texto = fc ? (fc.children.length ? [...fc.children].map(x => x.textContent.trim()).filter(Boolean).join(' · ') : fc.textContent.trim()) : '';
      return { titulo: texto || 'Trabajo de Alumfer', fotos: [{ src: img.currentSrc || img.src, alt: img.alt }], href: waHref };
    });
    fotosSueltas.forEach((img, i) => {
      const t = img.closest('figure') || img;
      t.classList.add('ampliable');
      t.tabIndex = 0;
      t.setAttribute('role', 'button');
      t.setAttribute('aria-label', `Ampliar foto: ${img.alt}`);
      const abrir = () => visor().abrir(obras, i, 0, (k) => fotosSueltas[k].closest('figure') || fotosSueltas[k]);
      t.addEventListener('click', abrir);
      t.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); } });
    });
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
      || (el.closest('.visor') ? 'lightbox' : null)
      || (el.classList.contains('wa-float') ? 'float-button' : null)
      || 'other';
    // el origen queda en GA4; el mensaje que ve el cliente va limpio
    if (typeof gtag !== 'undefined') gtag('event', 'whatsapp_click', { event_category: 'Contact', event_label: section });
  }));
  $$('a[href^="tel:"]').forEach(el => el.addEventListener('click', () => {
    if (typeof gtag !== 'undefined') gtag('event', 'phone_click', { event_category: 'Contact', event_label: 'tel_link' });
  }));

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
    const escalonados = $$('.svc');
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
