// ============================================================
// ALUMFER — pared.js · "Probalo en tu pared"
// El cliente saca o elige una foto del lugar y ve la abertura
// encima, en perspectiva. Gestos como en las historias de
// Instagram: arrastrar para mover, pellizcar para agrandar y
// girar, esquinas para agrandar en escala (siempre recta). La foto nunca sale
// del dispositivo: todo se procesa en el navegador.
// ============================================================

(() => {
  'use strict';
  const A = window.Aberturas;
  if (!A) return;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const WA = '5491163368643';
  const MAX_FOTO = 1600;              // lado mayor de la foto de trabajo (px)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ga = (ev, extra) => { if (typeof gtag !== 'undefined') gtag('event', ev, Object.assign({ event_category: 'Pared' }, extra || {})); };

  // ── Estado ────────────────────────────────────────────────
  let foto = null;                    // ImageBitmap | HTMLImageElement
  let fotoW = 0, fotoH = 0;
  let item = { tipo: 'vent-corr-2', ancho: 150, alto: 110, color: 'blanco', vidrio: 'transparente', mosquitero: false, cantidad: 1, nota: '' };
  let luz = 1;
  let pts = [];                       // 4 esquinas normalizadas (0–1) sobre la foto: sup-izq, sup-der, inf-der, inf-izq
  let esquinas = true;
  let ui = null;
  let stageW = 0, stageH = 0;
  let raf = 0, svgDirty = true;
  let ejemplo = false;

  // ── Homografía (perspectiva de 4 puntos) ──────────────────
  function homografia(src, dst) {
    const M = [], v = [];
    for (let i = 0; i < 4; i++) {
      const [x, y] = src[i], [X, Y] = dst[i];
      M.push([x, y, 1, 0, 0, 0, -x * X, -y * X]); v.push(X);
      M.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]); v.push(Y);
    }
    // eliminación gaussiana 8×8
    for (let c = 0; c < 8; c++) {
      let p = c;
      for (let r = c + 1; r < 8; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      [M[c], M[p]] = [M[p], M[c]]; [v[c], v[p]] = [v[p], v[c]];
      const d = M[c][c] || 1e-12;
      for (let r = 0; r < 8; r++) {
        if (r === c) continue;
        const f = M[r][c] / d;
        if (!f) continue;
        for (let k = c; k < 8; k++) M[r][k] -= f * M[c][k];
        v[r] -= f * v[c];
      }
    }
    return v.map((val, i) => val / M[i][i]);
  }
  const aplicar = (h, x, y) => { const w = h[6] * x + h[7] * y + 1; return [(h[0] * x + h[1] * y + h[2]) / w, (h[3] * x + h[4] * y + h[5]) / w]; };

  // ── Construcción de la interfaz (una sola vez) ─────────────
  const ICON = {
    cerrar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    atras: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    encuadrar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    esquinas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 6 19 4l1 15-15 1z"/><circle cx="5" cy="6" r="2" fill="currentColor"/><circle cx="19" cy="4" r="2" fill="currentColor"/><circle cx="20" cy="19" r="2" fill="currentColor"/><circle cx="5" cy="20" r="2" fill="currentColor"/></svg>',
    compartir: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
    bajar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    mas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.1-.7.2l-.9 1.2c-.2.2-.4.2-.6.1a8 8 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1 2.5 5.9 5.9 0 0 0 1.2 3.1 13.4 13.4 0 0 0 5.1 4.5c1.9.8 2.6.9 3.6.7.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4l-.6-.3zM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.9 9.9 0 1 1 12 21.8zm8.4-18.3A11.8 11.8 0 0 0 1.9 17.8L.2 24l6.3-1.7a11.8 11.8 0 0 0 5.6 1.4A11.9 11.9 0 0 0 20.4 3.5z"/></svg>',
    mano: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 26V10a3 3 0 0 1 6 0v12m0-4a3 3 0 0 1 6 0v6m0-3a3 3 0 0 1 6 0v9c0 7-5 12-12 12h-2c-5 0-8-3-11-7l-5-8a3 3 0 0 1 5-3l3 3"/></svg>',
  };
  const VIDRIO_BG = {
    transparente: 'linear-gradient(135deg,#cfe3f5,#ffffff 55%,#bfd6ec)',
    esmerilado: 'radial-gradient(circle at 30% 30%,#f3f6f8,#dde4ea)',
    espejado: 'linear-gradient(135deg,#8fa4b8,#dde6ee 45%,#b9c8d5 55%,#6f869b)',
    dvh: 'linear-gradient(135deg,#cfe3f5,#ffffff 50%,#bfd6ec), linear-gradient(#fff,#fff)',
  };

  function construir() {
    const el = document.createElement('div');
    el.className = 'pe';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Probalo en tu pared');
    el.hidden = true;
    el.innerHTML = `
      <section class="pe__edit">
        <header class="pe__top">
          <button type="button" class="pe__icon" data-act="cerrar" aria-label="Cerrar">${ICON.cerrar}</button>
          <p class="pe__title">Ajustá la abertura</p>
          <button type="button" class="pe__done" data-act="listo">Listo</button>
        </header>
        <div class="pe__main">
          <div class="pe__wrap">
            <div class="pe__stage" tabindex="0" aria-label="Foto con la abertura. Arrastrá para mover; usá las flechas del teclado para moverla y + o − para cambiar el tamaño.">
              <canvas class="pe__foto" aria-hidden="true"></canvas>
              <img class="pe__ab" alt="" draggable="false">
              <svg class="pe__guia" aria-hidden="true"><polygon/></svg>
              ${[0, 1, 2, 3].map(i => `<button type="button" class="pe__h" data-i="${i}" aria-label="Esquina ${['superior izquierda', 'superior derecha', 'inferior derecha', 'inferior izquierda'][i]}"></button>`).join('')}
            </div>
            <div class="pe__coach" hidden>
              <div class="pe__coach-card">
                <span class="pe__coach-hand">${ICON.mano}</span>
                <p><b>Arrastrá</b> para moverla</p>
                <p class="pe__touch"><b>Pellizcá</b> con dos dedos para agrandar o girar</p>
                <p class="pe__mouse"><b>Rueda del mouse</b> para agrandar · <b>Shift + rueda</b> para girar</p>
                <p><b>Tirá de una esquina</b> para agrandarla o achicarla en escala</p>
                <button type="button" class="pe__pill" data-act="coach">¡Dale!</button>
              </div>
            </div>
          </div>
          <div class="pe__tools">
            <div class="pe__quick">
              <button type="button" class="pe__chipbtn" data-act="encuadrar">${ICON.encuadrar}<span>Encuadrar</span></button>
            </div>
            <div class="pe__tabs" role="tablist">
              <button type="button" role="tab" data-tab="tipo" aria-selected="true">Tipo</button>
              <button type="button" role="tab" data-tab="color" aria-selected="false">Color</button>
              <button type="button" role="tab" data-tab="vidrio" aria-selected="false">Vidrio</button>
              <button type="button" role="tab" data-tab="luz" aria-selected="false">Luz</button>
            </div>
            <div class="pe__panel" data-panel="tipo"><div class="pe__row" data-row="tipo"></div></div>
            <div class="pe__panel" data-panel="color" hidden><div class="pe__row" data-row="color"></div></div>
            <div class="pe__panel" data-panel="vidrio" hidden><div class="pe__row" data-row="vidrio"></div></div>
            <div class="pe__panel" data-panel="luz" hidden>
              <div class="pe__luz">
                <span>Más oscura</span>
                <input type="range" min="50" max="150" value="100" aria-label="Luz de la abertura">
                <span>Más clara</span>
              </div>
              <button type="button" class="pe__pill pe__pill--ghost" data-act="autoluz">Igualar a la foto</button>
            </div>
          </div>
        </div>
      </section>
      <section class="pe__res" hidden>
        <header class="pe__top">
          <button type="button" class="pe__icon" data-act="volver" aria-label="Volver a editar">${ICON.atras}</button>
          <p class="pe__title">¡Así quedaría!</p>
          <button type="button" class="pe__icon" data-act="cerrar" aria-label="Cerrar">${ICON.cerrar}</button>
        </header>
        <div class="pe__resmain">
          <figure class="pe__resfig"><img alt="Tu foto con la abertura de Alumfer"><figcaption class="mono"></figcaption></figure>
          <div class="pe__acts">
            <button type="button" class="pe__act pe__act--main" data-act="compartir">${ICON.compartir}<span>Compartir</span></button>
            <button type="button" class="pe__act" data-act="descargar">${ICON.bajar}<span>Guardar</span></button>
            <a class="pe__act pe__act--wa" data-act="wa" target="_blank" rel="noopener">${ICON.wa}<span>Mandar a Alumfer</span></a>
            <button type="button" class="pe__act" data-act="agregar">${ICON.mas}<span>Agregar al boceto</span></button>
          </div>
          <p class="pe__note">Para mandarnos la foto: tocá <b>Compartir</b> y elegí WhatsApp, o guardala y adjuntala en el chat. Es una vista ilustrativa: en la visita medimos exacto, sin cargo.</p>
        </div>
      </section>
      <div class="pe__toast" role="status" aria-live="polite"></div>`;
    document.body.appendChild(el);

    ui = {
      root: el, edit: $('.pe__edit', el), res: $('.pe__res', el),
      wrap: $('.pe__wrap', el), stage: $('.pe__stage', el), canvas: $('.pe__foto', el),
      ab: $('.pe__ab', el), guia: $('.pe__guia polygon', el), guiaSvg: $('.pe__guia', el),
      hs: $$('.pe__h', el), coach: $('.pe__coach', el), luz: $('.pe__luz input', el),
      resImg: $('.pe__resfig img', el), resCap: $('.pe__resfig figcaption', el), wa: $('[data-act="wa"]', el),
      toast: $('.pe__toast', el),
    };

    // Filas tipo "historias": círculos deslizables
    const rowTipo = $('[data-row="tipo"]', el);
    A.TIPOS.forEach(t => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pe__opt'; b.dataset.tipo = t.id;
      const mini = A.dibujar({ tipo: t.id, ancho: t.ancho, alto: t.alto, color: 'blanco', vidrio: 'transparente' }, {});
      b.innerHTML = `<span class="pe__orb pe__orb--draw">${mini}</span><span class="pe__lbl">${t.nombre.replace(/^Ventana /, '').replace(/^Puerta balcón /, 'Balcón ').replace(/^Puerta /, 'Puerta ')}</span>`;
      b.addEventListener('click', () => { item.tipo = t.id; if (!t.mosq) item.mosquitero = false; marcar(); actualizarSvg(); ga('pared_tipo', { event_label: t.id }); });
      rowTipo.appendChild(b);
    });
    const rowColor = $('[data-row="color"]', el);
    A.COLORES.forEach(c => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pe__opt'; b.dataset.color = c.id;
      const bg = c.grad ? `linear-gradient(135deg, ${c.grad[0]}, ${c.grad[1]} 45%, ${c.grad[2]})` : c.solido;
      b.innerHTML = `<span class="pe__orb" style="background:${bg}"></span><span class="pe__lbl">${c.nombre}${c.grupo === 'Anodizado' ? ' anod.' : ''}</span>`;
      b.addEventListener('click', () => { item.color = c.id; marcar(); actualizarSvg(); });
      rowColor.appendChild(b);
    });
    const rowVidrio = $('[data-row="vidrio"]', el);
    A.VIDRIOS.forEach(v => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pe__opt'; b.dataset.vidrio = v.id;
      b.innerHTML = `<span class="pe__orb pe__orb--glass${v.id === 'dvh' ? ' is-dvh' : ''}" style="background:${VIDRIO_BG[v.id]}"></span><span class="pe__lbl">${v.nombre.replace(' (doble vidriado)', '')}</span>`;
      b.addEventListener('click', () => { item.vidrio = v.id; marcar(); actualizarSvg(); });
      rowVidrio.appendChild(b);
    });
    const mosq = document.createElement('button');
    mosq.type = 'button'; mosq.className = 'pe__opt'; mosq.dataset.mosq = '1';
    mosq.innerHTML = `<span class="pe__orb pe__orb--mesh"></span><span class="pe__lbl">Mosquitero</span>`;
    mosq.addEventListener('click', () => { item.mosquitero = !item.mosquitero; marcar(); actualizarSvg(); });
    rowVidrio.appendChild(mosq);

    // tocar en cualquier parte de la ayuda la cierra (como las historias)
    ui.coach.addEventListener('click', cerrarCoach);

    // Acciones
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.dataset.act;
      if (act === 'cerrar') cerrar();
      if (act === 'coach') cerrarCoach();
      if (act === 'encuadrar') { encuadrar(); pedirRender(); }
      if (act === 'esquinas') { esquinas = !esquinas; b.setAttribute('aria-pressed', String(esquinas)); el.classList.toggle('sin-esquinas', !esquinas); }
      if (act === 'autoluz') { autoLuz(); }
      if (act === 'listo') exportar();
      if (act === 'volver') { ui.res.hidden = true; ui.edit.hidden = false; requestAnimationFrame(medir); }
      if (act === 'compartir') compartir();
      if (act === 'descargar') descargar();
      if (act === 'agregar') {
        document.dispatchEvent(new CustomEvent('pared:agregar', { detail: { ...item } }));
        aviso('Agregada a tu boceto ✓');
        ga('pared_agregar');
      }
      if (act === 'wa') ga('pared_whatsapp');
    });
    $$('.pe__tabs [role="tab"]', el).forEach(t => t.addEventListener('click', () => {
      $$('.pe__tabs [role="tab"]', el).forEach(x => x.setAttribute('aria-selected', String(x === t)));
      $$('.pe__panel', el).forEach(p => { p.hidden = p.dataset.panel !== t.dataset.tab; });
    }));
    ui.luz.addEventListener('input', () => { luz = ui.luz.value / 100; actualizarSvg(); });

    // Gestos
    gestos();
    window.addEventListener('resize', () => { if (!ui.root.hidden) requestAnimationFrame(medir); });
    document.addEventListener('keydown', (e) => {
      if (ui.root.hidden) return;
      if (e.key === 'Escape') { if (!ui.res.hidden) { ui.res.hidden = true; ui.edit.hidden = false; requestAnimationFrame(medir); } else cerrar(); }
    });
  }

  function marcar() {
    $$('[data-tipo]', ui.root).forEach(b => b.classList.toggle('is-on', b.dataset.tipo === item.tipo));
    $$('[data-color]', ui.root).forEach(b => b.classList.toggle('is-on', b.dataset.color === item.color));
    $$('[data-vidrio]', ui.root).forEach(b => b.classList.toggle('is-on', b.dataset.vidrio === item.vidrio));
    const m = $('[data-mosq]', ui.root);
    m.hidden = !A.tipo(item.tipo).mosq;
    m.classList.toggle('is-on', !!item.mosquitero);
  }

  // ── Abrir / cerrar ─────────────────────────────────────────
  function abrir() {
    if (!ui) construir();
    const yaAbierto = !ui.root.hidden;
    if (typeof window.__dzItem === 'function') item = { ...item, ...window.__dzItem() };
    ui.root.hidden = false;
    ui.res.hidden = true; ui.edit.hidden = false;
    document.documentElement.classList.add('pe-open');
    marcar();
    ui.luz.value = Math.round(luz * 100);
    requestAnimationFrame(() => {
      medir();
      if (!pts.length) encuadrar();
      actualizarSvg();
      let visto = false;
      try { visto = localStorage.getItem('alumfer-pared-coach') === '1'; } catch (_) {}
      if (!visto) ui.coach.hidden = false;
    });
    if (!yaAbierto) history.pushState({ pared: true }, '');
  }
  function cerrar() {
    if (!ui || ui.root.hidden) return;
    ui.root.hidden = true;
    document.documentElement.classList.remove('pe-open');
    if (history.state && history.state.pared) history.back();
  }
  // El botón "atrás" del celular cierra el editor, como en las apps
  window.addEventListener('popstate', () => { if (ui && !ui.root.hidden) { ui.root.hidden = true; document.documentElement.classList.remove('pe-open'); } });
  function cerrarCoach() {
    ui.coach.hidden = true;
    try { localStorage.setItem('alumfer-pared-coach', '1'); } catch (_) {}
  }
  function aviso(txt) {
    ui.toast.textContent = txt;
    ui.toast.classList.add('is-on');
    clearTimeout(aviso.t);
    aviso.t = setTimeout(() => ui.toast.classList.remove('is-on'), 2200);
  }

  // ── Foto ───────────────────────────────────────────────────
  async function cargarArchivo(file) {
    if (!file || !/^image\//.test(file.type || 'image/')) { alert('Elegí una imagen (foto JPG o PNG).'); return; }
    let bmp;
    try {
      bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (_) {
      bmp = await new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = URL.createObjectURL(file); });
    }
    const w = bmp.width || bmp.naturalWidth, h = bmp.height || bmp.naturalHeight;
    const k = Math.min(1, MAX_FOTO / Math.max(w, h));
    const c = document.createElement('canvas');
    c.width = Math.round(w * k); c.height = Math.round(h * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    if (bmp.close) bmp.close();
    usarFoto(c, false);
    ga('pared_foto');
  }

  function paredEjemplo() {
    // Pared revocada con un vano, generada en el momento (no es una foto real)
    const c = document.createElement('canvas');
    c.width = 1400; c.height = 1050;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 1400, 1050);
    grad.addColorStop(0, '#E9E2D6'); grad.addColorStop(1, '#D6CCBC');
    g.fillStyle = grad; g.fillRect(0, 0, 1400, 1050);
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},${Math.random() * 0.05})`; g.fillRect(Math.random() * 1400, Math.random() * 1050, 2, 2); }
    // luz lateral
    const luzG = g.createRadialGradient(1100, 150, 50, 1100, 150, 1100);
    luzG.addColorStop(0, 'rgba(255,248,230,0.35)'); luzG.addColorStop(1, 'rgba(0,0,0,0.12)');
    g.fillStyle = luzG; g.fillRect(0, 0, 1400, 1050);
    // vano: cielo y árbol del otro lado
    const vx = 430, vy = 260, vw = 560, vh = 420;
    const cielo = g.createLinearGradient(0, vy, 0, vy + vh);
    cielo.addColorStop(0, '#9CC6EC'); cielo.addColorStop(1, '#E4F0F8');
    g.fillStyle = cielo; g.fillRect(vx, vy, vw, vh);
    g.save(); g.beginPath(); g.rect(vx, vy, vw, vh); g.clip();
    g.fillStyle = '#6E9A5A'; g.beginPath(); g.ellipse(vx + 420, vy + vh - 40, 170, 120, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#B9A58C'; g.fillRect(vx, vy + vh - 70, vw, 70);
    g.restore();
    // jambas en sombra y alféizar
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(vx, vy, 16, vh); g.fillRect(vx, vy, vw, 14);
    g.fillStyle = '#CFC6B6'; g.fillRect(vx - 30, vy + vh, vw + 60, 26);
    g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(vx - 30, vy + vh + 26, vw + 60, 8);
    // zócalo
    g.fillStyle = '#C9BFAF'; g.fillRect(0, 990, 1400, 60);
    usarFoto(c, true, [[vx / 1400, vy / 1050], [(vx + vw) / 1400, vy / 1050], [(vx + vw) / 1400, (vy + vh) / 1050], [vx / 1400, (vy + vh) / 1050]]);
    ga('pared_ejemplo');
  }

  function usarFoto(canvas, esEjemplo, esquinasIniciales) {
    foto = canvas; fotoW = canvas.width; fotoH = canvas.height; ejemplo = esEjemplo;
    pts = esquinasIniciales || [];
    abrir();
    const ctx = ui.canvas.getContext('2d');
    ui.canvas.width = fotoW; ui.canvas.height = fotoH;
    ctx.drawImage(foto, 0, 0);
    if (!esEjemplo) setTimeout(autoLuz, 50); else { luz = 1; ui.luz.value = 100; }
  }

  // Luz automática: brillo promedio de la foto → luz de la abertura
  function autoLuz() {
    if (!foto) return;
    const s = document.createElement('canvas');
    s.width = 32; s.height = 32;
    const g = s.getContext('2d', { willReadFrequently: true });
    g.drawImage(foto, 0, 0, 32, 32);
    const d = g.getImageData(0, 0, 32, 32).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) sum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const prom = sum / (d.length / 4) / 255;           // 0–1
    luz = Math.max(0.55, Math.min(1.15, 0.5 + prom * 0.8));
    ui.luz.value = Math.round(luz * 100);
    actualizarSvg();
  }

  // ── Escenario: medidas y render ────────────────────────────
  function medir() {
    if (!fotoW) return;
    const cs = getComputedStyle(ui.wrap);
    const aw = ui.wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const ah = ui.wrap.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const k = Math.min(aw / fotoW, ah / fotoH);
    stageW = Math.round(fotoW * k); stageH = Math.round(fotoH * k);
    ui.stage.style.width = stageW + 'px';
    ui.stage.style.height = stageH + 'px';
    ui.guiaSvg.setAttribute('viewBox', `0 0 ${stageW} ${stageH}`);
    pedirRender();
  }

  function encuadrar() {
    // Rectángulo centrado con la proporción real de la abertura
    const t = A.tipo(item.tipo);
    const ratio = (item.ancho || t.ancho) / (item.alto || t.alto);
    const fr = fotoW / fotoH;
    let w = 0.5, h = (w * fr) / ratio;
    if (h > 0.6) { h = 0.6; w = (h * ratio) / fr; }
    const cx = 0.5, cy = 0.46;
    pts = [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]];
  }

  function actualizarSvg() { svgDirty = true; pedirRender(); }
  function pedirRender() { if (!raf) raf = requestAnimationFrame(render); }

  let baseW = 1000, baseH = 733;
  function render() {
    raf = 0;
    if (!ui || !pts.length) return;
    if (svgDirty) {
      svgDirty = false;
      const t = A.tipo(item.tipo);
      const W = item.ancho || t.ancho, H = item.alto || t.alto;
      baseW = 1000; baseH = Math.round(1000 * H / W);
      ui.ab.width = baseW; ui.ab.height = baseH;
      ui.ab.style.width = baseW + 'px'; ui.ab.style.height = baseH + 'px';
      ui.ab.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(A.dibujar(item, { foto: true, luz }));
    }
    const P = pts.map(([x, y]) => [x * stageW, y * stageH]);
    const h = homografia([[0, 0], [baseW, 0], [baseW, baseH], [0, baseH]], P);
    ui.ab.style.transform = `matrix3d(${h[0]},${h[3]},0,${h[6]},${h[1]},${h[4]},0,${h[7]},0,0,1,0,${h[2]},${h[5]},0,1)`;
    ui.guia.setAttribute('points', P.map(p => p.join(',')).join(' '));
    ui.hs.forEach((b, i) => { b.style.transform = `translate(${P[i][0]}px, ${P[i][1]}px)`; });
  }

  // ── Gestos: mover, pellizcar/girar, esquinas, rueda ────────
  function gestos() {
    const st = ui.stage;
    const punteros = new Map();
    let modo = null, esquina = -1, inicio = null, rect = null;

    const norm = (e) => [(e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height];
    const centro = (q) => [(q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4, (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4];
    const dentro = ([x, y]) => {
      let c = false;
      for (let i = 0, j = 3; i < 4; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
    const dos = () => { const [a, b] = [...punteros.values()]; return { c: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], d: Math.hypot((a[0] - b[0]) * stageW, (a[1] - b[1]) * stageH), ang: Math.atan2((b[1] - a[1]) * stageH, (b[0] - a[0]) * stageW) }; };
    // transforma puntos (en px) alrededor de un centro: escala + giro + traslado
    const transformar = (q, c0, c1, s, rot) => q.map(([x, y]) => {
      const dx = (x - c0[0]) * stageW, dy = (y - c0[1]) * stageH;
      const rx = (dx * Math.cos(rot) - dy * Math.sin(rot)) * s, ry = (dx * Math.sin(rot) + dy * Math.cos(rot)) * s;
      return [c1[0] + rx / stageW, c1[1] + ry / stageH];
    });

    st.addEventListener('pointerdown', (e) => {
      if (!ui.coach.hidden) cerrarCoach();
      rect = st.getBoundingClientRect();
      st.setPointerCapture(e.pointerId);
      const p = norm(e);
      punteros.set(e.pointerId, p);
      const h = e.target.closest('.pe__h');
      if (h && esquinas && punteros.size === 1) { modo = 'esquina'; esquina = +h.dataset.i; inicio = { pts: pts.map(q => q.slice()) }; st.classList.add('is-dragging'); return; }
      if (punteros.size === 2) {
        const g = dos();
        modo = 'pinch'; inicio = { pts: pts.map(q => q.slice()), ...g };
      } else if (punteros.size === 1) {
        modo = dentro(p) ? 'mover' : null;
        inicio = { pts: pts.map(q => q.slice()), p };
      }
      if (modo) st.classList.add('is-dragging');
    });
    st.addEventListener('pointermove', (e) => {
      if (!punteros.has(e.pointerId)) return;
      const p = norm(e);
      punteros.set(e.pointerId, p);
      if (modo === 'esquina') {
        // Las aberturas son rectas: la esquina agranda o achica en escala,
        // desde la esquina opuesta, sin deformar ni cambiar la proporción.
        const ancla = inicio.pts[(esquina + 2) % 4], o = inicio.pts[esquina];
        const v0 = [(o[0] - ancla[0]) * stageW, (o[1] - ancla[1]) * stageH], v = [(p[0] - ancla[0]) * stageW, (p[1] - ancla[1]) * stageH];
        const s = Math.max(0.08, (v[0] * v0[0] + v[1] * v0[1]) / ((v0[0] * v0[0] + v0[1] * v0[1]) || 1));
        pts = transformar(inicio.pts, ancla, ancla, s, 0);
      } else if (modo === 'mover') {
        const dx = p[0] - inicio.p[0], dy = p[1] - inicio.p[1];
        pts = inicio.pts.map(([x, y]) => [x + dx, y + dy]);
      } else if (modo === 'pinch' && punteros.size === 2) {
        const g = dos();
        const s = Math.max(0.15, Math.min(6, g.d / (inicio.d || 1)));
        pts = transformar(inicio.pts, inicio.c, g.c, s, g.ang - inicio.ang);
      } else return;
      pedirRender();
    });
    const fin = (e) => {
      punteros.delete(e.pointerId);
      if (punteros.size === 1 && modo === 'pinch') {
        // queda un dedo: sigue moviendo desde donde está
        const [p] = [...punteros.values()];
        modo = 'mover'; inicio = { pts: pts.map(q => q.slice()), p };
        return;
      }
      if (!punteros.size) { modo = null; esquina = -1; st.classList.remove('is-dragging'); }
    };
    st.addEventListener('pointerup', fin);
    st.addEventListener('pointercancel', fin);

    // Rueda del mouse: zoom (con Shift, gira)
    st.addEventListener('wheel', (e) => {
      e.preventDefault();
      rect = st.getBoundingClientRect();
      const c = centro(pts);
      if (e.shiftKey) pts = transformar(pts, c, c, 1, e.deltaY * 0.002);
      else pts = transformar(pts, c, c, Math.exp(-e.deltaY * 0.0015), 0);
      pedirRender();
    }, { passive: false });

    // Doble toque: vuelve a encuadrar
    st.addEventListener('dblclick', (e) => { if (e.target.closest('.pe__h')) return; encuadrar(); pedirRender(); });

    // Teclado
    st.addEventListener('keydown', (e) => {
      const paso = e.shiftKey ? 0.05 : 0.01;
      const c = centro(pts);
      const mov = { ArrowLeft: [-paso, 0], ArrowRight: [paso, 0], ArrowUp: [0, -paso], ArrowDown: [0, paso] }[e.key];
      if (mov) pts = pts.map(([x, y]) => [x + mov[0], y + mov[1]]);
      else if (e.key === '+' || e.key === '=') pts = transformar(pts, c, c, 1.05, 0);
      else if (e.key === '-') pts = transformar(pts, c, c, 0.95, 0);
      else return;
      e.preventDefault();
      pedirRender();
    });
  }

  // ── Exportar: foto + abertura en perspectiva + firma ───────
  let resultado = null; // { blob, url }
  async function exportar() {
    const listo = $('[data-act="listo"]', ui.root);
    listo.disabled = true; listo.textContent = 'Generando…';
    try {
      const t = A.tipo(item.tipo);
      const W = item.ancho || t.ancho, H = item.alto || t.alto;
      // tamaño del dibujo según lo grande que quedó en la foto
      const P = pts.map(([x, y]) => [x * fotoW, y * fotoH]);
      const lado = Math.max(Math.hypot(P[1][0] - P[0][0], P[1][1] - P[0][1]), Math.hypot(P[2][0] - P[3][0], P[2][1] - P[3][1]));
      const px = Math.max(300, Math.min(1600, Math.round(lado * 1.2)));
      const img = await cargarImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(A.dibujar(item, { foto: true, luz, px })));
      const sw = px, sh = Math.round(px * H / W);
      const src = document.createElement('canvas');
      src.width = sw; src.height = sh;
      src.getContext('2d').drawImage(img, 0, 0, sw, sh);

      const out = document.createElement('canvas');
      out.width = fotoW; out.height = fotoH;
      const g = out.getContext('2d');
      g.drawImage(foto, 0, 0);
      // sombra suave bajo la abertura (apoyo en el vano)
      g.save();
      g.beginPath(); P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
      g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = Math.max(4, lado * 0.02); g.shadowOffsetY = Math.max(2, lado * 0.008);
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fill();
      g.restore();
      g.save();
      g.beginPath(); P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
      g.clip();
      g.drawImage(foto, 0, 0); // tapa la sombra dentro del vano: el vidrio deja ver la foto
      g.restore();
      deformar(g, src, sw, sh, P);
      firma(g, out.width, out.height);

      const blob = await new Promise(ok => out.toBlob(ok, 'image/jpeg', 0.9));
      if (resultado) URL.revokeObjectURL(resultado.url);
      resultado = { blob, url: URL.createObjectURL(blob) };
      ui.resImg.src = resultado.url;
      ui.resCap.textContent = A.resumen({ ...item, cantidad: 1, nota: '' }).replace(/ · \d+ × \d+ cm/, '');
      ui.wa.href = `https://wa.me/${WA}?text=${encodeURIComponent(`Hola, probé en mi pared una ${A.resumen({ ...item, cantidad: 1, nota: '' }).replace(/ · \d+ × \d+ cm/, '').toLowerCase()} con el diseñador de alumfer.com.ar. Les mando la foto de cómo quedaría.`)}`;
      ui.edit.hidden = true; ui.res.hidden = false;
      ga('pared_listo', { event_label: item.tipo });
    } catch (err) {
      alert('No pudimos generar la imagen. Probá de nuevo o mandanos la foto por WhatsApp.');
    } finally {
      listo.disabled = false; listo.textContent = 'Listo';
    }
  }

  // Textura en perspectiva exacta: para cada píxel del destino se busca su
  // punto en el dibujo con la homografía inversa (interpolación bilineal).
  // Sin costuras, aunque el vidrio sea traslúcido.
  function deformar(g, img, sw, sh, P) {
    const W = g.canvas.width, H = g.canvas.height;
    const sx = img.getContext('2d').getImageData(0, 0, sw, sh).data;
    const inv = homografia(P, [[0, 0], [sw, 0], [sw, sh], [0, sh]]);
    const xs = P.map((q) => q[0]), ys = P.map((q) => q[1]);
    const x0 = Math.max(0, Math.floor(Math.min(...xs))), x1 = Math.min(W, Math.ceil(Math.max(...xs)));
    const y0 = Math.max(0, Math.floor(Math.min(...ys))), y1 = Math.min(H, Math.ceil(Math.max(...ys)));
    if (x1 <= x0 || y1 <= y0) return;
    const bw = x1 - x0, dst = g.getImageData(x0, y0, bw, y1 - y0), d = dst.data;
    const [a, b, c, e, f, h, m, n] = inv;
    for (let y = y0; y < y1; y++) {
      const py = y + 0.5;
      for (let x = x0; x < x1; x++) {
        const px = x + 0.5, w = m * px + n * py + 1;
        const u = (a * px + b * py + c) / w - 0.5, v = (e * px + f * py + h) / w - 0.5;
        if (u < -0.5 || v < -0.5 || u > sw - 0.5 || v > sh - 0.5) continue;
        const ux = Math.max(0, Math.min(sw - 1, u)), vy = Math.max(0, Math.min(sh - 1, v));
        const i0 = Math.floor(ux), j0 = Math.floor(vy), i1 = Math.min(sw - 1, i0 + 1), j1 = Math.min(sh - 1, j0 + 1);
        const fx = ux - i0, fy = vy - j0;
        const k00 = (j0 * sw + i0) * 4, k10 = (j0 * sw + i1) * 4, k01 = (j1 * sw + i0) * 4, k11 = (j1 * sw + i1) * 4;
        const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
        const al = (sx[k00 + 3] * w00 + sx[k10 + 3] * w10 + sx[k01 + 3] * w01 + sx[k11 + 3] * w11) / 255;
        if (al <= 0.002) continue;
        const o = ((y - y0) * bw + (x - x0)) * 4;
        for (let ch = 0; ch < 3; ch++) {
          // canales premultiplicados para que los bordes no se oscurezcan
          const pm = (sx[k00 + ch] * sx[k00 + 3] * w00 + sx[k10 + ch] * sx[k10 + 3] * w10 + sx[k01 + ch] * sx[k01 + 3] * w01 + sx[k11 + ch] * sx[k11 + 3] * w11) / 255;
          d[o + ch] = pm + d[o + ch] * (1 - al);
        }
        d[o + 3] = 255;
      }
    }
    g.putImageData(dst, x0, y0);
  }
  function firma(g, w, h) {
    const s = Math.max(1, w / 1000);
    const txt = 'ALUMFER  ·  vista ilustrativa  ·  alumfer.com.ar';
    g.font = `600 ${Math.round(15 * s)}px Archivo, Arial, sans-serif`;
    const tw = g.measureText(txt).width;
    const pad = 10 * s, x = 16 * s, y = h - 16 * s - 30 * s;
    g.fillStyle = 'rgba(13,20,28,0.72)';
    if (g.roundRect) { g.beginPath(); g.roundRect(x, y, tw + pad * 2 + 12 * s, 30 * s, 15 * s); g.fill(); } else g.fillRect(x, y, tw + pad * 2 + 12 * s, 30 * s);
    g.fillStyle = '#5AA2F0'; g.beginPath(); g.arc(x + pad + 3 * s, y + 15 * s, 4 * s, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.textBaseline = 'middle';
    g.fillText(txt, x + pad + 12 * s, y + 15.5 * s);
  }
  function cargarImg(src) {
    return new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = src; });
  }

  // ── Compartir / guardar ────────────────────────────────────
  async function compartir() {
    if (!resultado) return;
    const file = new File([resultado.blob], 'alumfer-en-mi-pared.jpg', { type: 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Así quedaría mi abertura', text: 'Probé esta abertura de Alumfer en mi pared → alumfer.com.ar/disena-tu-abertura/' });
        ga('pared_compartir');
        return;
      } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    descargar();
    aviso('Imagen guardada. Ya la podés compartir.');
  }
  function descargar() {
    if (!resultado) return;
    const a = document.createElement('a');
    a.href = resultado.url; a.download = 'alumfer-en-mi-pared.jpg';
    document.body.appendChild(a); a.click(); a.remove();
    ga('pared_descargar');
  }

  // ── Puntos de entrada en la página ─────────────────────────
  const inCam = document.createElement('input');
  inCam.type = 'file'; inCam.accept = 'image/*'; inCam.setAttribute('capture', 'environment'); inCam.hidden = true;
  const inGal = document.createElement('input');
  inGal.type = 'file'; inGal.accept = 'image/*'; inGal.hidden = true;
  document.body.append(inCam, inGal);
  [inCam, inGal].forEach(i => i.addEventListener('change', () => { const f = i.files && i.files[0]; i.value = ''; if (f) cargarArchivo(f); }));
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pared]');
    if (!b) return;
    const m = b.dataset.pared;
    if (m === 'camara') inCam.click();
    if (m === 'galeria') inGal.click();
    if (m === 'ejemplo') paredEjemplo();
    if (m === 'volver' && foto) abrir();
  });

  window.Pared = { cargarArchivo, paredEjemplo, abrir };
})();
