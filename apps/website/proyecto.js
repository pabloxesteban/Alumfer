// ============================================================
// ALUMFER — proyecto.js
// "Diseñá tu proyecto": una sola herramienta para el cliente.
// Vista 3D del lugar (pared principal, paredes de los costados,
// techo de policarbonato y piso) y un panel de 4 pasos:
// Paredes · Aberturas · Techo · Enviar.
// El modelo es el mismo del plano (plano.js): de acá salen las
// láminas técnicas, el PDF, el link para WhatsApp y el envío.
// 3D con CSS (sin librerías): cada cara es un elemento con
// matrix3d; las aberturas son los dibujos realistas de
// aberturas.js, así se ven exactamente como en el PDF en color.
// ============================================================

(function () {
  'use strict';

  const A = window.Aberturas, M = window.PlanoMotor, raiz = document.getElementById('pj');
  if (!A || !M || !raiz) return;

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmt = (n) => String(Math.round(n));
  const coma = (n, d) => n.toFixed(d).replace('.', ',');
  const ga = (ev, extra) => { if (typeof gtag !== 'undefined') gtag('event', ev, Object.assign({ event_category: 'Proyecto' }, extra || {})); };
  const pl = () => M.get();
  const leer = (k, d) => { try { return localStorage.getItem(k) || d; } catch (_) { return d; } };
  const escribir = (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} };

  const LADOS = { principal: 'Pared principal', izquierda: 'Pared izquierda', derecha: 'Pared derecha' };
  const CORTO = { principal: 'Principal', izquierda: 'Izquierda', derecha: 'Derecha' };
  const PASOS = ['Paredes', 'Aberturas', 'Techo', 'Enviar'];
  const CABS = [
    ['Tus paredes', 'Cargá el ancho y el alto de la pared. Si el lugar tiene paredes a los costados, sumalas.'],
    ['Ventanas y puertas', 'Tocá la pared en el dibujo donde va cada una, o usá el botón. Después la movés arrastrándola.'],
    ['Techo <small>(opcional)</small>', 'Si querés techar el patio o la galería, sumá un techo de policarbonato.'],
    ['Enviar', 'Revisá tu proyecto y mandánoslo para que te lo presupuestemos. Es gratis y sin compromiso.'],
  ];
  const ui = {
    stage: $('.pj-stage', raiz), v3d: $('.pj-3d', raiz), cam: $('.pj-cam', raiz), plano: $('.pj-plano', raiz),
    panel: $('.pj-panel__body', raiz), pasos: $('.pj-pasos', raiz), pie: $('.pj-panel__pie', raiz),
    toast: $('.pj-toast', raiz), coach: $('.pj-coach', raiz), marca: $('.pj-marca', raiz), cat: $('.pj-cat'), ini: $('.pj-inicio'),
  };

  // ── Estado de la herramienta ───────────────────────────────
  let paso = clamp(+leer('alumfer-proyecto-paso', '1') || 1, 1, 4);
  let selId = null;               // abertura seleccionada
  let ladoAct = 'principal';      // pared donde se agregan aberturas
  let vista = '3d';
  let catModo = 'nueva';          // catálogo: agregar o cambiar el tipo
  let lugar = null;               // punto de la pared que se tocó para agregar
  let hojaIdx = 0, hojaReal = false, hojaZoom = 1;
  const cam = { yaw: -16, pitch: 11, zoom: 1 };
  let historial = [], rehacer = [];

  // ── Modelo ─────────────────────────────────────────────────
  const fach = (lado) => pl().laminas.find((L) => L.tipo === 'fachada' && L.lado === lado);
  const techo = () => pl().laminas.find((L) => L.tipo === 'techo');
  const principal = () => fach('principal');
  const paredes = () => ['principal', 'izquierda', 'derecha'].map(fach).filter(Boolean);
  function buscar(id) {
    for (const L of paredes()) { const it = L.items.find((i) => i.id === id); if (it) return { L, it }; }
    return null;
  }
  function nuevaPared(lado, ancho) {
    const P = principal(), L = M.nuevaFachada(1);
    L.lado = lado; L.nombre = LADOS[lado];
    L.pared = { ancho: ancho || 400, alto: P ? P.pared.alto : 260 };
    if (P) { L.paredColor = P.paredColor; L.vista = P.vista; }
    return L;
  }
  function rectTecho(L) {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    L.pts.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
    return { x0, ancho: x1 - x0, salida: y1 - y0, y0 };
  }
  function setRectTecho(L, ancho, salida) {
    const r = rectTecho(L), x0 = isFinite(r.x0) ? r.x0 : 0;
    L.pts = [[x0, salida], [x0 + ancho, salida], [x0 + ancho, 0], [x0, 0]];
    L.apoyo = 0;
  }
  function setColumnas(L, n) {
    const r = rectTecho(L), out = [];
    for (let i = 0; i < n; i++) {
      const x = n === 1 ? r.x0 + r.ancho / 2 : r.x0 + 5 + (r.ancho - 10) * i / (n - 1);
      out.push({ id: M.nid(), x: Math.round(x * 10) / 10, y: 5 });
    }
    L.columnas = out;
  }
  function crearTecho() {
    const P = principal(), L = M.nuevoTecho(1);
    L.nombre = 'Techo';
    setRectTecho(L, P.pared.ancho, 300);
    L.alta = P.pared.alto; L.baja = Math.max(180, P.pared.alto - 20);
    // galería: el techo está afuera, la pared se mira desde el patio
    paredes().forEach((F) => { F.vista = 'exterior'; });
    setColumnas(L, P.pared.ancho > 450 ? 3 : 2);
    return L;
  }
  // Ordena y completa el modelo (también planos viejos del editor CAD)
  function normalizar() {
    const p = pl();
    if (!Array.isArray(p.laminas)) p.laminas = [];
    if (!p.datos) p.datos = { cliente: '', localidad: '' };
    if (!principal()) {
      const f = p.laminas.find((L) => L.tipo === 'fachada' && !L.lado);
      if (f) f.lado = 'principal'; else p.laminas.unshift(nuevaPared('principal', 400));
    }
    const P = principal();
    P.nombre = LADOS.principal;
    paredes().forEach((L) => { L.nombre = LADOS[L.lado]; L.pared.alto = P.pared.alto; L.items = L.items || []; });
    const orden = (L) => (L.tipo === 'techo' ? 9 : L.lado === 'principal' ? 0 : L.lado === 'izquierda' ? 1 : L.lado === 'derecha' ? 2 : 5);
    p.laminas.sort((a, b) => orden(a) - orden(b));
    p.activa = 0;
    if (!fach(ladoAct)) ladoAct = 'principal';
    if (selId && !buscar(selId)) selId = null;
  }

  // historial (deshacer / rehacer) y guardado
  const foto = () => JSON.stringify(pl());
  function cambio(fn, opts) {
    historial.push(foto()); if (historial.length > 80) historial.shift(); rehacer = [];
    fn(); normalizar(); M.guardar();
    refrescar(opts);
  }
  function deshacer() {
    if (!historial.length) return aviso('Nada para deshacer.');
    rehacer.push(foto()); M.set(JSON.parse(historial.pop())); normalizar(); refrescar({ encuadre: true });
  }
  function rehacerFn() {
    if (!rehacer.length) return;
    historial.push(foto()); M.set(JSON.parse(rehacer.pop())); normalizar(); refrescar({ encuadre: true });
  }
  function refrescar(opts) {
    opts = opts || {};
    pintarPanel();
    escena3d();
    if (opts.encuadre) encuadrar();
    if (vista === 'plano') pintarHoja();
    $$('[data-act="undo"]', raiz).forEach((b) => { b.disabled = !historial.length; });
  }

  // ── Avisos ─────────────────────────────────────────────────
  function aviso(t) {
    ui.toast.textContent = t; ui.toast.classList.add('is-on');
    clearTimeout(aviso.t); aviso.t = setTimeout(() => ui.toast.classList.remove('is-on'), 2800);
  }
  M.aviso = aviso;

  // ── Dibujos chicos (lista y catálogo) ──────────────────────
  function mini(it, caja) {
    const k = Math.min(caja / it.ancho, caja / it.alto);
    const w = Math.max(6, Math.round(it.ancho * k)), h = Math.max(6, Math.round(it.alto * k));
    return A.real(it, { t: 0 }).replace('<svg ', `<svg width="${w}" height="${h}" aria-hidden="true" `);
  }

  // ════════════════════════════════════════════════════════════
  //  VISTA 3D
  // ════════════════════════════════════════════════════════════
  // Mundo en cm: x a la derecha, y hacia arriba, z hacia quien mira.
  // La pared principal está en z = 0; las laterales salen hacia
  // adelante; el techo apoya en la pared principal.
  let S = 1, PERSP = 1200, C = new DOMMatrix(), centro = [0, 0, 0];
  const caras = {};    // lado/elemento → DOMMatrix de la cara (px)
  let anim = null;     // { t0, id }
  const T_ABRE = 1300, T_QUIETO = 900, T_CIERRA = 1100;

  function medidas() {
    const P = principal(), I = fach('izquierda'), D = fach('derecha'), T = techo();
    const W = P.pared.ancho, H = P.pared.alto;
    const r = T ? rectTecho(T) : null;
    const prof = Math.max(I ? I.pared.ancho : 0, D ? D.pared.ancho : 0, r ? r.salida : 0);
    return { P, I, D, T, W, H, r, prof };
  }
  // matriz de cada cara (en px, con la escala S actual)
  function matCaras() {
    const m = medidas(), { W, H } = m;
    const out = {};
    out.principal = new DOMMatrix().translate(0, -H * S, 0);
    if (m.I) out.izquierda = new DOMMatrix().translate(0, -H * S, m.I.pared.ancho * S).rotate(0, 90, 0);
    if (m.D) out.derecha = new DOMMatrix().translate(W * S, -H * S, 0).rotate(0, -90, 0);
    const fx0 = -80, fz1 = Math.max(m.prof + 140, 220);
    out.piso = { m: new DOMMatrix().translate(fx0 * S, 0, 0).rotate(90, 0, 0), w: W + 160, h: fz1 };
    if (m.T) {
      const r = m.r, caida = m.T.alta - m.T.baja, largo = Math.hypot(r.salida, caida) || 1;
      const fi = Math.atan2(r.salida, caida) * 180 / Math.PI;
      out.techo = { m: new DOMMatrix().translate(r.x0 * S, -m.T.alta * S, 0).rotate(fi, 0, 0), w: r.ancho, h: largo };
      out.sombra = { m: new DOMMatrix().translate(r.x0 * S, -0.4, 0).rotate(90, 0, 0), w: r.ancho, h: r.salida };
    }
    return out;
  }
  // Proyección: punto del mundo (cm) → pantalla (px, relativo al centro)
  function aCss(x, y, z) { return new DOMPoint(x * S, -y * S, z * S, 1); }
  function proyectar(p) {
    const q = C.transformPoint(p), f = PERSP / Math.max(1, PERSP - q.z);
    return [q.x * f, q.y * f];
  }
  function matCam() {
    C = new DOMMatrix().rotate(-cam.pitch, 0, 0).rotate(0, cam.yaw, 0).translate(-centro[0] * S, centro[1] * S, -centro[2] * S);
  }
  function caja() {
    const m = medidas(), alto = Math.max(m.H, m.T ? m.T.alta : 0);
    const pts = [];
    [-40, m.W + 40].forEach((x) => [0, alto].forEach((y) => [0, m.prof + 40].forEach((z) => pts.push([x, y, z]))));
    return pts;
  }
  // Escala para que todo entre en la vista (la perspectiva escala con S,
  // así que alcanza con medir una vez con S = 1)
  function encuadrar() {
    const r = ui.v3d.getBoundingClientRect(); if (!r.width || !principal()) return;
    const m = medidas();
    centro = [m.W / 2, Math.max(m.H, m.T ? m.T.alta : 0) * 0.46, m.prof * 0.45];
    const diag = Math.hypot(m.W + 80, m.H, m.prof + 40);
    S = 1; PERSP = diag * 3; matCam();
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    caja().forEach(([x, y, z]) => { const [a, b] = proyectar(aCss(x, y, z)); x0 = Math.min(x0, a); x1 = Math.max(x1, a); y0 = Math.min(y0, b); y1 = Math.max(y1, b); });
    const fit = Math.min(r.width * 0.86 / (x1 - x0 || 1), r.height * 0.8 / (y1 - y0 || 1));
    S = clamp(fit * cam.zoom, 0.05, 20);
    PERSP = diag * 3 * S;
    ui.v3d.style.perspective = Math.round(PERSP) + 'px';
    escena3d();
  }

  const FONDOS = { interior: 'linear-gradient(180deg,#9EC5E8 0%,#DCEAF5 60%,#9DB98A 61%,#7E9B6C 100%)', exterior: 'linear-gradient(135deg,#4A4F55,#2E3236)' };
  // va dentro de style="…": sin comillas dobles
  const LADRILLO = (s) => `url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='50' height='26'><rect width='50' height='26' fill='#B0614A'/><path d='M0 .6H50M0 13.6H50M.6 0V13M25.6 13V26' stroke='#E6D9CC' stroke-width='1.2'/></svg>`).replace(/'/g, '%27')}') 0 0/${(25 * s).toFixed(2)}px ${(13 * s).toFixed(2)}px`;

  // Una pared con espesor: la cara (con los vanos recortados), los
  // cantos que se ven y, en cada vano, jambas, la abertura metida en la
  // pared, el fondo que se ve a través del vidrio y el alféizar.
  const ESP = 15, PROF_AB = 5;   // espesor de pared y profundidad del marco (cm)
  const px = (v) => (v * S).toFixed(1);
  function cara(cls, w, h, m, estilo, attrs) {
    return `<div class="pj-cara ${cls}"${attrs || ''} style="width:${px(w)}px;height:${px(h)}px;transform:${m};${estilo || ''}"></div>`;
  }
  function htmlPared(L, lado, Mw) {
    const pc = M.pared(L.paredColor), W = L.pared.ancho, H = L.pared.alto, de = ` data-de="${lado}"`;
    const fondo = pc.id === 'ladrillo' ? LADRILLO(S) : pc.color;
    const luz = lado === 'principal' ? 1 : 0.93;
    const T = (x, y, z) => Mw.translate(x * S, y * S, z * S);
    // cara con los vanos como agujeros (evenodd)
    let d = `M0 0H${px(W)}V${px(H)}H0Z`;
    L.items.forEach((it) => { const y = H - it.ante - it.alto; d += `M${px(it.x)} ${px(y)}h${px(it.ancho)}v${px(it.alto)}h${px(-it.ancho)}Z`; });
    let s = `<div class="pj-cara pj-pared${ladoAct === lado ? ' is-activa' : ''}" data-lado="${lado}"${de} style="width:${px(W)}px;height:${px(H)}px;background:${fondo};filter:brightness(${luz});clip-path:path(evenodd,'${d}');transform:${Mw}"></div>`;
    // cantos: arriba siempre; a los costados si la pared termina libre
    const canto = `background:${pc.id === 'ladrillo' ? '#C9B8A6' : pc.color};filter:brightness(1.04)`;
    s += cara('pj-canto', W, ESP, T(0, 0, -ESP).rotate(90, 0, 0), canto, de);
    const libreIzq = lado === 'izquierda' || (lado === 'principal' && !fach('izquierda'));
    const libreDer = lado === 'derecha' || (lado === 'principal' && !fach('derecha'));
    if (libreIzq) s += cara('pj-canto', ESP, H, T(0, 0, -ESP).rotate(0, -90, 0), canto + ';filter:brightness(.9)', de);
    if (libreDer) s += cara('pj-canto', ESP, H, T(W, 0, 0).rotate(0, 90, 0), canto + ';filter:brightness(.9)', de);
    L.items.forEach((it) => {
      const t = A.tipo(it.tipo), col = A.color(it.color).solido, x = it.x, y = H - it.ante - it.alto, w = it.ancho, h = it.alto;
      const sel = it.id === selId ? ' is-sel' : '', da = `${de} data-id="${it.id}" data-lado="${lado}"`;
      // banda del marco sobre las jambas (a la profundidad de la abertura)
      const a0 = ((PROF_AB - 0.5) / ESP * 100).toFixed(1), a1 = ((PROF_AB + 4) / ESP * 100).toFixed(1);
      const rev = pc.id === 'ladrillo' ? '#D9CFC3' : pc.color;   // revoque del vano
      const banda = (dir) => `background:linear-gradient(${dir},${rev} ${a0}%,${col} ${a0}%,${col} ${a1}%,${rev} ${a1}%)`;
      // fondo: lo que se ve a través del vidrio
      s += cara('pj-ab-fondo', w, h, T(x, y, -ESP - 1), `background:${FONDOS[L.vista === 'exterior' ? 'exterior' : 'interior']}`, da);
      // jambas: arriba (más sombra), abajo, izquierda, derecha
      s += cara('pj-jamba', w, ESP, T(x, y, 0).rotate(-90, 0, 0), banda('180deg') + ';filter:brightness(.72)', da);
      s += cara('pj-jamba', w, ESP, T(x, y + h, -ESP).rotate(90, 0, 0), banda('0deg') + ';filter:brightness(.97)', da);
      s += cara('pj-jamba', ESP, h, T(x, y, 0).rotate(0, 90, 0), banda('90deg') + ';filter:brightness(.86)', da);
      s += cara('pj-jamba', ESP, h, T(x + w, y, -ESP).rotate(0, -90, 0), banda('270deg') + ';filter:brightness(.86)', da);
      // la abertura, metida en la pared
      s += `<div class="pj-cara pj-ab${sel}"${da} style="width:${px(w)}px;height:${px(h)}px;transform:${T(x, y, -PROF_AB)}"><div class="pj-ab__svg">${svgAb(it)}</div></div>`;
      // alféizar en las ventanas
      if (it.ante > 20 && t.grupo !== 'Puertas') {
        const sale = 5, ga = 4, ext = 6;
        s += cara('pj-alfeizar', w + ext * 2, sale, T(x - ext, y + h, 0).rotate(90, 0, 0), 'filter:brightness(1.03)', da);
        s += cara('pj-alfeizar', w + ext * 2, ga, T(x - ext, y + h, sale), 'filter:brightness(.82)', da);
      }
    });
    s += infoPared(L, lado, T(0, 0, 0.6));
    return s;
  }
  // Rótulo, cotas y "tocá para agregar" (sobre la pared, sin recortar)
  function infoPared(L, lado, m) {
    const W = L.pared.ancho, H = L.pared.alto, act = ladoAct === lado;
    let svg = '';
    const linea = (x1, y1, x2, y2, txt, vert) => {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, tk = 5;
      const marcas = vert ? `M${x1 - tk} ${y1}h${tk * 2}M${x2 - tk} ${y2}h${tk * 2}` : `M${x1} ${y1 - tk}v${tk * 2}M${x2} ${y2 - tk}v${tk * 2}`;
      const tx = vert ? mx - 9 : mx, ty = vert ? my : my - 9;
      return `<path d="M${x1} ${y1}L${x2} ${y2}${marcas}"/><text x="${tx}" y="${ty}"${vert ? ` transform="rotate(-90 ${tx} ${ty})"` : ''}>${txt}</text>`;
    };
    if (act) {
      svg += linea(10, H * S - 14, W * S - 10, H * S - 14, coma(W / 100, 2) + ' m');
      svg += linea(W * S - 16, 10, W * S - 16, H * S - 26, coma(H / 100, 2) + ' m', true);
    }
    const sel = selId && L.items.find((i) => i.id === selId);
    if (sel) {
      const x = sel.x * S, y = (H - sel.ante - sel.alto) * S, w = sel.ancho * S, h = sel.alto * S;
      svg += `<g class="is-sel">${linea(x, y - 12, x + w, y - 12, fmt(sel.ancho) + ' cm')}${linea(x - 12, y, x - 12, y + h, fmt(sel.alto) + ' cm', true)}</g>`;
    }
    let s = `<div class="pj-cara pj-info" data-de="${lado}" style="width:${px(W)}px;height:${px(H)}px;transform:${m}">`;
    s += `<span class="pj-pared__tag">${LADOS[lado]}</span>`;
    if (svg) s += `<svg class="pj-cotas" width="${px(W)}" height="${px(H)}">${svg}</svg>`;
    if (paso === 2 && !L.items.length) s += `<button type="button" class="pj-mas" data-mas="${lado}"><b>+</b><span>Tocá la pared para poner una ventana o puerta</span></button>`;
    return s + '</div>';
  }
  function svgAb(it) {
    const t = anim && (!anim.id || anim.id === it.id) ? tAnim() : 0;
    return M.svgAbertura(it, t).replace('<svg ', '<svg width="100%" height="100%" ');
  }
  function tAnim() {
    if (!anim) return 0;
    const e = performance.now() - anim.t0;
    if (e < T_ABRE) return e / T_ABRE;
    if (e < T_ABRE + T_QUIETO) return 1;
    if (e < T_ABRE + T_QUIETO + T_CIERRA) return 1 - (e - T_ABRE - T_QUIETO) / T_CIERRA;
    return 0;
  }

  function escena3d() {
    if (!principal()) return;
    const m = medidas(), K = matCaras();
    Object.assign(caras, K);
    let s = '';
    // piso
    const pisoT = (60 * S).toFixed(2);
    s += `<div class="pj-cara pj-piso" data-m="piso" style="width:${(K.piso.w * S).toFixed(1)}px;height:${(K.piso.h * S).toFixed(1)}px;background-size:${pisoT}px ${pisoT}px"></div>`;
    if (K.sombra) s += `<div class="pj-cara pj-sombra" data-m="sombra" style="width:${(K.sombra.w * S).toFixed(1)}px;height:${(K.sombra.h * S).toFixed(1)}px"></div>`;
    s += htmlPared(m.P, 'principal', K.principal);
    if (m.I) s += htmlPared(m.I, 'izquierda', K.izquierda);
    if (m.D) s += htmlPared(m.D, 'derecha', K.derecha);
    // columnas: cajas de 8 × 8 cm
    if (m.T) {
      const r = m.r, col = A.color(m.T.color).solido, a = 8;
      (m.T.columnas || []).forEach((c) => {
        const z = r.salida - (c.y - r.y0), x = c.x, h = m.T.baja;
        const caras4 = [
          new DOMMatrix().translate((x - a / 2) * S, -h * S, (z + a / 2) * S),
          new DOMMatrix().translate((x + a / 2) * S, -h * S, (z + a / 2) * S).rotate(0, 90, 0),
          new DOMMatrix().translate((x + a / 2) * S, -h * S, (z - a / 2) * S).rotate(0, 180, 0),
          new DOMMatrix().translate((x - a / 2) * S, -h * S, (z - a / 2) * S).rotate(0, -90, 0),
        ];
        caras4.forEach((mm, i) => { s += `<div class="pj-cara pj-col" style="width:${(a * S).toFixed(1)}px;height:${(h * S).toFixed(1)}px;background:${col};filter:brightness(${[1, 0.82, 0.7, 0.88][i]});transform:${mm}"></div>`; });
      });
      const comp = m.T.material === 'compacto', est = A.color(m.T.color).solido;
      const perf = Math.max(1.5, 4 * S).toFixed(1), sep = (105 * S).toFixed(1);
      s += `<div class="pj-cara pj-techo${comp ? ' is-compacto' : ''}" data-m="techo" style="width:${(K.techo.w * S).toFixed(1)}px;height:${(K.techo.h * S).toFixed(1)}px;border:${Math.max(2, 6 * S).toFixed(1)}px solid ${est};background-image:repeating-linear-gradient(90deg,transparent 0 ${sep}px,${est} ${sep}px ${(+sep + +perf).toFixed(1)}px),linear-gradient(160deg,rgba(181,211,236,.62),rgba(228,240,249,.5) 45%,rgba(210,229,244,.55) 55%,rgba(169,203,230,.62))"></div>`;
    }
    ui.cam.innerHTML = s;
    $$('[data-m]', ui.cam).forEach((el) => { const k = K[el.dataset.m]; el.style.transform = String(k.m || k); });
    camara();
  }
  function camara() {
    matCam();
    ui.cam.style.transform = String(C);
    // una pared vista de atrás se vuelve transparente: no tapa lo de adentro
    ['principal', 'izquierda', 'derecha'].forEach((lado) => {
      if (!caras[lado]) return;
      const T = C.multiply(caras[lado]), O = T.transformPoint(new DOMPoint(0, 0, 0)), N = T.transformPoint(new DOMPoint(0, 0, 1));
      const n = [N.x - O.x, N.y - O.y, N.z - O.z], ojo = [-O.x, -O.y, PERSP - O.z];
      ui.cam.classList.toggle('espalda-' + lado, n[0] * ojo[0] + n[1] * ojo[1] + n[2] * ojo[2] < 0);
    });
  }
  // solo redibuja las aberturas (animación)
  function repintarAberturas() {
    $$('.pj-ab', ui.cam).forEach((el) => {
      const r = buscar(el.dataset.id); if (!r) return;
      $('.pj-ab__svg', el).innerHTML = svgAb(r.it);
    });
  }
  function animar(id) {
    const hay = paredes().some((L) => L.items.length);
    if (!hay) { aviso('Primero agregá alguna ventana o puerta.'); return; }
    if (vista !== '3d') setVista('3d');
    anim = { t0: performance.now(), id: id || null };
    const paso = () => {
      if (!anim) return;
      if (performance.now() - anim.t0 > T_ABRE + T_QUIETO + T_CIERRA) { anim = null; repintarAberturas(); return; }
      repintarAberturas(); requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
    ga('proyecto_animar');
  }
  // De frente: un poco de costado para que se lea en 3D, sin dar la
  // espalda a ninguna pared lateral
  function yawFrente() { const I = fach('izquierda'), D = fach('derecha'); return I && D ? 0 : D ? 16 : -16; }
  // Gira la cámara hacia una pared
  function mirar(lado) {
    const obj = lado === 'izquierda' ? -42 : lado === 'derecha' ? 42 : yawFrente();
    const y0 = cam.yaw, t0 = performance.now();
    const f = () => {
      const k = Math.min(1, (performance.now() - t0) / 450), e = 1 - Math.pow(1 - k, 3);
      cam.yaw = y0 + (obj - y0) * e; camara();
      if (k < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }

  // Punto de pantalla → coordenadas locales (px) sobre una cara
  function sobreCara(Mf, sx, sy) {
    const T = C.multiply(Mf);
    const O = T.transformPoint(new DOMPoint(0, 0, 0)), X = T.transformPoint(new DOMPoint(1, 0, 0)), Y = T.transformPoint(new DOMPoint(0, 1, 0));
    const U = [X.x - O.x, X.y - O.y, X.z - O.z], V = [Y.x - O.x, Y.y - O.y, Y.z - O.z], P = PERSP;
    const a1 = P * U[0] + sx * U[2], b1 = P * V[0] + sx * V[2], c1 = sx * (P - O.z) - P * O.x;
    const a2 = P * U[1] + sy * U[2], b2 = P * V[1] + sy * V[2], c2 = sy * (P - O.z) - P * O.y;
    const det = a1 * b2 - a2 * b1;
    if (Math.abs(det) < 1e-9) return null;
    return [(c1 * b2 - c2 * b1) / det, (a1 * c2 - a2 * c1) / det];
  }

  function bajo(x, y) {
    return document.elementsFromPoint(x, y).find((el) => el.closest('[data-id], .pj-pared, .pj-techo')) || null;
  }
  // ── Gestos en el 3D: girar, acercar, tocar, arrastrar ──────
  function gestos() {
    const v = ui.v3d, punteros = new Map();
    let g = null;   // { modo: 'orbita'|'ab'|'pinch', ... }
    const rel = (e) => { const r = v.getBoundingClientRect(); return [e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2]; };
    v.addEventListener('pointerdown', (e) => {
      if (e.button > 0 || e.target.closest('.pj-mas')) return;
      cerrarCoach();
      punteros.set(e.pointerId, [e.clientX, e.clientY]);
      v.setPointerCapture(e.pointerId);
      if (punteros.size === 2) {
        const [a, b] = [...punteros.values()];
        g = { modo: 'pinch', d0: Math.hypot(a[0] - b[0], a[1] - b[1]), z0: cam.zoom };
        return;
      }
      // el destino del evento no respeta el vano recortado en la pared
      // (clip-path en 3D): se busca qué hay de verdad bajo el dedo
      const blanco = bajo(e.clientX, e.clientY) || e.target;
      const ab = blanco.closest('[data-id]');
      const base = { x0: e.clientX, y0: e.clientY, movio: false, blanco, punto: rel(e) };
      if (ab && buscar(ab.dataset.id)) {
        const r = buscar(ab.dataset.id), lado = r.L.lado, l0 = sobreCara(caras[lado], ...rel(e));
        g = Object.assign(base, { modo: 'ab', id: ab.dataset.id, lado, l0, x: r.it.x, ante: r.it.ante, antes: foto() });
      } else g = Object.assign(base, { modo: 'orbita', yaw: cam.yaw, pitch: cam.pitch });
    });
    v.addEventListener('pointermove', (e) => {
      if (!punteros.has(e.pointerId) || !g) return;
      punteros.set(e.pointerId, [e.clientX, e.clientY]);
      if (g.modo === 'pinch' && punteros.size === 2) {
        const [a, b] = [...punteros.values()];
        cam.zoom = clamp(g.z0 * Math.hypot(a[0] - b[0], a[1] - b[1]) / (g.d0 || 1), 0.45, 3.5);
        encuadrar(); return;
      }
      const dx = e.clientX - g.x0, dy = e.clientY - g.y0;
      if (!g.movio && Math.hypot(dx, dy) < 6) return;
      g.movio = true; v.classList.add('is-moviendo');
      if (g.modo === 'orbita') {
        cam.yaw = clamp(g.yaw + dx * 0.32, -80, 80);
        cam.pitch = clamp(g.pitch - dy * 0.22, -4, 60);
        camara();
      } else if (g.modo === 'ab' && g.l0) {
        const l = sobreCara(caras[g.lado], ...rel(e)); if (!l) return;
        const r = buscar(g.id); if (!r) return;
        const L = r.L, it = r.it;
        let nx = g.x + (l[0] - g.l0[0]) / S, na = g.ante - (l[1] - g.l0[1]) / S;
        nx = clamp(Math.round(nx), 0, Math.max(0, L.pared.ancho - it.ancho));
        na = clamp(Math.round(na), 0, Math.max(0, L.pared.alto - it.alto));
        if (na < 4) na = 0;
        // imán al centro de la pared
        const cxp = (L.pared.ancho - it.ancho) / 2;
        if (Math.abs(nx - cxp) < 6) nx = Math.round(cxp);
        if (nx !== it.x || na !== it.ante) {
          it.x = nx; it.ante = na; selId = g.id;
          if (!g.raf) g.raf = requestAnimationFrame(() => { if (g) g.raf = 0; escena3d(); });
        }
      }
    });
    const fin = (e) => {
      if (!punteros.has(e.pointerId)) return;
      punteros.delete(e.pointerId);
      v.classList.remove('is-moviendo');
      if (!g) return;
      if (g.modo === 'pinch') { if (!punteros.size) g = null; return; }
      if (g.modo === 'ab' && g.movio) {
        historial.push(g.antes); rehacer = []; M.guardar();
        seleccionar(g.id, true);
      } else if (!g.movio) tocar(g.blanco, g.punto);
      g = null;
    };
    v.addEventListener('pointerup', fin);
    v.addEventListener('pointercancel', fin);
    v.addEventListener('wheel', (e) => {
      e.preventDefault();
      cam.zoom = clamp(cam.zoom * Math.exp(-e.deltaY * 0.0012), 0.45, 3.5);
      encuadrar();
    }, { passive: false });
    v.addEventListener('click', (e) => {
      const b = e.target.closest('.pj-mas'); if (!b) return;
      ladoAct = b.dataset.mas; lugar = { lado: ladoAct, x: fach(ladoAct).pared.ancho / 2 };
      catModo = 'nueva'; abrirCatalogo();
    });
    v.addEventListener('dblclick', () => { cam.zoom = 1; cam.yaw = yawFrente(); cam.pitch = 11; encuadrar(); });
  }
  // Tocar la pared: "¿qué va acá?" y la abertura queda donde se tocó
  function tocar(el, punto) {
    const ab = el.closest && el.closest('[data-id]');
    if (ab && buscar(ab.dataset.id)) { seleccionar(ab.dataset.id); return; }
    const pared = el.closest && el.closest('.pj-pared');
    if (pared) {
      const lado = pared.dataset.lado, l = punto && sobreCara(caras[lado], ...punto);
      ladoAct = lado; selId = null;
      if (paso !== 2) irPaso(2, true);
      escena3d(); pintarPanel();
      lugar = l ? { lado, x: l[0] / S, y: fach(lado).pared.alto - l[1] / S } : null;
      catModo = 'nueva'; abrirCatalogo();
      return;
    }
    if (el.closest && el.closest('.pj-techo')) { irPaso(3); return; }
    if (selId) { selId = null; escena3d(); pintarPanel(); }
  }
  function seleccionar(id, sinMirar) {
    const r = buscar(id); if (!r) return;
    if (selId !== id) colTodos = false;
    selId = id; ladoAct = r.L.lado;
    if (paso !== 2) irPaso(2, true);
    escena3d(); pintarPanel();
    ui.panel.scrollTop = 0;
    if (!sinMirar) mirar(r.L.lado);
  }

  // ════════════════════════════════════════════════════════════
  //  PLANO TÉCNICO (láminas A4, igual que el PDF)
  // ════════════════════════════════════════════════════════════
  function pintarHoja() {
    const p = pl(); hojaIdx = clamp(hojaIdx, 0, p.laminas.length - 1);
    const tabs = p.laminas.map((L, i) => `<button type="button" data-hoja="${i}" aria-pressed="${i === hojaIdx}">${esc(L.nombre)}</button>`).join('');
    ui.plano.innerHTML = `<div class="pj-plano__bar"><div class="pj-seg" role="group" aria-label="Lámina">${tabs}</div>` +
      `<div class="pj-seg" role="group" aria-label="Versión"><button type="button" data-hreal="0" aria-pressed="${!hojaReal}">Técnico</button><button type="button" data-hreal="1" aria-pressed="${hojaReal}">En color</button></div></div>` +
      `<div class="pj-hoja" style="--z:${hojaZoom}">${M.laminaSvg(hojaIdx, { real: hojaReal })}</div>` +
      `<p class="pj-plano__nota">Así sale la hoja del PDF que nos llega. Medidas en cm.</p>`;
  }
  function setVista(v) {
    vista = v;
    raiz.classList.toggle('is-plano', v === 'plano');
    $$('[data-vista]', raiz).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.vista === v)));
    ui.plano.hidden = v !== 'plano'; ui.v3d.hidden = v === 'plano';
    if (v === 'plano') {
      const r = selId && buscar(selId);
      hojaIdx = r ? pl().laminas.indexOf(r.L) : paso === 3 && techo() ? pl().laminas.indexOf(techo()) : hojaIdx;
      pintarHoja();
    } else requestAnimationFrame(encuadrar);
    ga('proyecto_vista', { event_label: v });
  }

  // ════════════════════════════════════════════════════════════
  //  PANEL DE PASOS
  // ════════════════════════════════════════════════════════════
  const num = (k, label, v, o) => {
    o = o || {};
    const id = o.id ? ` data-id="${o.id}"` : '', d = o.paso || 5;
    return `<div class="pj-num"><label><span>${label}</span>${o.ayuda ? `<small>${o.ayuda}</small>` : ''}</label>` +
      `<div class="pj-num__ctrl"><button type="button" data-paso="${k}"${id} data-delta="${-d}" aria-label="Restar ${d}">−</button>` +
      `<span><input type="number" inputmode="numeric" step="1" data-k="${k}"${id} value="${Math.round(v)}" aria-label="${esc(label)}"><i>${o.unidad || 'cm'}</i></span>` +
      `<button type="button" data-paso="${k}"${id} data-delta="${d}" aria-label="Sumar ${d}">+</button></div></div>`;
  };
  const opt = (v, t, cur) => `<option value="${esc(v)}"${String(v) === String(cur) ? ' selected' : ''}>${esc(t)}</option>`;
  const seg = (k, opciones, cur, id) => `<div class="pj-seg" role="group">${opciones.map(([v, t]) => `<button type="button" data-set="${k}"${id ? ` data-id="${id}"` : ''} data-v="${v}" aria-pressed="${String(v) === String(cur)}">${t}</button>`).join('')}</div>`;
  const bloque = (titulo, cuerpo, ayuda) => `<section class="pj-bloque"><h3>${titulo}</h3>${ayuda ? `<p class="pj-ayuda">${ayuda}</p>` : ''}${cuerpo}</section>`;
  const COMUNES = ['blanco', 'negro', 'bronce', 'gris', 'simil-madera', 'anod-natural'];
  let colTodos = false, masOpciones = false;
  const colores = (k, cur, id) => {
    const todos = colTodos || !COMUNES.includes(cur), grupos = {};
    A.COLORES.filter((c) => todos || COMUNES.includes(c.id)).forEach((c) => { (grupos[todos ? c.grupo : 'Los más pedidos'] = grupos[todos ? c.grupo : 'Los más pedidos'] || []).push(c); });
    return Object.entries(grupos).map(([g, cs]) => `<div class="pj-colores"><span class="pj-mini">${g}</span><div>${cs.map((c) => `<button type="button" data-set="${k}"${id ? ` data-id="${id}"` : ''} data-v="${c.id}" aria-pressed="${c.id === cur}" title="${esc(c.nombre)}" aria-label="${esc(c.nombre)}"><i style="background:${c.grad ? `linear-gradient(135deg,${c.grad.join(',')})` : c.solido}"></i></button>`).join('')}</div></div>`).join('') +
      `<p class="pj-elegido">${esc(A.color(cur).grupo === 'Anodizado' ? 'Anodizado ' + A.color(cur).nombre.toLowerCase() : A.color(cur).nombre)}` +
      (todos ? '' : ` · <button type="button" class="pj-link" data-act="colores">Ver todos los colores (${A.COLORES.length})</button>`) + '</p>';
  };

  function htmlParedes() {
    const P = principal(), I = fach('izquierda'), D = fach('derecha'), pc = M.pared(P.paredColor).id;
    let s = bloque('Pared principal', `<div class="pj-grid">${num('p.ancho', 'Ancho', P.pared.ancho, { ayuda: 'De punta a punta' })}${num('p.alto', 'Alto', P.pared.alto, { ayuda: 'Del piso al techo' })}</div>`, 'Es la pared que tenés enfrente. Medila con un metro, en centímetros.');
    const lateral = (lado, L) => `<div class="pj-lat${L ? ' is-on' : ''}"><label class="pj-sw"><input type="checkbox" data-lat="${lado}"${L ? ' checked' : ''}><span class="pj-sw__ui" aria-hidden="true"></span><span>${LADOS[lado]}</span></label>` +
      (L ? num('lat.' + lado, 'Largo', L.pared.ancho, { ayuda: 'Desde la esquina hacia adelante' }) : '') + '</div>';
    s += bloque('Paredes de los costados', `<div class="pj-lats">${lateral('izquierda', I)}${lateral('derecha', D)}</div>`, 'Sumalas si llevan aberturas o si el techo se apoya en ellas. Tienen el mismo alto que la principal.');
    s += bloque('Color de las paredes', `<div class="pj-pcolor" role="group" aria-label="Color de las paredes">${M.PAREDES.map((x) => `<button type="button" data-pcolor="${x.id}" aria-pressed="${x.id === pc}"><i class="${x.id === 'ladrillo' ? 'is-ladrillo' : ''}" style="background:${x.color}"></i><span>${x.nombre}</span></button>`).join('')}</div>`, 'Sólo para que se vea parecido. No cambia el presupuesto.');
    s += bloque('¿Desde dónde la mirás?', seg('vista', [['interior', 'Desde adentro'], ['exterior', 'Desde afuera']], P.vista === 'exterior' ? 'exterior' : 'interior'), 'Así sabemos para qué lado abren las hojas.');
    return s;
  }

  function avisos(L) {
    const out = [], refs = M.referencias();
    const esComp = (a) => A.tipo(a.tipo).grupo === 'Complementos';
    L.items.forEach((a) => {
      if (a.x < -0.5 || a.x + a.ancho > L.pared.ancho + 0.5) out.push(`${refs.de(a)} se sale de la pared por el costado.`);
      if (a.ante + a.alto > L.pared.alto + 0.5) out.push(`${refs.de(a)} queda más alta que la pared.`);
    });
    L.items.forEach((a, i) => L.items.slice(i + 1).forEach((b) => {
      if (!esComp(a) && !esComp(b) && a.x < b.x + b.ancho - 0.5 && b.x < a.x + a.ancho - 0.5 && a.ante < b.ante + b.alto - 0.5 && b.ante < a.ante + a.alto - 0.5) out.push(`${refs.de(a)} y ${refs.de(b)} se superponen.`);
    }));
    return out;
  }

  function htmlAberturas() {
    const refs = M.referencias(), lados = paredes().map((L) => L.lado);
    if (selId) return htmlEditor(refs);
    let s = '';
    s += `<div class="pj-agregar">${lados.length > 1 ? `<div><span class="pj-mini">¿En qué pared?</span>${seg('lado', lados.map((l) => [l, CORTO[l]]), ladoAct)}</div>` : ''}` +
      `<button type="button" class="pj-btn pj-btn--main pj-btn--xl" data-act="catalogo">+ Agregar ventana o puerta</button></div>`;
    const total = paredes().reduce((n, L) => n + L.items.length, 0);
    if (!total) {
      s += `<p class="pj-vacio">Todavía no hay ninguna. Tocá <b>Agregar</b> y elegí qué va${lados.length > 1 ? ' en la pared marcada' : ''}. Después la podés mover con el dedo en el dibujo.</p>`;
      return s;
    }
    paredes().forEach((L) => {
      if (!L.items.length) return;
      s += `<h3 class="pj-lista__t">${LADOS[L.lado]}</h3><ul class="pj-lista">`;
      L.items.slice().sort((a, b) => a.x - b.x).forEach((it) => {
        const t = A.tipo(it.tipo);
        s += `<li><button type="button" data-sel="${it.id}"><span class="pj-lista__img">${mini(it, 40)}</span><span class="pj-lista__txt"><b>${esc(t.nombre)}</b><small>${fmt(it.ancho)} × ${fmt(it.alto)} cm · ${esc(A.color(it.color).nombre)}</small></span><em>${refs.de(it)}</em></button></li>`;
      });
      s += '</ul>';
      const av = avisos(L);
      if (av.length) s += `<ul class="pj-avisos">${av.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
    });
    s += `<div class="pj-acts"><button type="button" class="pj-btn" data-act="animar">▶ Ver cómo abren</button>${fach(ladoAct).items.length > 1 ? '<button type="button" class="pj-btn" data-act="repartir">Repartir parejo</button>' : ''}</div>`;
    s += '<p class="pj-ayuda">Tocá una abertura (acá o en el dibujo) para cambiar medidas, color o vidrio. Arrastrala en el dibujo para ubicarla.</p>';
    return s;
  }

  function htmlEditor(refs) {
    const r = buscar(selId), it = r.it, L = r.L, t = A.tipo(it.tipo), lim = A.limites(t);
    let s = `<div class="pj-ed__head"><button type="button" class="pj-volver" data-act="lista" aria-label="Volver a la lista">←</button>` +
      `<span class="pj-ed__img">${mini(it, 52)}</span><span class="pj-ed__tit"><small>${refs.de(it)} · ${LADOS[L.lado]}</small><b>${esc(t.nombre)}</b></span>` +
      `<button type="button" class="pj-btn pj-btn--sm" data-act="cambiar">Cambiar</button></div>`;
    s += bloque('Medidas del hueco', `<div class="pj-grid">${num('ancho', 'Ancho', it.ancho, { id: it.id, ayuda: `${lim.ancho[0]} a ${lim.ancho[1]} cm` })}${num('alto', 'Alto', it.alto, { id: it.id, ayuda: `${lim.alto[0]} a ${lim.alto[1]} cm` })}</div>`, 'Medí el hueco en la pared, en centímetros. Para moverla, arrastrala en el dibujo.');
    s += bloque('Color del aluminio', colores('color', it.color, it.id));
    if (!t.sinVidrio) s += bloque('Vidrio', seg('vidrio', A.VIDRIOS.map((v) => [v.id, v.nombre.replace(' (doble vidriado)', '')]), it.vidrio, it.id));
    const extras = [];
    if (t.mosq) extras.push(['mosquitero', 'Mosquitero']);
    if (M.conAcc(t)) extras.push(['reja', 'Reja'], ['postigon', 'Postigón']);
    if (extras.length) s += bloque('Agregados', `<div class="pj-chks">${extras.map(([k, n]) => `<label class="pj-chk"><input type="checkbox" data-k="${k}" data-id="${it.id}"${it[k] ? ' checked' : ''}><span>${n}</span></label>`).join('')}</div>`);
    let mas = bloque('Ubicación exacta', `<div class="pj-grid">${num('x', 'Desde la izquierda', it.x, { id: it.id, ayuda: 'Desde el borde de la pared' })}${num('ante', 'Desde el piso', it.ante, { id: it.id, ayuda: t.grupo === 'Puertas' ? 'En puertas va 0' : 'Hasta el borde de abajo' })}</div><div class="pj-acts"><button type="button" class="pj-btn pj-btn--sm" data-ab="centrar">Centrar en la pared</button></div>`);
    if (M.tieneMano(t)) mas += bloque('Bisagras', seg('mano', [['izq', 'A la izquierda'], ['der', 'A la derecha']], it.mano, it.id));
    if (M.conLinea(t)) mas += bloque('Línea de aluminio', `<select class="pj-select" data-k="linea" data-id="${it.id}">${A.LINEAS.map((l) => opt(l.id, l.nombre, it.linea || 'asesorar')).join('')}</select>`, 'Si no sabés, dejá «Que me asesoren».');
    s += `<details class="pj-masop"${masOpciones ? ' open' : ''}><summary>Más opciones <small>ubicación exacta${M.tieneMano(t) ? ', bisagras' : ''}${M.conLinea(t) ? ', línea' : ''}</small></summary>${mas}</details>`;
    s += `<div class="pj-acts pj-acts--ed"><button type="button" class="pj-btn pj-btn--main" data-act="animar" data-id="${it.id}">▶ Ver cómo abre</button>` +
      `<div class="pj-foto"><button type="button" class="pj-btn" data-act="foto" aria-expanded="false">Probar en una foto</button><div class="pj-foto__menu" hidden><button type="button" data-pared="camara">Sacar foto</button><button type="button" data-pared="galeria">Elegir de la galería</button><button type="button" data-pared="ejemplo">Pared de ejemplo</button></div></div>` +
      `<button type="button" class="pj-btn" data-ab="duplicar">Duplicar</button><button type="button" class="pj-btn pj-btn--peligro" data-ab="borrar">Quitar</button></div>`;
    const av = avisos(L).filter((x) => x.startsWith(refs.de(it)) || x.includes(' y ' + refs.de(it)));
    if (av.length) s += `<ul class="pj-avisos">${av.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    s += `<button type="button" class="pj-btn pj-btn--xl pj-listo" data-act="lista">Listo</button>`;
    return s;
  }

  function htmlTecho() {
    const T = techo();
    if (!T) {
      return `<div class="pj-techo0"><svg viewBox="0 0 200 110" aria-hidden="true"><path class="m" d="M20 10v92"/><path class="t" d="M20 26L184 40"/><path class="c" d="M176 40v62M100 33v69"/><path class="p" d="M6 102h188"/></svg>` +
        `<h3>¿Lleva techo de policarbonato?</h3><p>Opcional. Se apoya en la pared principal y sale hacia adelante, con columnas o sobre las paredes de los costados.</p>` +
        `<button type="button" class="pj-btn pj-btn--main pj-btn--xl" data-act="techo-si">+ Agregar techo</button><button type="button" class="pj-btn pj-btn--xl" data-act="siguiente">No lleva techo, seguir</button></div>`;
    }
    const r = rectTecho(T), pend = Math.max(0, M.pendiente(T)), sup = r.ancho * r.salida / 10000;
    let s = bloque('Medidas', `<div class="pj-grid">${num('t.ancho', 'Largo contra la pared', r.ancho, { ayuda: 'El lado que apoya' })}${num('t.salida', 'Cuánto sale', r.salida, { ayuda: 'Hasta el frente' })}</div>`);
    s += bloque('Alturas', `<div class="pj-grid">${num('t.alta', 'En la pared', T.alta, { ayuda: 'Desde el piso' })}${num('t.baja', 'En el frente', T.baja, { ayuda: 'Altura libre' })}</div><p class="pj-dato">Pendiente <b>${coma(pend, 1)} %</b> · Superficie <b>${coma(sup, 2)} m²</b></p>`);
    s += bloque('Columnas', num('t.col', 'Cantidad', (T.columnas || []).length, { paso: 1, unidad: 'u.', ayuda: 'Van en el frente' }), 'Poné 0 si el techo se apoya en las paredes de los costados.');
    s += bloque('Policarbonato', `<select class="pj-select" data-t="material">${M.MATERIALES.map((m) => opt(m.id, m.nombre, T.material)).join('')}</select>`);
    s += bloque('Color de la estructura', colores('t.color', T.color));
    s += bloque('Es para', `<select class="pj-select" data-t="uso">${M.USOS.map((u) => opt(u, u, T.uso)).join('')}</select>`);
    s += `<div class="pj-acts"><button type="button" class="pj-btn pj-btn--peligro" data-act="techo-no">Quitar el techo</button></div>`;
    return s;
  }

  function htmlEnviar() {
    const p = pl(), n = paredes().reduce((k, L) => k + L.items.length, 0), T = techo();
    const filas = paredes().map((L) => `<li><b>${LADOS[L.lado]}</b><span>${fmt(L.pared.ancho)} × ${fmt(L.pared.alto)} cm · ${L.items.length} abertura${L.items.length === 1 ? '' : 's'}</span></li>`).join('') +
      (T ? `<li><b>Techo</b><span>${coma(rectTecho(T).ancho * rectTecho(T).salida / 10000, 2)} m² · ${esc(M.material(T.material).nombre)}</span></li>` : '');
    let s = bloque('Tu proyecto', `<ul class="pj-resumen">${filas}</ul>${!n && !T ? '<p class="pj-avisos">Todavía no agregaste aberturas ni techo.</p>' : ''}<div class="pj-acts"><button type="button" class="pj-btn" data-vista="plano">Ver el plano técnico</button>${n ? '<button type="button" class="pj-btn" data-act="animar">▶ Ver cómo abren</button>' : ''}</div>`);
    s += bloque('Tus datos', `<div class="pj-campos"><label class="pj-campo"><span>Tu nombre</span><input type="text" data-d="cliente" value="${esc(p.datos.cliente || '')}" maxlength="60" autocomplete="name"></label><label class="pj-campo"><span>Localidad de la obra</span><input type="text" data-d="localidad" value="${esc(p.datos.localidad || '')}" maxlength="60" autocomplete="address-level2"></label></div>`, 'Salen en el rótulo del plano.');
    s += `<button type="button" class="pj-btn pj-btn--main pj-btn--xl" data-act="enviar">Enviar a Alumfer</button>`;
    s += `<p class="pj-ayuda">Nos llega el plano completo (técnico y en color) para presupuestarte. Lo mandás por WhatsApp o por email; por email te llega también una copia del PDF. Gratis y sin compromiso.</p>`;
    return s;
  }

  function pintarPanel() {
    const ae = document.activeElement;
    const foco = ae && ui.panel.contains(ae) && (ae.dataset.k || ae.dataset.d) ? `[data-${ae.dataset.k ? 'k' : 'd'}="${ae.dataset.k || ae.dataset.d}"]` : null;
    ui.pasos.innerHTML = PASOS.map((t, i) => `<button type="button" data-ir="${i + 1}" aria-current="${paso === i + 1 ? 'step' : 'false'}"><b>${i + 1}</b><span>${t}</span></button>`).join('');
    const cab = selId && paso === 2 ? '' : `<header class="pj-cab"><span class="pj-mini">Paso ${paso} de 4</span><h2>${CABS[paso - 1][0]}</h2><p>${CABS[paso - 1][1]}</p></header>`;
    ui.panel.innerHTML = cab + [htmlParedes, htmlAberturas, htmlTecho, htmlEnviar][paso - 1]();
    ui.panel.dataset.paso = paso;
    const ant = paso > 1 ? `<button type="button" class="pj-btn" data-ir="${paso - 1}">← ${PASOS[paso - 2]}</button>` : '<span></span>';
    const sig = paso < 4 ? `<button type="button" class="pj-btn pj-btn--main" data-ir="${paso + 1}">${PASOS[paso]} →</button>` : '';
    ui.pie.innerHTML = selId && paso === 2 ? '' : ant + sig;
    if (foco) { const el = $(foco, ui.panel); if (el) el.focus(); }
  }
  function irPaso(n, sinPintar) {
    paso = clamp(n, 1, 4); escribir('alumfer-proyecto-paso', String(paso));
    if (paso !== 2) selId = null;
    if (!sinPintar) { pintarPanel(); escena3d(); ui.panel.scrollTop = 0; }
    // con techo: desde arriba para verlo, desde abajo para ver las aberturas
    if (techo() && vista === '3d') { cam.pitch = paso === 3 ? Math.max(cam.pitch, 18) : paso === 2 ? Math.min(cam.pitch, 4) : cam.pitch; camara(); }
    ga('proyecto_paso', { event_label: PASOS[paso - 1] });
  }

  // ── Cambios desde el panel ─────────────────────────────────
  function valor(k, id, v) {
    const P = principal();
    if (k === 'p.ancho') {
      cambio(() => {
        const T = techo(), viejo = P.pared.ancho; P.pared.ancho = clamp(v, 50, 3000);
        if (T && Math.abs(rectTecho(T).ancho - viejo) < 1) { setRectTecho(T, P.pared.ancho, rectTecho(T).salida); setColumnas(T, (T.columnas || []).length); }
      }, { encuadre: true });
    } else if (k === 'p.alto') {
      cambio(() => { P.pared.alto = clamp(v, 100, 1000); const T = techo(); if (T && T.alta > P.pared.alto) T.alta = P.pared.alto; }, { encuadre: true });
    } else if (k.startsWith('lat.')) {
      cambio(() => { fach(k.slice(4)).pared.ancho = clamp(v, 30, 3000); }, { encuadre: true });
    } else if (k.startsWith('t.')) {
      const T = techo(), r = rectTecho(T);
      cambio(() => {
        if (k === 't.ancho') { setRectTecho(T, clamp(v, 50, 3000), r.salida); setColumnas(T, (T.columnas || []).length); }
        if (k === 't.salida') { setRectTecho(T, r.ancho, clamp(v, 30, 2000)); setColumnas(T, (T.columnas || []).length); }
        if (k === 't.alta') T.alta = clamp(v, 150, 1000);
        if (k === 't.baja') T.baja = clamp(v, 120, 1000);
        if (k === 't.col') setColumnas(T, clamp(Math.round(v), 0, 12));
      }, { encuadre: k !== 't.col' });
    } else if (id) {
      const res = buscar(id); if (!res) return;
      const { L, it } = res, t = A.tipo(it.tipo), lim = A.limites(t);
      cambio(() => {
        if (k === 'ancho') it.ancho = clamp(v, lim.ancho[0], lim.ancho[1]);
        if (k === 'alto') it.alto = clamp(v, lim.alto[0], lim.alto[1]);
        if (k === 'x') it.x = clamp(v, 0, Math.max(0, L.pared.ancho - it.ancho));
        if (k === 'ante') it.ante = clamp(v, 0, Math.max(0, L.pared.alto - it.alto));
        if (k === 'ancho' && it.x + it.ancho > L.pared.ancho) it.x = Math.max(0, L.pared.ancho - it.ancho);
        if (k === 'alto' && it.ante + it.alto > L.pared.alto) it.ante = Math.max(0, L.pared.alto - it.alto);
      });
    }
  }
  function onPanelChange(e) {
    const el = e.target;
    if (el.matches('input[type="number"][data-k]')) { valor(el.dataset.k, el.dataset.id, +el.value || 0); return; }
    if (el.matches('[data-lat]')) {
      const lado = el.dataset.lat;
      cambio(() => {
        const p = pl();
        if (el.checked) p.laminas.push(nuevaPared(lado, 300));
        else { const L = fach(lado); p.laminas.splice(p.laminas.indexOf(L), 1); if (ladoAct === lado) ladoAct = 'principal'; }
      }, { encuadre: true });
      if (el.checked) mirar(lado);
      ga('proyecto_lateral', { event_label: lado });
      return;
    }
    if (el.matches('input[type="checkbox"][data-k]')) { const r = buscar(el.dataset.id); if (r) cambio(() => { r.it[el.dataset.k] = el.checked; }); return; }
    if (el.matches('select[data-k]')) { const r = buscar(el.dataset.id); if (r) cambio(() => { r.it[el.dataset.k] = el.value; }); return; }
    if (el.matches('select[data-t]')) { const T = techo(); cambio(() => { T[el.dataset.t] = el.value; }); return; }
    if (el.matches('[data-d]')) { pl().datos[el.dataset.d] = el.value.trim(); M.guardar(); }
  }
  function onPanelClick(e) {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.paso) {
      const inp = $(`input[data-k="${b.dataset.paso}"]${b.dataset.id ? `[data-id="${b.dataset.id}"]` : ''}`, ui.panel);
      valor(b.dataset.paso, b.dataset.id, (+inp.value || 0) + +b.dataset.delta);
      return;
    }
    if (b.dataset.sel) { seleccionar(b.dataset.sel); return; }
    if (b.dataset.pcolor) { cambio(() => { paredes().forEach((L) => { L.paredColor = b.dataset.pcolor; }); }); return; }
    if (b.dataset.set) {
      const k = b.dataset.set, v = b.dataset.v;
      if (k === 'lado') { ladoAct = v; escena3d(); pintarPanel(); mirar(v); return; }
      if (k === 'vista') { cambio(() => { paredes().forEach((L) => { L.vista = v; }); }); return; }
      if (k === 't.color') { cambio(() => { techo().color = v; }); return; }
      const r = buscar(b.dataset.id); if (r) cambio(() => { r.it[k] = v; });
      return;
    }
    if (b.dataset.ab) {
      const r = buscar(selId); if (!r) return;
      const { L, it } = r;
      if (b.dataset.ab === 'centrar') cambio(() => { it.x = Math.round((L.pared.ancho - it.ancho) / 2); });
      if (b.dataset.ab === 'duplicar') {
        cambio(() => {
          const n = Object.assign({}, it, { id: M.nid() });
          n.x = it.x + it.ancho + 30;
          if (n.x + n.ancho > L.pared.ancho) n.x = Math.max(0, it.x - n.ancho - 30);
          L.items.push(n); selId = n.id;
        });
        aviso('Duplicada. Arrastrala para ubicarla.');
      }
      if (b.dataset.ab === 'borrar') { cambio(() => { L.items.splice(L.items.indexOf(it), 1); selId = null; }); aviso('Abertura quitada. Podés deshacer con ↶.'); }
      return;
    }
    acciones(b);
  }
  function acciones(b) {
    const a = b.dataset.act;
    if (b.dataset.ir) { selId = null; irPaso(+b.dataset.ir); return; }
    if (b.dataset.vista) { setVista(b.dataset.vista); return; }
    if (!a) return;
    if (a === 'catalogo') { catModo = 'nueva'; abrirCatalogo(); }
    else if (a === 'cambiar') { catModo = 'cambiar'; abrirCatalogo(); }
    else if (a === 'lista') { selId = null; pintarPanel(); escena3d(); ui.panel.scrollTop = 0; }
    else if (a === 'animar') animar(b.dataset.id);
    else if (a === 'repartir') repartir();
    else if (a === 'foto') { const m = b.nextElementSibling; m.hidden = !m.hidden; b.setAttribute('aria-expanded', String(!m.hidden)); }
    else if (a === 'techo-si') { cambio(() => { pl().laminas.push(crearTecho()); }, { encuadre: true }); cam.pitch = 20; camara(); ga('proyecto_techo'); }
    else if (a === 'techo-no') { cambio(() => { const p = pl(); p.laminas.splice(p.laminas.indexOf(techo()), 1); }, { encuadre: true }); }
    else if (a === 'siguiente') irPaso(paso + 1);
    else if (a === 'enviar') { M.abrirEnviar(); ga('proyecto_enviar'); }
    else if (a === 'undo') deshacer();
    else if (a === 'redo') rehacerFn();
    else if (a === 'centro') { cam.yaw = yawFrente(); cam.pitch = paso === 3 && techo() ? 20 : 11; cam.zoom = 1; encuadrar(); }
    else if (a === 'zoom+') { cam.zoom = clamp(cam.zoom * 1.25, 0.45, 3.5); encuadrar(); }
    else if (a === 'zoom-') { cam.zoom = clamp(cam.zoom / 1.25, 0.45, 3.5); encuadrar(); }
    else if (a === 'nuevo') abrirInicio(true);
    else if (a === 'colores') { colTodos = true; pintarPanel(); }
  }
  function repartir() {
    const L = fach(ladoAct); if (!L || L.items.length < 2) return;
    const it = L.items.slice().sort((a, b) => a.x - b.x), total = it.reduce((s, x) => s + x.ancho, 0);
    const gap = (L.pared.ancho - total) / (it.length + 1);
    if (gap < 0) { aviso('No entran todas en la pared: agrandá el ancho de la pared.'); return; }
    cambio(() => { let x = gap; it.forEach((a) => { a.x = Math.round(x); x += a.ancho + gap; }); });
    aviso('Repartidas parejo en la ' + LADOS[ladoAct].toLowerCase() + '.');
  }
  // ── Inicio guiado: "¿Qué querés armar?" ────────────────────
  function abrirInicio(hayProyecto) {
    $('[data-inicio="seguir"]', ui.ini).hidden = !hayProyecto;
    $('.pj-inicio__aviso', ui.ini).hidden = !hayProyecto;
    ui.ini.showModal();
  }
  function empezar(que) {
    cambio(() => {
      const p = M.planoVacio(); M.set(p);
      p.laminas.push(nuevaPared('principal', 400));
      if (que === 'ambiente') { p.laminas.push(nuevaPared('izquierda', 300), nuevaPared('derecha', 300)); }
      if (que === 'techo') p.laminas.push(crearTecho());
      selId = null; ladoAct = 'principal';
    }, { encuadre: true });
    historial = []; $$('[data-act="undo"]', raiz).forEach((b) => { b.disabled = true; });
    cam.yaw = yawFrente(); cam.zoom = 1;
    irPaso(que === 'techo' ? 3 : 1);
    encuadrar();
    ga('proyecto_inicio', { event_label: que });
  }

  // ── Catálogo de aberturas ──────────────────────────────────
  // qué hace cada una, en palabras simples
  const QUE_HACE = {
    corr: 'Las hojas se deslizan', abrir: 'Abre con bisagras', band: 'Abre arriba, para ventilar', oscilo: 'Abre o se inclina',
    fijo: 'No abre, deja pasar la luz', puerta: 'Con vidrio, abre con bisagras', ciega: 'Sin vidrio, abre con bisagras',
    cerramiento: 'Cierra una galería o un quincho', baranda: 'Para balcones y escaleras', 'porton-corr': 'Se desliza al costado',
    'porton-levad': 'Sube y queda arriba', 'bajo-mesada': 'Puertas para el mueble de cocina', 'mosq-corr': 'Contra insectos, se desliza',
    'mosq-fijo': 'Contra insectos, fijo', postigon: 'Hojas que cierran por fuera', reja: 'Seguridad para ventanas y puertas',
  };
  let catGrupo = 'Ventanas';
  function pintarCatalogo() {
    const grupos = [...new Set(A.TIPOS.map((t) => t.grupo))];
    $('.pj-cat__tabs', ui.cat).innerHTML = grupos.map((g) => `<button type="button" data-grupo="${g}" aria-pressed="${g === catGrupo}">${g}</button>`).join('');
    $('.pj-cat__body', ui.cat).innerHTML = `<div class="pj-cat__grid">${A.TIPOS.filter((t) => t.grupo === catGrupo).map((t) => {
      const it = { tipo: t.id, ancho: t.ancho, alto: t.alto, color: 'blanco', vidrio: 'transparente' };
      return `<button type="button" data-tipo="${t.id}"><span>${mini(it, 64)}</span><b>${esc(t.nombre)}</b><small>${esc(QUE_HACE[t.id] || QUE_HACE[t.kind] || '')}</small></button>`;
    }).join('')}</div>`;
  }
  function abrirCatalogo() {
    if (catModo === 'cambiar') { const r = buscar(selId); if (r) catGrupo = A.tipo(r.it.tipo).grupo; }
    pintarCatalogo();
    $('.pj-cat__title', ui.cat).textContent = catModo === 'cambiar' ? 'Cambiar por otra' : lugar ? '¿Qué va en esta parte de la pared?' : `¿Qué va en la ${LADOS[ladoAct].toLowerCase()}?`;
    ui.cat.showModal();
  }
  function elegirTipo(tipoId) {
    const t = A.tipo(tipoId);
    if (catModo === 'cambiar') {
      const r = buscar(selId); if (!r) return;
      cambio(() => {
        const it = r.it, lim = A.limites(t);
        it.tipo = t.id; it.ancho = clamp(it.ancho, lim.ancho[0], lim.ancho[1]); it.alto = clamp(it.alto, lim.alto[0], lim.alto[1]);
        if (t.grupo === 'Puertas' || t.antepecho === 0) it.ante = 0;
        if (it.ante + it.alto > r.L.pared.alto) it.ante = Math.max(0, r.L.pared.alto - it.alto);
      });
      return;
    }
    const L = fach(ladoAct), aca = lugar && lugar.lado === ladoAct ? lugar : null;
    lugar = null;
    // donde se tocó la pared; si no, el primer hueco libre de izquierda a derecha
    let x = 40;
    if (aca) x = clamp(Math.round(aca.x - t.ancho / 2), 0, Math.max(0, L.pared.ancho - t.ancho));
    else L.items.slice().sort((a, b) => a.x - b.x).forEach((o) => { if (x + t.ancho > o.x - 20 && x < o.x + o.ancho + 20) x = o.x + o.ancho + 40; });
    cambio(() => {
      const ult = paredes().flatMap((P) => P.items).slice(-1)[0];
      const it = M.nuevaAbertura(tipoId, x, ult ? { color: ult.color } : {});
      if (it.ante + it.alto > L.pared.alto) it.ante = Math.max(0, L.pared.alto - it.alto - 20);
      if (x + t.ancho > L.pared.ancho) { it.x = Math.max(0, Math.round((L.pared.ancho - it.ancho) / 2)); }
      L.items.push(it); selId = it.id;
    });
    ui.panel.scrollTop = 0;
    mirar(ladoAct);
    aviso('Agregada ✓ Arrastrala para moverla');
    ga('proyecto_abertura', { event_label: tipoId });
  }

  // ── Probar en una foto (pared.js) ──────────────────────────
  window.__dzItem = () => { const r = selId && buscar(selId); return r ? Object.assign({ cantidad: 1, nota: '' }, r.it) : {}; };
  document.addEventListener('pared:agregar', (e) => {
    const d = e.detail || {}, r = selId && buscar(selId);
    if (r) cambio(() => { ['tipo', 'color', 'vidrio', 'mosquitero'].forEach((k) => { if (d[k] != null) r.it[k] = d[k]; }); });
    else {
      const L = fach(ladoAct);
      const extra = { color: d.color || 'blanco', vidrio: d.vidrio || 'transparente', mosquitero: !!d.mosquitero };
      if (+d.ancho) extra.ancho = +d.ancho;
      if (+d.alto) extra.alto = +d.alto;
      cambio(() => { const it = M.nuevaAbertura(d.tipo, 40, extra); L.items.push(it); selId = it.id; });
      irPaso(2);
    }
  });

  // ── Coach (primera vez) ────────────────────────────────────
  function cerrarCoach() { if (ui.coach && !ui.coach.hidden) { ui.coach.hidden = true; escribir('alumfer-proyecto-coach', '1'); } }

  // ── Marca de agua en pantalla (también queda en las capturas) ──
  function marca() {
    if (M.taller()) { ui.marca.hidden = true; return; }
    const t = esc(M.textoMarca());
    const w = Math.max(260, t.length * 7.4 + 60);
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='150'><g font-family='Arial,sans-serif' font-size='13' font-weight='700' fill='%231B6CC8' fill-opacity='0.08' transform='rotate(-22 ${w / 2} 75)'><text x='10' y='50'>${t}</text><text x='${w / 2}' y='120'>${t}</text></g></svg>`;
    ui.marca.style.backgroundImage = `url("data:image/svg+xml,${svg.replace(/"/g, "'").replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E')}")`;
  }

  // ── Arranque ───────────────────────────────────────────────
  function migrarBoceto() {
    let lista = [];
    try { lista = JSON.parse(localStorage.getItem('alumfer-boceto-v1') || '[]'); } catch (_) {}
    if (!lista.length || leer('alumfer-boceto-migrado', '') === '1') return false;
    const L = principal();
    let x = 40;
    lista.forEach((b) => {
      for (let c = 0; c < Math.max(1, +b.cantidad || 1); c++) {
        const it = M.nuevaAbertura(b.tipo, x, { ancho: +b.ancho, alto: +b.alto, color: b.color, vidrio: b.vidrio, mosquitero: !!b.mosquitero });
        L.items.push(it); x += it.ancho + 40;
      }
    });
    L.pared.ancho = Math.max(L.pared.ancho, Math.ceil(x / 10) * 10);
    L.pared.alto = Math.max(L.pared.alto, ...L.items.map((i) => Math.ceil((i.ante + i.alto + 30) / 10) * 10));
    escribir('alumfer-boceto-migrado', '1');
    return true;
  }

  function enlazar() {
    ui.panel.addEventListener('change', onPanelChange);
    ui.panel.addEventListener('click', onPanelClick);
    ui.panel.addEventListener('pointerdown', cerrarCoach);
    ui.panel.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('input')) e.target.blur(); });
    ui.pie.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) acciones(b); });
    ui.pasos.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) acciones(b); });
    $$('.pj-tools, .pj-top', raiz).forEach((el) => el.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) acciones(b); }));
    ui.plano.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.hoja) { hojaIdx = +b.dataset.hoja; pintarHoja(); }
      if (b.dataset.hreal) { hojaReal = b.dataset.hreal === '1'; pintarHoja(); }
    });
    ui.cat.addEventListener('close', () => { lugar = null; });
    ui.ini.addEventListener('click', (e) => {
      const b = e.target.closest('[data-inicio]'); if (!b) return;
      ui.ini.close();
      if (b.dataset.inicio !== 'seguir') empezar(b.dataset.inicio);
    });
    ui.ini.addEventListener('cancel', (e) => { if ($('[data-inicio="seguir"]', ui.ini).hidden) e.preventDefault(); });
    ui.panel.addEventListener('toggle', (e) => { if (e.target.matches('.pj-masop')) masOpciones = e.target.open; }, true);
    ui.cat.addEventListener('click', (e) => {
      const gr = e.target.closest('[data-grupo]');
      if (gr) { catGrupo = gr.dataset.grupo; pintarCatalogo(); return; }
      const b = e.target.closest('[data-tipo]');
      if (b) { ui.cat.close(); elegirTipo(b.dataset.tipo); }
      else if (e.target === ui.cat || e.target.closest('[data-cerrar]')) ui.cat.close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select')) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? rehacerFn() : deshacer(); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && selId) { const r = buscar(selId); cambio(() => { r.L.items.splice(r.L.items.indexOf(r.it), 1); selId = null; }); }
      else if (e.key === 'Escape' && selId && !document.querySelector('dialog[open]')) { selId = null; pintarPanel(); escena3d(); }
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.pj-foto')) $$('.pj-foto__menu', raiz).forEach((m) => { m.hidden = true; }); });
    new ResizeObserver(() => { if (vista === '3d') encuadrar(); }).observe(ui.v3d);
    gestos();
  }

  async function iniciar() {
    const hay = await M.cargar();
    if (!hay) { const p = M.planoVacio(); p.laminas.push(nuevaPared('principal', 400)); M.set(p); }
    normalizar();
    cam.yaw = yawFrente();
    enlazar();
    let guiar = !hay;
    if (!hay && migrarBoceto()) { paso = 2; guiar = false; aviso('Pasamos tu lista de aberturas a la pared principal.'); }
    const qs = new URLSearchParams(location.search);
    if (qs.get('nuevo') === 'techo') { if (!techo()) pl().laminas.push(crearTecho()); normalizar(); paso = 3; guiar = false; }
    if (guiar) { paso = 1; setTimeout(() => abrirInicio(false), 150); }
    if (qs.has('nuevo') || qs.has('boceto')) history.replaceState(null, '', location.pathname + location.hash);
    M.guardar();
    if (leer('alumfer-proyecto-coach', '') !== '1') { ui.coach.hidden = false; setTimeout(cerrarCoach, 9000); }
    marca();
    pintarPanel();
    raiz.classList.add('is-ready');
    requestAnimationFrame(encuadrar);
    $$('[data-act="undo"]', raiz).forEach((b) => { b.disabled = true; });
  }
  iniciar();

  // para pruebas automáticas
  window.__proyecto = { get: pl, cam, sel: () => selId, paso: () => paso, proyectar: (x, y, z) => proyectar(aCss(x, y, z)), escala: () => S, encuadrar };
})();
