// ============================================================
// ALUMFER — plano.js
// "Hacé tu plano": editor CAD liviano para pedir presupuesto.
// Láminas de fachada (aberturas con cotas y planilla de
// carpinterías) y de techo (planta, corte A-A y datos).
// Un solo motor de dibujo genera primitivas en centímetros y
// tres salidas: pantalla (espacio modelo), lámina A4 a escala
// normalizada (PDF / PNG) y DXF para AutoCAD.
// Sin dependencias. Usa window.Aberturas (aberturas.js).
// ============================================================

(function () {
  'use strict';

  const A = window.Aberturas;
  const raiz = document.getElementById('cad');
  if (!A || !raiz) return;

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const WA = '5491163368643';
  const CLAVE = 'alumfer-plano-v1';
  const BOCETO = 'alumfer-boceto-v1';
  const MMPX = 4;                 // px de pantalla por mm de anotación
  const ESCALAS = [10, 20, 25, 50, 75, 100, 125, 150, 200, 250, 300, 500, 1000];
  const ga = (ev, extra) => { if (typeof gtag !== 'undefined') gtag('event', ev, Object.assign({ event_category: 'Plano' }, extra || {})); };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = (n) => String(Math.round(n));
  const coma = (n, d) => n.toFixed(d).replace('.', ',');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const n2 = (n) => Math.round(n * 100) / 100;
  const tactil = matchMedia('(pointer: coarse)').matches;

  // ── Capas (como en CAD): color en pantalla, grosor de pluma en papel, color ACI en DXF
  const CAPAS = {
    MURO:   { pant: '#E3E8EE', papel: 0.5,  aci: 7 },
    CARP:   { pant: '#56C8F5', papel: 0.35, aci: 4 },
    VIDRIO: { pant: '#3B8DB0', papel: 0.13, aci: 4 },
    APERT:  { pant: '#E8CF4A', papel: 0.13, aci: 2 },
    COTA:   { pant: '#6FD37A', papel: 0.13, aci: 3 },
    TEXTO:  { pant: '#E3E8EE', papel: 0.25, aci: 7 },
    NIVEL:  { pant: '#F06A6A', papel: 0.13, aci: 1 },
    TECHO:  { pant: '#C79BFF', papel: 0.35, aci: 6 },
    ESTR:   { pant: '#F2A65A', papel: 0.5,  aci: 30 },
    RAYADO: { pant: '#66768A', papel: 0.09, aci: 8 },
  };
  // Modo simple: lienzo claro, como papel
  const CLARO = {
    MURO: '#2B3A4A', CARP: '#1B6CC8', VIDRIO: '#8DB8E6', APERT: '#C27C0E', COTA: '#1F8A54',
    TEXTO: '#1F2933', NIVEL: '#C94444', TECHO: '#7246C9', ESTR: '#D17A22', RAYADO: '#AAB6C3',
  };
  let nivel = 'simple';
  try { nivel = localStorage.getItem('alumfer-plano-nivel') || (matchMedia('(pointer: fine)').matches ? 'simple' : 'simple'); } catch (_) {}
  const simple = () => nivel === 'simple';
  const colPant = (c) => (simple() ? CLARO[c] || CLARO.TEXTO : (CAPAS[c] || CAPAS.TEXTO).pant);
  const fondoPant = () => (simple() ? '#F7F9FB' : '#1B222B');
  const TRAZOS = { DASH: { pant: '7 5', papel: '1.6 1', dxf: 'DASHED' }, EJE: { pant: '16 4 3 4', papel: '5 1 0.6 1', dxf: 'CENTER' } };

  const MATERIALES = [
    { id: 'asesorar', nombre: 'A definir (que me asesoren)' },
    { id: 'alv-4',  nombre: 'Policarbonato alveolar 4 mm' },
    { id: 'alv-6',  nombre: 'Policarbonato alveolar 6 mm' },
    { id: 'alv-8',  nombre: 'Policarbonato alveolar 8 mm' },
    { id: 'alv-10', nombre: 'Policarbonato alveolar 10 mm' },
    { id: 'compacto', nombre: 'Policarbonato compacto' },
  ];
  const USOS = ['Galería', 'Patio', 'Quincho', 'Pérgola', 'Claraboya', 'Otro'];
  const material = (id) => MATERIALES.find((m) => m.id === id) || MATERIALES[0];

  // ── Primitivas ─────────────────────────────────────────────
  // l: línea · p: polígono/polilínea · x: texto (h en mm de papel) · c: círculo
  const Ln = (a, b, c, o) => Object.assign({ t: 'l', a, b, c }, o);
  const Pg = (p, c, o) => Object.assign({ t: 'p', p, c, cerrado: true }, o);
  const Tx = (p, s, h, c, o) => Object.assign({ t: 'x', p, s: String(s), h, c }, o);
  const Ci = (p, r, c, o) => Object.assign({ t: 'c', p, r, c }, o);

  // ── Modelo ─────────────────────────────────────────────────
  let uid = Math.floor(Math.random() * 1e6);
  const nid = () => (++uid).toString(36);

  function nuevaFachada(n) {
    return { id: nid(), tipo: 'fachada', nombre: 'Fachada ' + n, vista: 'interior', pared: { ancho: 500, alto: 270 }, items: [] };
  }
  function nuevoTecho(n) {
    return { id: nid(), tipo: 'techo', nombre: 'Techo ' + n, pts: [[0, 300], [400, 300], [400, 0], [0, 0]], apoyo: 0,
      alta: 280, baja: 250, material: 'asesorar', color: 'blanco', uso: 'Galería', columnas: [] };
  }
  function nuevaAbertura(tipoId, x, extra) {
    const t = A.tipo(tipoId);
    return Object.assign({ id: nid(), tipo: t.id, ancho: t.ancho, alto: t.alto, x: x || 0, ante: t.antepecho, color: 'blanco', vidrio: 'transparente', mosquitero: false, mano: 'izq' }, extra || {});
  }
  function planoVacio() { return { v: 1, datos: { cliente: '', localidad: '' }, laminas: [], activa: 0 }; }

  let plano = planoVacio();
  const lam = () => plano.laminas[plano.activa];

  // ── Utilidades geométricas ─────────────────────────────────
  function areaFirmada(p) { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
  function centroide(p) {
    let cx = 0, cy = 0, a = 0;
    for (let i = 0; i < p.length; i++) { const q = p[i], r = p[(i + 1) % p.length], f = q[0] * r[1] - r[0] * q[1]; a += f; cx += (q[0] + r[0]) * f; cy += (q[1] + r[1]) * f; }
    if (Math.abs(a) < 1e-6) return p[0];
    return [cx / (3 * a), cy / (3 * a)];
  }
  function bbox(pts) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    pts.forEach(([x, y]) => { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; });
    return { x0, y0, x1, y1 };
  }
  function distSeg(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1;
    const t = clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2, 0, 1);
    return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
  }
  function dentro(p, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if (((yi > p[1]) !== (yj > p[1])) && (p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi)) c = !c;
    }
    return c;
  }
  // Rayado (sombreado) de un polígono: líneas paralelas a "ang" grados, separadas "esp"
  function rayado(poly, ang, esp) {
    const r = ang * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r);
    const rot = poly.map(([x, y]) => [x * cs + y * sn, -x * sn + y * cs]);
    const b = bbox(rot), out = [];
    if (!(esp > 0) || (b.y1 - b.y0) / esp > 600) return out;
    for (let y = Math.ceil(b.y0 / esp) * esp; y < b.y1; y += esp) {
      const xs = [];
      for (let i = 0; i < rot.length; i++) {
        const p = rot[i], q = rot[(i + 1) % rot.length];
        if ((p[1] <= y) !== (q[1] <= y)) xs.push(p[0] + (y - p[1]) * (q[0] - p[0]) / (q[1] - p[1]));
      }
      xs.sort((m, n) => m - n);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        out.push([[xs[i] * cs - y * sn, xs[i] * sn + y * cs], [xs[i + 1] * cs - y * sn, xs[i + 1] * sn + y * cs]]);
      }
    }
    return out;
  }

  // Cota alineada entre a y b. off en mm de papel: positivo = a la izquierda de a→b.
  function cota(P, a, b, off, k, txt, o) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
    if (L < 0.5) return;
    const ux = dx / L, uy = dy / L, nx = -uy, ny = ux, sg = Math.sign(off) || 1;
    const d = off / k, gap = (o && o.desde != null ? o.desde : 1.2) / k, sobre = 1.6 / k * sg;
    const a2 = [a[0] + nx * d, a[1] + ny * d], b2 = [b[0] + nx * d, b[1] + ny * d];
    P.push(Ln([a[0] + nx * gap * sg, a[1] + ny * gap * sg], [a2[0] + nx * sobre, a2[1] + ny * sobre], 'COTA'));
    P.push(Ln([b[0] + nx * gap * sg, b[1] + ny * gap * sg], [b2[0] + nx * sobre, b2[1] + ny * sobre], 'COTA'));
    P.push(Ln([a2[0] - ux * 1.2 / k, a2[1] - uy * 1.2 / k], [b2[0] + ux * 1.2 / k, b2[1] + uy * 1.2 / k], 'COTA'));
    const tk = 1.1 / k, tx = (ux + nx) * tk, ty = (uy + ny) * tk;
    [a2, b2].forEach((q) => P.push(Ln([q[0] - tx, q[1] - ty], [q[0] + tx, q[1] + ty], 'COTA', { grueso: true })));
    let ang = Math.atan2(dy, dx) * 180 / Math.PI;
    if (ang > 90.5 || ang <= -89.5) ang += 180;
    const h = 2.2, sep = (1.0 + h / 2) / k * sg;
    // el texto va del lado de afuera de la línea de cota
    P.push(Tx([(a2[0] + b2[0]) / 2 + nx * sep, (a2[1] + b2[1]) / 2 + ny * sep], txt != null ? txt : fmt(L), h, 'COTA', { rot: ang, al: 'middle' }));
  }

  // Marca de referencia (V1, P1…) en un círculo
  function marca(P, p, ref, k) {
    P.push(Ci(p, 3.2 / k, 'TEXTO'));
    P.push(Tx(p, ref, 2.4, 'TEXTO', { al: 'middle', negrita: true }));
  }

  // ── Geometría CAD de cada abertura (elevación) ─────────────
  // Coordenadas locales: origen arriba a la izquierda, y hacia abajo (cm).
  function geoAbertura(it) {
    const t = A.tipo(it.tipo), W = +it.ancho, H = +it.alto;
    const F = clamp(Math.min(W, H) * 0.045, 3, 6), S = Math.max(2.5, F * 0.75);
    const g = [];
    const R = (x, y, w, h, c, o) => g.push(Pg([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], c, o));
    const Lr = (a, b, c, o) => g.push(Ln(a, b, c, o));
    const hoja = (x, y, w, h) => { R(x, y, w, h, 'CARP'); R(x + S, y + S, w - 2 * S, h - 2 * S, 'VIDRIO'); };
    const tri = (x, y, w, h, lado) => {
      let p;
      if (lado === 'izq') p = [[x + w, y], [x, y + h / 2], [x + w, y + h]];
      else if (lado === 'der') p = [[x, y], [x + w, y + h / 2], [x, y + h]];
      else p = [[x, y], [x + w / 2, y + h], [x + w, y]];
      g.push(Pg(p, 'APERT', { cerrado: false, trazo: 'DASH' }));
    };
    const flecha = (x, y, dir, l) => { const a = l * 0.3; Lr([x, y], [x + dir * l, y], 'APERT'); Lr([x + dir * l, y], [x + dir * (l - a), y - a], 'APERT'); Lr([x + dir * l, y], [x + dir * (l - a), y + a], 'APERT'); };

    R(0, 0, W, H, 'CARP');
    const ix = F, iy = F, iw = W - 2 * F, ih = H - 2 * F, n = t.hojas;
    if (t.kind === 'corr') {
      const hw = iw / n;
      for (let i = 0; i < n; i++) hoja(ix + i * hw - (i > 0 ? S * 0.5 : 0), iy, hw + (i > 0 && i < n - 1 ? S : S * 0.5), ih);
      const l = clamp(hw * 0.28, 6, 30);
      for (let j = 0; j < n; j++) {
        const cx = ix + j * hw + hw / 2, cy = iy + ih / 2;
        const dir = (n % 2 === 1 && j === (n - 1) / 2) ? 0 : (j < n / 2 ? 1 : -1);
        if (dir === 0) { flecha(cx, cy, 1, l * 0.8); flecha(cx, cy, -1, l * 0.8); } else flecha(cx - dir * l / 2, cy, dir, l);
      }
      if (it.mosquitero && t.mosq) R(ix + (n - 1) * hw + S * 0.6, iy + S * 0.6, hw - S * 1.2, ih - S * 1.2, 'APERT', { trazo: 'DASH' });
    } else if (t.kind === 'abrir' || t.kind === 'puerta' || t.kind === 'ciega') {
      const aw = iw / n;
      for (let k = 0; k < n; k++) {
        const hx = ix + k * aw;
        const lado = n === 1 ? (it.mano === 'der' ? 'der' : 'izq') : (k === 0 ? 'izq' : 'der');
        if (t.kind === 'ciega') {
          R(hx, iy, aw, ih, 'CARP');
          R(hx + aw * 0.16, iy + ih * 0.07, aw * 0.68, ih * 0.38, 'VIDRIO'); R(hx + aw * 0.16, iy + ih * 0.52, aw * 0.68, ih * 0.4, 'VIDRIO');
          tri(hx + S, iy + S, aw - 2 * S, ih - 2 * S, lado);
        } else if (t.kind === 'puerta') {
          const tr = ih * 0.6;
          R(hx, iy, aw, ih, 'CARP');
          R(hx + S, iy + S, aw - 2 * S, tr - S * 1.5, 'VIDRIO');
          R(hx + S, iy + tr + S * 0.5, aw - 2 * S, ih - tr - S * 1.5, 'CARP');
          tri(hx + S, iy + S, aw - 2 * S, ih - 2 * S, lado);
        } else {
          hoja(hx, iy, aw, ih);
          tri(hx + S, iy + S, aw - 2 * S, ih - 2 * S, lado);
        }
      }
      if (it.mosquitero && t.mosq) R(ix + S * 0.6, iy + S * 0.6, iw - S * 1.2, ih - S * 1.2, 'APERT', { trazo: 'DASH' });
    } else if (t.kind === 'band') {
      hoja(ix, iy, iw, ih); tri(ix + S, iy + S, iw - 2 * S, ih - 2 * S, 'abajo');
    } else if (t.kind === 'oscilo') {
      hoja(ix, iy, iw, ih);
      tri(ix + S, iy + S, iw - 2 * S, ih - 2 * S, it.mano === 'der' ? 'der' : 'izq');
      tri(ix + S, iy + S, iw - 2 * S, ih - 2 * S, 'abajo');
    } else if (t.kind === 'fijo') {
      R(ix, iy, iw, ih, 'VIDRIO');
      Lr([ix + iw * 0.15, iy + ih * 0.5], [ix + iw * 0.85, iy + ih * 0.5], 'APERT', { trazo: 'DASH' });
    } else if (t.kind === 'baranda') {
      g.length = 0;
      const np = Math.max(1, Math.ceil(W / 120));
      R(-1, 0, W + 2, 6, 'CARP'); R(0, H - 4, W, 4, 'CARP');
      for (let q = 0; q <= np; q++) R(clamp(q * W / np - 2.25, 0, W - 4.5), 0, 4.5, H, 'CARP');
      for (let q = 0; q < np; q++) R(q * W / np + 3.5, 8, W / np - 7, H - 14, 'VIDRIO');
    } else if (t.kind === 'porton' || t.kind === 'levadizo') {
      R(S, S, W - 2 * S, H - 2 * S, 'VIDRIO');
      if (t.kind === 'porton') { for (let y = 10; y < H - 4; y += 10) Lr([S, y], [W - S, y], 'RAYADO'); flecha(W * 0.4, H * 0.5, 1, clamp(W * 0.2, 10, 60)); }
      else {
        for (let q = 1; q < 4; q++) Lr([0, H * q / 4], [W, H * q / 4], 'CARP');
        const l = clamp(H * 0.25, 10, 50), x = W / 2, y = H * 0.62;
        Lr([x, y], [x, y - l], 'APERT'); Lr([x, y - l], [x - l * 0.3, y - l * 0.7], 'APERT'); Lr([x, y - l], [x + l * 0.3, y - l * 0.7], 'APERT');
      }
    } else if (t.kind === 'mueble') {
      g.length = 0;
      R(-2, 0, W + 4, 4, 'MURO');
      R(0, 4, W / 2, H - 4, 'CARP'); R(W / 2, 4, W / 2, H - 4, 'CARP');
      tri(2, 6, W / 2 - 4, H - 8, 'izq'); tri(W / 2 + 2, 6, W / 2 - 4, H - 8, 'der');
    } else if (t.kind === 'mosq') {
      const fm = Math.max(2, F * 0.6);
      R(fm, fm, W - 2 * fm, H - 2 * fm, 'VIDRIO');
      rayado([[fm, fm], [W - fm, fm], [W - fm, H - fm], [fm, H - fm]], 0, 6).concat(rayado([[fm, fm], [W - fm, fm], [W - fm, H - fm], [fm, H - fm]], 90, 6)).forEach((q) => Lr(q[0], q[1], 'RAYADO'));
      if (n === 2) { Lr([W / 2, fm], [W / 2, H - fm], 'CARP'); flecha(W * 0.25, H * 0.5, 1, clamp(W * 0.12, 6, 25)); }
    } else if (t.kind === 'postigon') {
      g.length = 0;
      R(0, 0, W / 2, H, 'CARP'); R(W / 2, 0, W / 2, H, 'CARP');
      for (let y = 6; y < H - 2; y += 6) { Lr([2, y], [W / 2 - 2, y], 'RAYADO'); Lr([W / 2 + 2, y], [W - 2, y], 'RAYADO'); }
      tri(2, 2, W / 2 - 4, H - 4, 'izq'); tri(W / 2 + 2, 2, W / 2 - 4, H - 4, 'der');
    } else if (t.kind === 'reja') {
      R(3, 3, W - 6, H - 6, 'CARP');
      const nb = Math.max(2, Math.round(W / 12));
      for (let q = 1; q < nb; q++) Lr([q * W / nb, 0], [q * W / nb, H], 'CARP');
      Lr([0, H * 0.33], [W, H * 0.33], 'CARP'); Lr([0, H * 0.66], [W, H * 0.66], 'CARP');
    }
    // accesorios: reja por delante y postigones (abiertos, a los costados)
    if (!t.sinAcc && it.reja) {
      const nb = Math.max(2, Math.round(W / 12));
      for (let q = 1; q < nb; q++) Lr([q * W / nb, 0], [q * W / nb, H], 'ESTR');
      Lr([0, H * 0.33], [W, H * 0.33], 'ESTR'); Lr([0, H * 0.66], [W, H * 0.66], 'ESTR');
    }
    if (!t.sinAcc && it.postigon) { R(-W / 2 - 1, 0, W / 2, H, 'ESTR', { trazo: 'DASH' }); R(W + 1, 0, W / 2, H, 'ESTR', { trazo: 'DASH' }); }
    return g;
  }
  // Lleva primitivas locales (y hacia abajo) a un destino: f([x,y]) → [x,y]
  function mapear(prims, f) {
    return prims.map((q) => {
      const o = Object.assign({}, q);
      if (q.t === 'l') { o.a = f(q.a); o.b = f(q.b); }
      else if (q.t === 'p') o.p = q.p.map(f);
      else o.p = f(q.p);
      return o;
    });
  }
  const tieneMano = (t) => (t.kind === 'abrir' || t.kind === 'puerta' || t.kind === 'oscilo' || t.kind === 'ciega') && t.hojas === 1;
  const conAcc = (t) => !t.sinAcc && (t.grupo === 'Ventanas' || t.grupo === 'Puertas');
  const conLinea = (t) => t.grupo === 'Ventanas' || t.grupo === 'Puertas' || t.id === 'cerramiento';
  const esComp = (it) => A.tipo(it.tipo).grupo === 'Complementos';
  const PREFIJO = { Ventanas: 'V', Puertas: 'P', Cerramientos: 'C', Complementos: 'A' };

  // ── Referencias de carpintería (V1, P1…) para todo el plano ──
  function claveItem(it) { const t = A.tipo(it.tipo); return [it.tipo, Math.round(it.ancho), Math.round(it.alto), it.color, t.sinVidrio ? '' : it.vidrio, it.mosquitero && t.mosq ? 1 : 0, tieneMano(t) ? it.mano : '', conLinea(t) ? it.linea || 'asesorar' : '', conAcc(t) && it.reja ? 1 : 0, conAcc(t) && it.postigon ? 1 : 0].join('|'); }
  function referencias() {
    const map = new Map(), cuenta = { V: 0, P: 0, C: 0, A: 0 };
    plano.laminas.forEach((L) => {
      if (L.tipo !== 'fachada') return;
      L.items.slice().sort((a, b) => a.x - b.x).forEach((it) => {
        const k = claveItem(it);
        if (!map.has(k)) { const pre = PREFIJO[A.tipo(it.tipo).grupo] || 'V'; map.set(k, pre + (++cuenta[pre])); }
      });
    });
    return { de: (it) => map.get(claveItem(it)) || '?' };
  }
  function planilla(L, refs) {
    const filas = new Map();
    L.items.slice().sort((a, b) => a.x - b.x).forEach((it) => {
      const r = refs.de(it);
      if (!filas.has(r)) filas.set(r, { ref: r, it, cant: 0, antes: new Set() });
      const f = filas.get(r); f.cant++; f.antes.add(Math.round(it.ante));
    });
    const orden = 'VPCA';
    return [...filas.values()].sort((a, b) => (a.ref[0] === b.ref[0] ? +a.ref.slice(1) - +b.ref.slice(1) : orden.indexOf(a.ref[0]) - orden.indexOf(b.ref[0])));
  }
  function detalleItem(it) {
    const t = A.tipo(it.tipo), c = A.color(it.color), v = A.vidrio(it.vidrio);
    const p = [c.grupo === 'Anodizado' ? 'Anodizado ' + c.nombre.toLowerCase() : c.nombre];
    if (!t.sinVidrio) p.push('vidrio ' + v.nombre.replace(' (doble vidriado)', '').toLowerCase().replace('dvh', 'DVH'));
    if (conLinea(t) && it.linea && it.linea !== 'asesorar') p.push('línea ' + A.linea(it.linea).nombre);
    if (it.mosquitero && t.mosq) p.push('c/ mosquitero');
    if (conAcc(t) && it.reja) p.push('c/ reja');
    if (conAcc(t) && it.postigon) p.push('c/ postigón');
    if (tieneMano(t)) p.push('abre ' + (it.mano === 'der' ? 'der.' : 'izq.'));
    return p.join(' · ');
  }

  // ── Escena: fachada ─────────────────────────────────────────
  function escenaFachada(L, k, ctx) {
    const P = [], W = L.pared.ancho, H = L.pared.alto, refs = ctx.refs;
    P.push(Pg([[0, 0], [W, 0], [W, H], [0, H]], 'MURO', { real: 'pared' }));
    const ext = 18 + 4 / k;
    P.push(Ln([-ext, 0], [W + ext, 0], 'MURO', { grueso: true }));
    rayado([[-ext, 0], [W + ext, 0], [W + ext, -2.5 / k], [-ext, -2.5 / k]], 45, 1.3 / k).forEach((s) => P.push(Ln(s[0], s[1], 'RAYADO')));
    // nivel de piso terminado
    const nv = [-ext + 1 / k, 0], tr = 1.6 / k;
    P.push(Pg([nv, [nv[0] - tr, tr * 1.6], [nv[0] + tr, tr * 1.6]], 'NIVEL'));
    P.push(Tx([nv[0] - tr * 1.6, tr * 1.2], '±0,00 NPT', 2, 'NIVEL', { al: 'end' }));

    L.items.forEach((it) => {
      const top = it.ante + it.alto;
      P.push(...mapear(geoAbertura(it), ([x, y]) => [it.x + x, top - y]).map((q) => Object.assign(q, { obj: it.id })));
      const enc = top + 5.5 / k;
      marca(P, [it.x + it.ancho / 2, enc < H - 3.5 / k || it.ante < 8 / k ? enc : it.ante - 5.5 / k], refs.de(it), k);
    });

    // cadena horizontal (debajo del piso) y total
    const xs = [...new Set([0, W, ...L.items.flatMap((it) => [it.x, it.x + it.ancho])].map((x) => Math.round(clamp(x, 0, W) * 10) / 10))].sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i++) if (xs[i + 1] - xs[i] >= 0.5) cota(P, [xs[i], 0], [xs[i + 1], 0], -8, k, null, { desde: 4 });
    if (xs.length > 2) cota(P, [0, 0], [W, 0], -15, k, null, { desde: 4 });
    // cadena vertical de niveles (derecha) y total de altura
    const ys = [...new Set([0, H, ...L.items.flatMap((it) => [it.ante, it.ante + it.alto])].map((y) => Math.round(clamp(y, 0, H) * 10) / 10))].sort((a, b) => a - b);
    for (let i = 0; i + 1 < ys.length; i++) if (ys[i + 1] - ys[i] >= 0.5) cota(P, [W, ys[i]], [W, ys[i + 1]], -8, k);
    if (ys.length > 2) cota(P, [W, 0], [W, H], -15, k);

    const ttl = (L.nombre + ' · vista desde el ' + (L.vista === 'exterior' ? 'exterior' : 'interior')).toUpperCase();
    P.push(Tx([W / 2, -(xs.length > 2 ? 24 : 17) / k], ttl, 3, 'TEXTO', { al: 'middle', negrita: true, titulo: true }));
    return P;
  }

  // ── Escena: techo (planta + corte A-A) ─────────────────────
  function geoTecho(L) {
    const p = L.pts, n = p.length, ccw = areaFirmada(p) > 0;
    const i = clamp(L.apoyo, 0, n - 1), a = p[i], b = p[(i + 1) % n];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const ux = dx / l, uy = dy / l;
    const inx = ccw ? -uy : uy, iny = ccw ? ux : -ux;   // normal hacia adentro
    let prof = 0; p.forEach((q) => { prof = Math.max(prof, (q[0] - a[0]) * inx + (q[1] - a[1]) * iny); });
    return { ccw, a, b, ux, uy, inx, iny, prof: Math.max(prof, 1), largo: l };
  }
  function pendiente(L) { const g = geoTecho(L); return (L.alta - L.baja) / g.prof * 100; }

  function escenaTecho(L, k, ctx) {
    const P = [], p = L.pts, n = p.length, g = geoTecho(L);
    const bb = bbox(p);
    // pared de apoyo (hacia afuera del techo), rayada
    const e = 15, oa = [g.a[0] - g.inx * e, g.a[1] - g.iny * e], ob = [g.b[0] - g.inx * e, g.b[1] - g.iny * e];
    const muro = [g.a, g.b, ob, oa];
    P.push(Pg(muro, 'MURO', { real: 'muro' }));
    rayado(muro, 45, 1.3 / k).forEach((s) => P.push(Ln(s[0], s[1], 'RAYADO')));
    const mm = [(oa[0] + ob[0]) / 2 - g.inx * 2.4 / k, (oa[1] + ob[1]) / 2 - g.iny * 2.4 / k];
    let angM = Math.atan2(g.uy, g.ux) * 180 / Math.PI; if (angM > 90.5 || angM <= -89.5) angM += 180;
    P.push(Tx(mm, 'PARED EXISTENTE', 1.8, 'TEXTO', { al: 'middle', rot: angM }));

    // sentido de las placas: paralelo a la pendiente
    const angP = Math.atan2(g.iny, g.inx) * 180 / Math.PI;
    rayado(p, angP, Math.max(30, 6 / k)).forEach((s) => P.push(Ln(s[0], s[1], 'RAYADO', { placa: true })));
    P.push(Pg(p, 'TECHO', { obj: 'techo', real: 'cubierta', angP }));

    // columnas
    (L.columnas || []).forEach((c) => {
      const s = 5, q = [[c.x - s, c.y - s], [c.x + s, c.y - s], [c.x + s, c.y + s], [c.x - s, c.y + s]];
      P.push(Pg(q, 'ESTR', { relleno: true, obj: c.id }));
    });

    // flecha de pendiente
    const mid = [(g.a[0] + g.b[0]) / 2, (g.a[1] + g.b[1]) / 2];
    const lf = Math.min(g.prof * 0.55, 30 / k), f0 = [mid[0] + g.inx * g.prof * 0.18, mid[1] + g.iny * g.prof * 0.18];
    const f1 = [f0[0] + g.inx * lf, f0[1] + g.iny * lf], ah = 1.6 / k;
    P.push(Ln(f0, f1, 'TEXTO'));
    P.push(Pg([f1, [f1[0] - g.inx * ah * 1.8 + g.ux * ah, f1[1] - g.iny * ah * 1.8 + g.uy * ah], [f1[0] - g.inx * ah * 1.8 - g.ux * ah, f1[1] - g.iny * ah * 1.8 - g.uy * ah]], 'TEXTO', { relleno: true }));
    let angF = angP; if (angF > 90.5 || angF <= -89.5) angF += 180;
    const pend = pendiente(L);
    P.push(Tx([(f0[0] + f1[0]) / 2 + g.ux * 2.2 / k, (f0[1] + f1[1]) / 2 + g.uy * 2.2 / k], 'PEND. ' + coma(Math.max(0, pend), 1) + ' %', 2, 'TEXTO', { al: 'middle', rot: angF }));

    // superficie: corrida hacia un costado para no pisar la flecha ni el corte
    const cen = centroide(p), sup = Math.abs(areaFirmada(p)) / 10000;
    const corrido = (t) => { const q = [cen[0] + g.ux * g.largo * t, cen[1] + g.uy * g.largo * t]; return dentro(q, p) ? q : null; };
    const enPlanta = (t, f) => { const m0 = [(g.a[0] + g.b[0]) / 2, (g.a[1] + g.b[1]) / 2]; const q = [m0[0] + g.ux * g.largo * t + g.inx * g.prof * f, m0[1] + g.uy * g.largo * t + g.iny * g.prof * f]; return dentro(q, p) ? q : null; };
    const pSup = enPlanta(-0.22, 0.8) || enPlanta(-0.22, 0.5) || corrido(-0.22) || cen;
    P.push(Tx(pSup, 'SUP. ' + coma(sup, 2) + ' m²', 2.4, 'TEXTO', { al: 'middle', negrita: true, fondo: true }));

    // cotas de cada lado + letra del lado
    const sg = g.ccw ? -1 : 1;
    for (let i = 0; i < n; i++) {
      const a = p[i], b = p[(i + 1) % n];
      const extra = i === clamp(L.apoyo, 0, n - 1) ? e * k : 0;
      cota(P, a, b, sg * (8 + extra), k);
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const nx = -(b[1] - a[1]) / l * -sg, ny = (b[0] - a[0]) / l * -sg; // hacia adentro
      if (!ctx.limpio) P.push(Tx([m[0] + nx * 3.2 / k, m[1] + ny * 3.2 / k], String.fromCharCode(65 + i), 2.2, 'COTA', { al: 'middle', negrita: true, lado: i }));
    }

    // línea de corte A-A: perpendicular a la pared, corrida del centro
    const pc = corrido(0.24) || corrido(-0.12) || cen;
    const dw = (pc[0] - g.a[0]) * g.inx + (pc[1] - g.a[1]) * g.iny;  // distancia a la pared
    const base = [pc[0] - g.inx * dw, pc[1] - g.iny * dw];
    const c0 = [base[0] - g.inx * (15 + 10 / k), base[1] - g.iny * (15 + 10 / k)];
    const c1 = [base[0] + g.inx * (g.prof + 10 / k), base[1] + g.iny * (g.prof + 10 / k)];
    if (!ctx.sinCorte) {
      P.push(Ln(c0, c1, 'NIVEL', { trazo: 'EJE' }));
      [c0, c1].forEach((q) => P.push(Tx([q[0] + g.ux * 2.4 / k, q[1] + g.uy * 2.4 / k], 'A', 2.6, 'NIVEL', { al: 'middle', negrita: true })));
    }

    const ep = extension(P, k);
    P.push(Tx([(ep.x0 + ep.x1) / 2, ep.y0 - 6 / k], (L.nombre + ' · planta').toUpperCase(), 3, 'TEXTO', { al: 'middle', negrita: true, titulo: true }));

    if (ctx.sinCorte) return P;
    // ── corte A-A: a la derecha de la planta, o debajo si conviene ──
    const D0 = geoTecho(L).prof;
    const ox = ctx.apilar ? (ep.x0 + ep.x1) / 2 - D0 / 2 : ep.x1 + 15 + 32 / k;
    const oy = ctx.apilar ? ep.y0 - 22 / k - Math.max(L.alta, L.baja) - 46 - 8 / k : bb.y0;
    const C = (u, z) => [ox + u, oy + z];
    const D = g.prof, ha = L.alta, hb = L.baja;
    const ext = 20 + 4 / k;
    P.push(Ln(C(-15 - ext, 0), C(D + ext, 0), 'MURO', { grueso: true }));
    rayado([C(-15 - ext, 0), C(D + ext, 0), C(D + ext, -2.5 / k), C(-15 - ext, -2.5 / k)], 45, 1.3 / k).forEach((s) => P.push(Ln(s[0], s[1], 'RAYADO')));
    const mur = [C(-15, 0), C(0, 0), C(0, ha + 40), C(-15, ha + 40)];
    P.push(Pg(mur, 'MURO', { real: 'muro' })); rayado(mur, 45, 1.3 / k).forEach((s) => P.push(Ln(s[0], s[1], 'RAYADO')));
    const esp = 6;
    P.push(Pg([C(0, ha), C(D, hb), C(D, hb + esp), C(0, ha + esp)], 'TECHO', { real: 'cubierta' }));
    P.push(Pg([C(D - 8, 0), C(D, 0), C(D, hb), C(D - 8, hb)], 'ESTR', (L.columnas || []).length ? { real: 'estr' } : { trazo: 'DASH' }));
    cota(P, C(0, 0), C(0, ha), 8 + 15 * k, k);
    cota(P, C(D, 0), C(D, hb), -8, k);
    cota(P, C(0, 0), C(D, 0), -8, k, null, { desde: 4 });
    let angT = Math.atan2(hb - ha, D) * 180 / Math.PI;
    P.push(Tx(C(D / 2, (ha + hb) / 2 + esp + 3.2 / k), coma(Math.max(0, pend), 1) + ' %', 2.2, 'TEXTO', { al: 'middle', rot: angT }));
    P.push(Tx(C(D / 2, -17 / k), 'CORTE A-A', 3, 'TEXTO', { al: 'middle', negrita: true, titulo: true }));
    return P;
  }

  function escena(L, k, apilar, pant) {
    const ctx = Object.assign({ refs: referencias(), apilar: !!apilar }, pant || {});
    return L.tipo === 'techo' ? escenaTecho(L, k, ctx) : escenaFachada(L, k, ctx);
  }
  function extension(P, k) {
    const pts = [];
    P.forEach((q) => {
      if (q.t === 'l') pts.push(q.a, q.b);
      else if (q.t === 'p') pts.push(...q.p);
      else if (q.t === 'c') pts.push([q.p[0] - q.r, q.p[1] - q.r], [q.p[0] + q.r, q.p[1] + q.r]);
      else { const w = q.s.length * q.h * 0.62 / k / 2, h = q.h / k / 2; pts.push([q.p[0] - w, q.p[1] - h], [q.p[0] + w, q.p[1] + h]); }
    });
    return bbox(pts.length ? pts : [[0, 0], [100, 100]]);
  }

  // ── Render a SVG (pantalla o papel) ────────────────────────
  // T: [x,y] mundo → destino · u: unidades destino por mm de anotación
  function aSvg(P, T, u, modo) {
    const grupos = new Map(), resto = [];
    const papel = modo === 'papel';
    const num = (n) => Math.round(n * 100) / 100;
    P.forEach((q) => {
      const cap = CAPAS[q.c] || CAPAS.TEXTO;
      if (q.t === 'x') {
        const [x, y] = T(q.p);
        const fs = q.h * u;
        const col = papel ? '#000' : colPant(q.c);
        const rot = q.rot ? ` transform="rotate(${num(-q.rot)} ${num(x)} ${num(y)})"` : '';
        const anc = q.al === 'start' ? 'start' : q.al === 'end' ? 'end' : 'middle';
        const fondo = q.fondo && !papel ? ` paint-order="stroke" stroke="${fondoPant()}" stroke-width="${num(fs * 0.5)}"` : (q.fondo ? ` paint-order="stroke" stroke="#fff" stroke-width="${num(fs * 0.5)}"` : '');
        resto.push(`<text x="${num(x)}" y="${num(y)}" font-size="${num(fs)}" fill="${col}" text-anchor="${anc}" dominant-baseline="central"${q.negrita ? ' font-weight="600"' : ''}${rot}${fondo}>${esc(q.s)}</text>`);
        return;
      }
      if (q.t === 'c') {
        const [x, y] = T(q.p), r = Math.abs(T([q.p[0] + q.r, q.p[1]])[0] - x);
        const sw = papel ? cap.papel : 1;
        resto.push(`<circle cx="${num(x)}" cy="${num(y)}" r="${num(r)}" fill="${papel ? '#fff' : fondoPant()}" stroke="${papel ? '#000' : colPant(q.c)}" stroke-width="${sw}"/>`);
        return;
      }
      if (q.relleno) {
        const d = q.p.map((p, i) => (i ? 'L' : 'M') + T(p).map(num).join(' ')).join('') + 'Z';
        resto.push(`<path d="${d}" fill="${papel ? '#000' : colPant(q.c)}" fill-opacity="${papel ? 1 : 0.8}" stroke="${papel ? '#000' : colPant(q.c)}" stroke-width="${papel ? cap.papel : 1}"/>`);
        return;
      }
      const key = q.c + '|' + (q.trazo || '') + '|' + (q.grueso ? 1 : 0);
      if (!grupos.has(key)) grupos.set(key, []);
      const arr = grupos.get(key);
      if (q.t === 'l') { const a = T(q.a), b = T(q.b); arr.push(`M${num(a[0])} ${num(a[1])}L${num(b[0])} ${num(b[1])}`); }
      else arr.push(q.p.map((p, i) => (i ? 'L' : 'M') + T(p).map(num).join(' ')).join('') + (q.cerrado ? 'Z' : ''));
    });
    let s = '';
    grupos.forEach((ds, key) => {
      const [c, tr, gr] = key.split('|'), cap = CAPAS[c];
      let sw = papel ? cap.papel : (c === 'MURO' ? 1.6 : c === 'CARP' || c === 'TECHO' || c === 'ESTR' ? 1.3 : 1);
      if (gr === '1') sw = papel ? Math.max(sw, 0.35) : sw + 0.8;
      const dash = tr ? ` stroke-dasharray="${TRAZOS[tr][papel ? 'papel' : 'pant']}"` : '';
      const color = papel ? (c === 'RAYADO' ? '#555' : '#000') : colPant(c);
      s += `<path d="${ds.join('')}" fill="none" stroke="${color}" stroke-width="${sw}"${dash} stroke-linecap="round" stroke-linejoin="round"${papel ? '' : ' vector-effect="non-scaling-stroke"'}/>`;
    });
    return s + resto.join('');
  }

  // ── Lámina A4 (presentación) ───────────────────────────────
  const HOJA = { w: 297, h: 210, x0: 20, y0: 7, x1: 290, y1: 203, rot: 26, col: 92 };
  function escalaLamina(L) {
    const area = { w: HOJA.x1 - HOJA.x0 - HOJA.col - 10, h: HOJA.y1 - HOJA.y0 - HOJA.rot - 10 };
    for (const den of ESCALAS) {
      const k = 10 / den;
      for (const apilar of L.tipo === 'techo' ? [false, true] : [false]) {
        const P = escena(L, k, apilar), b = extension(P, k);
        if ((b.x1 - b.x0) * k <= area.w && (b.y1 - b.y0) * k <= area.h) return { den, k, P, b, area };
      }
    }
    const den = ESCALAS[ESCALAS.length - 1], k = 10 / den, P = escena(L, k);
    return { den, k, P, b: extension(P, k), area };
  }

  function laminaSvg(idx, opts) {
    opts = opts || {};
    const L = plano.laminas[idx], E = escalaLamina(L), k = E.k;
    const ox = HOJA.x0 + 5 + (E.area.w - (E.b.x1 - E.b.x0) * k) / 2, oy = HOJA.y0 + 5 + (E.area.h - (E.b.y1 - E.b.y0) * k) / 2;
    const T = ([x, y]) => [ox + (x - E.b.x0) * k, oy + (E.b.y1 - y) * k];
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${HOJA.w} ${HOJA.h}" width="${opts.px || HOJA.w + 'mm'}" height="${opts.px ? Math.round(opts.px * HOJA.h / HOJA.w) : HOJA.h + 'mm'}" font-family="'IBM Plex Mono', 'Courier New', monospace">`;
    if (opts.fuente) s += `<style>@font-face{font-family:'IBM Plex Mono';src:url(${opts.fuente}) format('woff2');}</style>`;
    s += `<rect width="${HOJA.w}" height="${HOJA.h}" fill="#fff"/>`;
    s += aSvg(E.P, T, 1, 'papel');
    if (!taller && !opts.limpia) s += marcaLamina();
    // marco y rótulo
    const X0 = HOJA.x0, Y0 = HOJA.y0, X1 = HOJA.x1, Y1 = HOJA.y1, yr = Y1 - HOJA.rot, xc = X1 - HOJA.col;
    s += `<g fill="none" stroke="#000"><rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" stroke-width="0.5"/><path d="M${X0} ${yr}H${X1}M${xc} ${Y0}V${yr}" stroke-width="0.35"/></g>`;
    s += columnaLamina(L, xc, Y0, X1, yr);
    s += rotulo(L, idx, E.den, X0, yr, X1, Y1);
    // escala gráfica
    const paso = [10, 20, 25, 50, 100, 200, 500].find((v) => v * k >= 6) || 500;
    const bx = X0 + 4, by = yr - 5;
    s += `<g stroke="#000" stroke-width="0.18">`;
    for (let i = 0; i < 4; i++) s += `<rect x="${n2(bx + i * paso * k)}" y="${by}" width="${n2(paso * k)}" height="1.2" fill="${i % 2 ? '#fff' : '#000'}"/>`;
    s += `</g><g font-size="1.8" fill="#000">`;
    for (let i = 0; i <= 4; i++) s += `<text x="${n2(bx + i * paso * k)}" y="${by - 1}" text-anchor="middle">${i * paso}</text>`;
    s += `<text x="${n2(bx + 4 * paso * k + 2)}" y="${by + 1.2}">cm</text></g>`;
    return s + '</svg>';
  }

  // marca de agua: diagonal suave + identificación en el margen izquierdo
  function marcaLamina() {
    const env = plano.envio || {};
    let s = '<g font-family="Archivo, Arial, sans-serif" font-weight="800" fill="#1B6CC8" fill-opacity="0.07" text-anchor="middle">';
    [[80, 70], [200, 70], [80, 150], [200, 150]].forEach(([x, y]) => { s += `<text x="${x}" y="${y}" font-size="16" transform="rotate(-24 ${x} ${y})" letter-spacing="2">ALUMFER</text>`; });
    s += '</g>';
    const id = `Plano generado en alumfer.com.ar${env.nombre ? ' para ' + env.nombre : ''}${env.tel ? ' · Tel. ' + env.tel : ''}${env.fecha ? ' · ' + env.fecha.split('-').reverse().join('/') : ''} · Uso exclusivo para presupuestar con Alumfer. Prohibida su reproducción o uso por terceros.`;
    s += `<text x="11" y="${HOJA.h / 2}" font-size="1.9" fill="#555" text-anchor="middle" transform="rotate(-90 11 ${HOJA.h / 2})" font-family="'IBM Plex Mono', monospace">${esc(id)}</text>`;
    return s;
  }
  function txt(x, y, s, h, o) {
    o = o || {};
    return `<text x="${n2(x)}" y="${n2(y)}" font-size="${h}" fill="${o.color || '#000'}"${o.al ? ` text-anchor="${o.al}"` : ''}${o.b ? ' font-weight="600"' : ''}${o.fam ? ` font-family="${o.fam}"` : ''}>${esc(s)}</text>`;
  }
  // corta un texto en renglones de hasta n caracteres
  function renglones(s, n) {
    const out = []; let cur = '';
    String(s).split(' ').forEach((w) => { if ((cur + ' ' + w).trim().length > n) { if (cur) out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
    if (cur) out.push(cur);
    return out;
  }

  function columnaLamina(L, x0, y0, x1, y1) {
    let s = '';
    const w = x1 - x0, pad = 3;
    if (L.tipo === 'fachada') {
      s += txt(x0 + pad, y0 + 6, 'PLANILLA DE CARPINTERÍAS', 2.6, { b: true });
      s += `<path d="M${x0} ${y0 + 9}H${x1}" stroke="#000" stroke-width="0.25"/>`;
      const filas = planilla(L, referencias());
      if (!filas.length) s += txt(x0 + pad, y0 + 16, 'Sin aberturas cargadas.', 2.2, { color: '#555' });
      const alto = 22, max = Math.floor((y1 - y0 - 12) / alto);
      filas.slice(0, max).forEach((f, i) => {
        const yy = y0 + 10 + i * alto, it = f.it, t = A.tipo(it.tipo);
        // mini elevación de la abertura
        const bw = 24, bh = alto - 6, kk = Math.min(bw / it.ancho, bh / it.alto);
        const mx = x0 + pad + (bw - it.ancho * kk) / 2, my = yy + 3 + (bh - it.alto * kk) / 2;
        const prims = mapear(geoAbertura(Object.assign({}, it, { postigon: false })), ([x, y]) => [mx + x * kk, my + y * kk]);
        s += aSvg(prims, (p) => p, 1, 'papel').replace(/stroke-width="0\.35"/g, 'stroke-width="0.25"');
        const tx = x0 + pad + bw + 3;
        s += `<circle cx="${n2(tx + 2.6)}" cy="${n2(yy + 4.6)}" r="2.6" fill="none" stroke="#000" stroke-width="0.25"/>` + txt(tx + 2.6, yy + 5.4, f.ref, 2, { al: 'middle', b: true });
        s += txt(tx + 7, yy + 5.4, `${Math.round(it.ancho)} × ${Math.round(it.alto)}`, 2.4, { b: true });
        s += txt(x1 - pad, yy + 5.4, 'CANT. ' + f.cant, 2, { al: 'end', b: true });
        renglones(t.nombre, 30).slice(0, 1).forEach((r, j) => { s += txt(tx, yy + 9.6 + j * 3, r, 1.9); });
        renglones(detalleItem(it), 32).slice(0, 2).forEach((r, j) => { s += txt(tx, yy + 12.8 + j * 2.7, r, 1.7, { color: '#333' }); });
        s += txt(tx, yy + 18.4, 'Antepecho ' + [...f.antes].join(' / ') + ' cm', 1.7, { color: '#333' });
        s += `<path d="M${x0} ${n2(yy + alto)}H${x1}" stroke="#000" stroke-width="0.13"/>`;
      });
      if (filas.length > max) s += txt(x0 + pad, y1 - 3, `+ ${filas.length - max} tipos más (ver el detalle en el mensaje)`, 1.8, { color: '#555' });
    } else {
      s += txt(x0 + pad, y0 + 6, 'DATOS DEL TECHO', 2.6, { b: true });
      s += `<path d="M${x0} ${y0 + 9}H${x1}" stroke="#000" stroke-width="0.25"/>`;
      datosTecho(L).forEach(([k, v], i) => {
        const yy = y0 + 15 + i * 10.5;
        s += txt(x0 + pad, yy, k.toUpperCase(), 1.7, { color: '#444' });
        renglones(v, 36).slice(0, 2).forEach((r, j) => { s += txt(x0 + pad, yy + 3.6 + j * 2.9, r, 2.2, { b: j === 0 }); });
        s += `<path d="M${x0 + pad} ${n2(yy + 7.6)}H${x1 - pad}" stroke="#000" stroke-width="0.09"/>`;
      });
    }
    void w;
    return s;
  }

  function datosTecho(L) {
    const p = L.pts, sup = Math.abs(areaFirmada(p)) / 10000, g = geoTecho(L);
    const lados = p.map((a, i) => { const b = p[(i + 1) % p.length]; return String.fromCharCode(65 + i) + '\u00a0' + fmt(Math.hypot(b[0] - a[0], b[1] - a[1])); }).join('  ');
    const c = A.color(L.color);
    return [
      ['Uso', L.uso],
      ['Superficie', coma(sup, 2) + ' m²'],
      ['Lados (cm)', lados],
      ['Apoyo', 'Lado ' + String.fromCharCode(65 + L.apoyo) + ' contra la pared'],
      ['Profundidad (corte A-A)', fmt(g.prof) + ' cm'],
      ['Altura en la pared', fmt(L.alta) + ' cm'],
      ['Altura libre en el frente', fmt(L.baja) + ' cm'],
      ['Pendiente', coma(Math.max(0, pendiente(L)), 1) + ' %'],
      ['Cubierta', material(L.material).nombre],
      ['Estructura de aluminio', (c.grupo === 'Anodizado' ? 'Anodizado ' : '') + c.nombre.toLowerCase()],
      ['Columnas dibujadas', String((L.columnas || []).length)],
    ];
  }

  function rotulo(L, idx, den, x0, y0, x1, y1) {
    const h = y1 - y0, c1 = x0 + 68, c2 = c1 + 82, c3 = c2 + 62;
    let s = `<path d="M${c1} ${y0}V${y1}M${c2} ${y0}V${y1}M${c3} ${y0}V${y1}M${c2} ${y0 + h / 2}H${x1}" stroke="#000" stroke-width="0.25" fill="none"/>`;
    s += txt(x0 + 4, y0 + 9, 'ALUMFER', 5, { b: true, fam: 'Archivo, Arial, sans-serif' });
    s += txt(x0 + 4, y0 + 14, 'CARPINTERÍA DE ALUMINIO', 2, {});
    s += txt(x0 + 4, y0 + 19, 'Av. San Martín 734, Adrogué', 1.8, { color: '#333' });
    s += txt(x0 + 4, y0 + 22.4, '(011) 6336-8643 · alumfer.com.ar', 1.8, { color: '#333' });
    s += txt(c1 + 3, y0 + 5, 'PLANO PARA PRESUPUESTO', 1.7, { color: '#444' });
    s += txt(c1 + 3, y0 + 11, L.nombre.toUpperCase(), 3.4, { b: true });
    s += txt(c1 + 3, y0 + 16, L.tipo === 'fachada' ? 'Fachada · aberturas · vista desde el ' + (L.vista === 'exterior' ? 'exterior' : 'interior') : 'Techo · planta y corte A-A', 1.9);
    s += txt(c1 + 3, y0 + 22.4, 'Medidas en cm, tomadas por el cliente. A verificar en obra.', 1.6, { color: '#444' });
    s += txt(c2 + 3, y0 + 5, 'CLIENTE', 1.7, { color: '#444' });
    s += txt(c2 + 3, y0 + 10, plano.datos.cliente || '—', 2.4, { b: true });
    s += txt(c2 + 3, y0 + h / 2 + 5, 'LOCALIDAD DE LA OBRA', 1.7, { color: '#444' });
    s += txt(c2 + 3, y0 + h / 2 + 10, plano.datos.localidad || '—', 2.4, { b: true });
    const f = new Date();
    s += txt(c3 + 3, y0 + 5, 'ESCALA', 1.7, { color: '#444' }) + txt(c3 + 3, y0 + 10.4, '1:' + den, 3, { b: true });
    s += txt(c3 + 32, y0 + 5, 'FECHA', 1.7, { color: '#444' }) + txt(c3 + 32, y0 + 10.4, f.toLocaleDateString('es-AR'), 2.4, { b: true });
    s += txt(c3 + 3, y0 + h / 2 + 5, 'LÁMINA', 1.7, { color: '#444' }) + txt(c3 + 3, y0 + h / 2 + 10.4, (idx + 1) + ' de ' + plano.laminas.length, 2.6, { b: true });
    s += txt(c3 + 32, y0 + h / 2 + 5, 'FORMATO', 1.7, { color: '#444' }) + txt(c3 + 32, y0 + h / 2 + 10.4, 'A4', 2.6, { b: true });
    return s;
  }

  // ── DXF (AutoCAD R12, ASCII) ───────────────────────────────
  function dxfTexto(s) {
    // el archivo va en Windows-1252 (ANSI_1252): acentos tal cual; lo que no entra, como \U+XXXX
    return String(s).replace(/±/g, '%%p').replace(/°/g, '%%d').replace(/[^\x20-\x7E\u00A0-\u00FF]/g, (c) => '\\U+' + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'));
  }
  function exportarDxf() {
    const o = [];
    const g = (c, v) => o.push(String(c), String(v));
    g(0, 'SECTION'); g(2, 'HEADER'); g(9, '$ACADVER'); g(1, 'AC1009'); g(9, '$DWGCODEPAGE'); g(3, 'ANSI_1252'); g(0, 'ENDSEC');
    g(0, 'SECTION'); g(2, 'TABLES');
    g(0, 'TABLE'); g(2, 'LTYPE'); g(70, 3);
    [['CONTINUOUS', 'Solid line', []], ['DASHED', '__ __ __', [12, -6]], ['CENTER', '____ _ ____', [30, -6, 6, -6]]].forEach(([n, d, pat]) => {
      g(0, 'LTYPE'); g(2, n); g(70, 0); g(3, d); g(72, 65); g(73, pat.length); g(40, pat.reduce((s, v) => s + Math.abs(v), 0));
      pat.forEach((v) => g(49, v));
    });
    g(0, 'ENDTAB');
    g(0, 'TABLE'); g(2, 'LAYER'); g(70, Object.keys(CAPAS).length);
    Object.entries(CAPAS).forEach(([n, c]) => { g(0, 'LAYER'); g(2, 'ALF-' + n); g(70, 0); g(62, c.aci); g(6, 'CONTINUOUS'); });
    g(0, 'ENDTAB'); g(0, 'ENDSEC');
    g(0, 'SECTION'); g(2, 'ENTITIES');
    let dx = 0;
    plano.laminas.forEach((L) => {
      const E = escalaLamina(L), k = E.k;
      const T = ([x, y]) => [n2(x - E.b.x0 + dx), n2(y - E.b.y0)];
      const capa = (q) => { g(8, 'ALF-' + q.c); if (q.trazo) g(6, TRAZOS[q.trazo].dxf); };
      E.P.forEach((q) => {
        if (q.t === 'l') { const a = T(q.a), b = T(q.b); g(0, 'LINE'); capa(q); g(10, a[0]); g(20, a[1]); g(30, 0); g(11, b[0]); g(21, b[1]); g(31, 0); }
        else if (q.t === 'p') {
          g(0, 'POLYLINE'); capa(q); g(66, 1); g(10, 0); g(20, 0); g(30, 0); g(70, q.cerrado ? 1 : 0);
          q.p.forEach((p) => { const v = T(p); g(0, 'VERTEX'); g(8, 'ALF-' + q.c); g(10, v[0]); g(20, v[1]); g(30, 0); });
          g(0, 'SEQEND'); g(8, 'ALF-' + q.c);
        } else if (q.t === 'c') { const c = T(q.p); g(0, 'CIRCLE'); capa(q); g(10, c[0]); g(20, c[1]); g(30, 0); g(40, n2(q.r)); }
        else {
          const p = T(q.p), al = q.al === 'start' ? 0 : q.al === 'end' ? 2 : 1;
          g(0, 'TEXT'); capa(q); g(10, p[0]); g(20, p[1]); g(30, 0); g(40, n2(q.h * 0.72 / k)); g(1, dxfTexto(q.s));
          if (q.rot) g(50, n2(q.rot));
          g(72, al); g(11, p[0]); g(21, p[1]); g(31, 0); g(73, 2);
        }
      });
      // nota de unidades debajo de cada lámina
      const nt = T([E.b.x0, E.b.y0 - 10 / k]);
      g(0, 'TEXT'); g(8, 'ALF-TEXTO'); g(10, nt[0]); g(20, nt[1]); g(30, 0); g(40, n2(2 / k)); g(1, dxfTexto('Unidades: cm · escala de anotaciones 1:' + E.den + ' · Alumfer'));
      dx += (E.b.x1 - E.b.x0) + 60 / k;
    });
    g(0, 'ENDSEC'); g(0, 'EOF');
    return o.join('\r\n') + '\r\n';
  }

  // ── Estado de vista y edición ──────────────────────────────
  const cam = { cx: 250, cy: 135, z: 1.5 };      // z: px por cm
  const camL = { cx: 148.5, cy: 105, z: 3 };     // presentación: px por mm
  let modo = 'modelo';
  let sel = null;          // { tipo: 'ab'|'pared'|'techo'|'vert'|'lado'|'col', id|i }
  let herramienta = null;  // 'columna'
  const toggles = { grilla: true, orto: true, refent: true };
  let historial = [], rehacer = [];
  let vw = 800, vh = 600;
  let raf = 0, sucio = true, cacheLam = null;
  let hover = null, snapInfo = null, rotuloAbierto = false;

  const ui = {
    svg: $('.cad__svg', raiz), view: $('.cad__view', raiz), tabs: $('.cad__tabs', raiz), tools: $('.cad__tools', raiz),
    props: $('.cad__props-body', raiz), propsBox: $('.cad__props', raiz), coords: $('[data-st="xy"]', raiz), zoom: $('[data-st="zoom"]', raiz),
    log: $('.cad__log', raiz), cmd: $('.cad__cmd input', raiz), hint: $('.cad__hint', raiz), cruz: $('.cad__cruz', raiz),
    escala: $('.cad__escala', raiz),
  };

  // persistencia + historial
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(plano)); } catch (_) {} }
  function foto() { return JSON.stringify(plano); }
  function snapshot() { historial.push(foto()); if (historial.length > 120) historial.shift(); rehacer = []; }
  function cambio(fn, msg, diferir) {
    snapshot(); fn(); guardar(); sucio = true; cacheLam = null; pedir();
    if (msg) log(msg);
    // desde el panel: se redibuja después de que el foco pasó al campo siguiente (Tab)
    if (diferir) setTimeout(pintarProps, 0); else pintarProps();
  }
  function deshacer() {
    if (!historial.length) return log('Nada para deshacer.');
    rehacer.push(foto()); plano = JSON.parse(historial.pop()); validarSel(); guardar(); todo(); log('Deshacer.');
  }
  function rehacerFn() {
    if (!rehacer.length) return log('Nada para rehacer.');
    historial.push(foto()); plano = JSON.parse(rehacer.pop()); validarSel(); guardar(); todo(); log('Rehacer.');
  }
  function validarSel() {
    const L = lam();
    if (!L || !sel) { sel = null; return; }
    if (sel.tipo === 'ab' && !(L.items || []).some((i) => i.id === sel.id)) sel = null;
    else if (sel.tipo === 'col' && !(L.columnas || []).some((c) => c.id === sel.id)) sel = null;
    else if ((sel.tipo === 'vert' || sel.tipo === 'lado') && (!L.pts || sel.i >= L.pts.length)) sel = null;
  }

  function log(m) {
    if (!ui.log) return;
    const p = document.createElement('p'); p.textContent = m;
    ui.log.appendChild(p);
    while (ui.log.children.length > 3) ui.log.firstChild.remove();
  }

  // ── Coordenadas ────────────────────────────────────────────
  const aPant = ([x, y]) => [vw / 2 + (x - cam.cx) * cam.z, vh / 2 - (y - cam.cy) * cam.z];
  const aMundo = (sx, sy) => [cam.cx + (sx - vw / 2) / cam.z, cam.cy - (sy - vh / 2) / cam.z];
  const kPant = () => cam.z / mmpx();
  const apilarPant = () => vh > vw * 1.1;
  const mmpx = () => (vw < 600 ? 3.1 : MMPX);
  const flagsPant = () => (simple() ? { limpio: true, sinCorte: vw < 600 || vh > vw * 0.9 } : null);
  let camTocada = false;

  function medir() {
    const r = ui.view.getBoundingClientRect();
    vw = Math.max(1, r.width); vh = Math.max(1, r.height);
    ui.svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
    sucio = true; pedir();
  }
  function zoomExt() {
    const L = lam(); if (!L) return;
    if (modo === 'lamina') { const z = Math.min((vw - 32) / HOJA.w, (vh - 32) / HOJA.h); Object.assign(camL, { cx: HOJA.w / 2, cy: HOJA.h / 2, z }); pedir(); return; }
    // dos pasadas: el tamaño de las anotaciones depende del zoom
    for (let i = 0; i < 3; i++) {
      const b = extension(escena(L, kPant(), apilarPant(), flagsPant()), kPant());
      const pad = tactil ? 28 : 48;
      cam.z = clamp(Math.min((vw - pad * 2) / Math.max(10, b.x1 - b.x0), (vh - pad * 2) / Math.max(10, b.y1 - b.y0)), 0.05, 40);
      cam.cx = (b.x0 + b.x1) / 2; cam.cy = (b.y0 + b.y1) / 2;
    }
    sucio = true; pedir();
  }

  // ── Render de pantalla ─────────────────────────────────────
  function pedir() { if (!raf) raf = requestAnimationFrame(render); }
  function grilla() {
    if (!toggles.grilla) return '';
    let paso = 10; while (paso * cam.z < 9) paso *= paso === 10 || paso === 100 ? 5 : 2;
    const mayor = paso * 10;
    const [x0, y1] = aMundo(0, 0), [x1, y0] = aMundo(vw, vh);
    let d1 = '', d2 = '';
    for (let x = Math.floor(x0 / paso) * paso; x <= x1; x += paso) { const sx = aPant([x, 0])[0].toFixed(1); (Math.abs(x % mayor) < 1e-6 ? (d2 += `M${sx} 0V${vh}`) : (d1 += `M${sx} 0V${vh}`)); }
    for (let y = Math.floor(y0 / paso) * paso; y <= y1; y += paso) { const sy = aPant([0, y])[1].toFixed(1); (Math.abs(y % mayor) < 1e-6 ? (d2 += `M0 ${sy}H${vw}`) : (d1 += `M0 ${sy}H${vw}`)); }
    const [c1, c2] = simple() ? ['#E9EEF3', '#D5DEE7'] : ['#2A3440', '#34404E'];
    return `<path d="${d1}" stroke="${c1}" stroke-width="1"/><path d="${d2}" stroke="${c2}" stroke-width="1"/>`;
  }

  function render() {
    raf = 0;
    const L = lam();
    if (!L) { ui.svg.innerHTML = ''; return; }
    if (modo === 'lamina') {
      if (!cacheLam) cacheLam = laminaSvg(plano.activa).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
      const tx = vw / 2 - camL.cx * camL.z, ty = vh / 2 - camL.cy * camL.z;
      ui.svg.innerHTML = `<rect width="${vw}" height="${vh}" fill="${simple() ? '#DCE3EA' : '#3A4350'}"/><g transform="matrix(${camL.z},0,0,${camL.z},${tx},${ty})" font-family="'IBM Plex Mono', monospace"><rect x="1.2" y="1.6" width="${HOJA.w}" height="${HOJA.h}" fill="#000" opacity="0.35"/>${cacheLam}</g>`;
      ui.zoom.textContent = Math.round(camL.z / 3.78 * 100) + '%';
      return;
    }
    const k = kPant();
    let P = escena(L, k, apilarPant(), flagsPant());
    let s = `<rect width="${vw}" height="${vh}" fill="${fondoPant()}"/>` + grilla();
    if (vistaReal) {
      s += capaReal(L, P);
      // las líneas técnicas de las aberturas y de las placas las reemplaza el dibujo realista
      P = P.filter((q) => !(L.tipo === 'fachada' && q.obj && q.obj !== 'techo') && !q.placa);
    }
    s += aSvg(P, aPant, mmpx(), 'pantalla');
    s += overlay(L, P);
    // ícono de ejes (SCU) en la esquina, como en CAD
    const ux = 18, uy = vh - (innerWidth < 900 ? 72 : 18);
    s += marcaPantalla();
    if (anim) { if (performance.now() - anim.t0 > T_ABRE + T_QUIETO + T_CIERRA) { if (anim.forzada) vistaReal = false; anim = null; } else requestAnimationFrame(() => pedir()); }
    if (!simple()) s += `<g stroke-width="1.5" font-size="10" opacity="0.85"><path d="M${ux} ${uy}h26" stroke="#E25555"/><path d="M${ux} ${uy}v-26" stroke="#4FCB6B"/><rect x="${ux - 3}" y="${uy - 3}" width="6" height="6" fill="none" stroke="#C9D3DD" stroke-width="1"/><text x="${ux + 29}" y="${uy + 4}" fill="#E25555" stroke="none">X</text><text x="${ux - 3}" y="${uy - 30}" fill="#4FCB6B" stroke="none">Y</text></g>`;
    ui.svg.innerHTML = s;
    ui.zoom.textContent = '1 m = ' + Math.round(cam.z * 100) + ' px';
    // escala gráfica en pantalla
    let paso = 10; while (paso * cam.z < 60) paso *= paso === 10 || paso === 100 || paso === 1000 ? 5 : 2;
    if (ui.escala) { ui.escala.style.width = Math.round(paso * cam.z) + 'px'; ui.escala.dataset.l = paso >= 100 ? (paso / 100) + ' m' : paso + ' cm'; }
  }

  // ── Vista realista (sólo pantalla): aberturas con color y vidrio ──
  const PAREDES = [
    { id: 'blanco', nombre: 'Blanca', color: '#F0EDE6' },
    { id: 'arena', nombre: 'Arena', color: '#E4D5BA' },
    { id: 'gris', nombre: 'Gris', color: '#C8CBCE' },
    { id: 'grafito', nombre: 'Gris oscuro', color: '#6D7277' },
    { id: 'ladrillo', nombre: 'Ladrillo visto', color: '#B0614A' },
  ];
  const pared = (id) => PAREDES.find((x) => x.id === id) || PAREDES[0];
  let vistaReal = true;
  try { vistaReal = localStorage.getItem('alumfer-plano-vista') !== 'tecnica'; } catch (_) {}
  const cacheAb = new Map();
  function svgAbertura(it, tt) {
    const datos = { tipo: it.tipo, ancho: it.ancho, alto: it.alto, color: it.color, vidrio: it.vidrio, mosquitero: it.mosquitero, mano: it.mano, reja: it.reja, postigon: it.postigon };
    if (tt > 0) return A.real(datos, { t: tt });
    const key = [it.tipo, Math.round(it.ancho), Math.round(it.alto), it.color, it.vidrio, it.mosquitero ? 1 : 0, it.mano, it.reja ? 1 : 0, it.postigon ? 1 : 0].join('|');
    if (!cacheAb.has(key)) {
      if (cacheAb.size > 150) cacheAb.clear();
      cacheAb.set(key, A.real(datos, { t: 0 }));
    }
    return cacheAb.get(key);
  }

  // ── Simulación de apertura ────────────────────────────────
  let anim = null;   // { t0, id }
  const T_ABRE = 1300, T_QUIETO = 900, T_CIERRA = 1100;
  function tAnim(id) {
    if (!anim || (anim.id && anim.id !== id)) return 0;
    const e = performance.now() - anim.t0;
    if (e < T_ABRE) return e / T_ABRE;
    if (e < T_ABRE + T_QUIETO) return 1;
    if (e < T_ABRE + T_QUIETO + T_CIERRA) return 1 - (e - T_ABRE - T_QUIETO) / T_CIERRA;
    return 0;
  }
  function animar(id) {
    const L = lam(); if (!L || L.tipo !== 'fachada' || !L.items.length) { aviso('Primero agregá alguna ventana o puerta.'); return; }
    if (modo === 'lamina') setModo('modelo');
    anim = { t0: performance.now(), id: id || null, forzada: !vistaReal };
    vistaReal = true;
    aviso(id ? 'Así abre.' : 'Así abren tus aberturas.');
    pedir();
    ga('plano_animar', { event_label: id ? A.tipo((L.items.find((i) => i.id === id) || {}).tipo || '').id : 'todas' });
  }
  function capaReal(L, P) {
    const z = cam.z, d = (pts) => pts.map((q, i) => (i ? 'L' : 'M') + aPant(q).map((v) => v.toFixed(1)).join(' ')).join('') + 'Z';
    let s = `<defs><filter id="re-sombra" x="-70%" y="-20%" width="240%" height="150%"><feDropShadow dx="0" dy="${Math.max(1, 1.5 * z).toFixed(1)}" stdDeviation="${Math.max(1, 1.8 * z).toFixed(1)}" flood-color="#1B2530" flood-opacity="0.35"/></filter>` +
      `<linearGradient id="re-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9EC5E8"/><stop offset="0.62" stop-color="#DCEAF5"/><stop offset="0.63" stop-color="#9DB98A"/><stop offset="1" stop-color="#7E9B6C"/></linearGradient>` +
      `<linearGradient id="re-adentro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4A4F55"/><stop offset="1" stop-color="#2E3236"/></linearGradient>` +
      `<linearGradient id="re-poli" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B5D3EC"/><stop offset="0.45" stop-color="#E4F0F9"/><stop offset="0.55" stop-color="#D2E5F4"/><stop offset="1" stop-color="#A9CBE6"/></linearGradient>`;
    const ladrillo = (x0, y0) => {
      const bw = 25 * z, bh = 6.5 * z;
      if (bh < 3) return '';
      return `<pattern id="re-ladrillo" patternUnits="userSpaceOnUse" width="${bw.toFixed(2)}" height="${(bh * 2).toFixed(2)}" x="${x0.toFixed(1)}" y="${y0.toFixed(1)}"><rect width="${bw}" height="${bh * 2}" fill="#B0614A"/><path d="M0 ${bh}H${bw}M0 ${bh * 2}H${bw}M${bw / 2} 0V${bh}M0 ${bh}V${bh * 2}" stroke="#E6D9CC" stroke-width="${Math.max(0.6, z * 0.9).toFixed(2)}" fill="none"/></pattern>`;
    };
    if (L.tipo === 'fachada') {
      const W = L.pared.ancho, H = L.pared.alto, pc = pared(L.paredColor);
      const [ox, oy] = aPant([0, 0]);
      const pat = pc.id === 'ladrillo' ? ladrillo(ox, oy) : '';
      s += pat + '</defs>';
      // piso y pared
      s += `<path d="${d([[-30, 0], [W + 30, 0], [W + 30, -14], [-30, -14]])}" fill="#D9D3C8"/>`;
      s += `<path d="${d([[0, 0], [W, 0], [W, H], [0, H]])}" fill="${pat ? 'url(#re-ladrillo)' : pc.color}"/>`;
      // zócalo suave y luz cenital
      s += `<path d="${d([[0, 0], [W, 0], [W, 8], [0, 8]])}" fill="#000" fill-opacity="0.06"/>`;
      L.items.forEach((it) => {
        const [x0, y0] = aPant([it.x, it.ante + it.alto]), w = it.ancho * z, h = it.alto * z;
        // lo que se ve a través del vidrio
        s += `<rect x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="url(#${L.vista === 'exterior' ? 're-adentro' : 're-cielo'})"/>`;
        const svg = svgAbertura(it, tAnim(it.id)).replace('<svg ', `<svg x="0" y="0" width="${w.toFixed(1)}" height="${h.toFixed(1)}" `);
        s += `<g filter="url(#re-sombra)" transform="translate(${x0.toFixed(1)} ${y0.toFixed(1)})">${svg}</g>`;
      });
      return s;
    }
    s += '</defs>';
    const estr = A.color(L.color).solido, comp = L.material === 'compacto';
    P.forEach((q) => {
      if (!q.real || q.t !== 'p') return;
      if (q.real === 'muro') s += `<path d="${d(q.p)}" fill="${pared('blanco').color}"/>`;
      else if (q.real === 'estr') s += `<path d="${d(q.p)}" fill="${estr}" stroke="#1F2933" stroke-opacity="0.35"/>`;
      else if (q.real === 'cubierta') {
        s += `<path d="${d(q.p)}" fill="url(#re-poli)" fill-opacity="${comp ? 0.7 : 1}"/>`;
        if (q.angP != null) {
          // perfiles de aluminio a lo largo de la pendiente (ilustrativo)
          const wpx = Math.max(1.6, 4 * z).toFixed(1);
          let ds = rayado(q.p, q.angP, 105).map(([a, b]) => { const A1 = aPant(a), B1 = aPant(b); return `M${A1[0].toFixed(1)} ${A1[1].toFixed(1)}L${B1[0].toFixed(1)} ${B1[1].toFixed(1)}`; }).join('');
          const wb = Math.max(2.4, 6 * z);
          // borde oscuro debajo para que el perfil se lea en cualquier color
          s += `<path d="${ds}" stroke="#1F2933" stroke-opacity="0.35" stroke-width="${(+wpx + 1.6).toFixed(1)}" fill="none"/><path d="${ds}" stroke="${estr}" stroke-width="${wpx}" fill="none"/>`;
          s += `<path d="${d(q.p)}" fill="none" stroke="#1F2933" stroke-opacity="0.35" stroke-width="${(wb + 1.6).toFixed(1)}" stroke-linejoin="round"/><path d="${d(q.p)}" fill="none" stroke="${estr}" stroke-width="${wb.toFixed(1)}" stroke-linejoin="round"/>`;
        }
      }
    });
    return s;
  }

  // marca de agua en pantalla: también queda en cualquier captura
  function marcaPantalla() {
    if (taller) return '';
    const t = esc(textoMarca()), w = Math.max(260, t.length * 7.2 + 60), col = simple() ? '#1B6CC8' : '#9FB6D0';
    return `<defs><pattern id="marca-alf" patternUnits="userSpaceOnUse" width="${w}" height="150" patternTransform="rotate(-24)"><text x="0" y="40" font-family="Archivo, Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="1.5" fill="${col}" fill-opacity="${simple() ? 0.075 : 0.08}">${t}</text><text x="${w / 2}" y="115" font-family="Archivo, Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="1.5" fill="${col}" fill-opacity="${simple() ? 0.075 : 0.08}">${t}</text></pattern></defs><rect width="${vw}" height="${vh}" fill="url(#marca-alf)" pointer-events="none"/>`;
  }

  // selección, pinzamientos (grips) y avisos sobre la vista
  function overlay(L, P) {
    let s = '';
    const g = (p, hot, cls) => {
      const [x, y] = aPant(p), r = tactil ? 7 : 4.5;
      if (simple()) return `<circle cx="${x}" cy="${y}" r="${r + 2}" fill="#fff" stroke="${hot ? '#E25555' : '#1B6CC8'}" stroke-width="2.5"/>`;
      return `<rect class="${cls || ''}" x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}" fill="${hot ? '#E25555' : '#2F7BEA'}" stroke="#fff" stroke-width="1"/>`;
    };
    const contorno = (pts, color) => `<path d="${pts.map((p, i) => (i ? 'L' : 'M') + aPant(p).map((v) => v.toFixed(1)).join(' ')).join('')}Z" fill="${color}" fill-opacity="0.08" stroke="${color}" stroke-width="1.4" stroke-dasharray="6 4"/>`;
    if (L.tipo === 'fachada') {
      // avisos: superpuestas o fuera de la pared
      const malas = new Set();
      L.items.forEach((a) => {
        if (a.x < -0.5 || a.ante < -0.5 || a.x + a.ancho > L.pared.ancho + 0.5 || a.ante + a.alto > L.pared.alto + 0.5) malas.add(a.id);
        L.items.forEach((b) => { if (a !== b && !esComp(a) && !esComp(b) && a.x < b.x + b.ancho - 0.5 && b.x < a.x + a.ancho - 0.5 && a.ante < b.ante + b.alto - 0.5 && b.ante < a.ante + a.alto - 0.5) malas.add(a.id); });
      });
      malas.forEach((id) => { const a = L.items.find((i) => i.id === id); s += contorno(rectItem(a), '#E25555'); });
      if (hover && hover.tipo === 'ab' && !(sel && sel.id === hover.id)) { const a = L.items.find((i) => i.id === hover.id); if (a) s += contorno(rectItem(a), '#9DB7D6'); }
      if (sel && sel.tipo === 'ab') {
        const a = L.items.find((i) => i.id === sel.id);
        if (a) { s += contorno(rectItem(a), '#2F7BEA'); gripsItem(a).forEach((q) => { s += g(q.p, drag && drag.grip === q.n); }); if (simple()) s += etiquetaSel(a); }
      }
      if (sel && sel.tipo === 'pared') s += contorno([[0, 0], [L.pared.ancho, 0], [L.pared.ancho, L.pared.alto], [0, L.pared.alto]], '#2F7BEA') + g([L.pared.ancho, L.pared.alto]);
    } else {
      const p = L.pts;
      if (sel && (sel.tipo === 'techo')) s += contorno(p, '#2F7BEA');
      if (sel && sel.tipo === 'lado') { const a = aPant(p[sel.i]), b = aPant(p[(sel.i + 1) % p.length]); s += `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#2F7BEA" stroke-width="5" stroke-opacity="0.6"/>`; }
      if (hover && hover.tipo === 'lado' && !(sel && sel.tipo === 'lado' && sel.i === hover.i)) { const a = aPant(p[hover.i]), b = aPant(p[(hover.i + 1) % p.length]); s += `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#9DB7D6" stroke-width="4" stroke-opacity="0.5"/>`; }
      if (!simple()) p.forEach((q, i) => { s += g(q, sel && sel.tipo === 'vert' && sel.i === i); });
      if (!simple()) p.forEach((q, i) => { const r = p[(i + 1) % p.length], m = aPant([(q[0] + r[0]) / 2, (q[1] + r[1]) / 2]), rr = tactil ? 6 : 4; s += `<path d="M${m[0]} ${m[1] - rr}L${m[0] + rr} ${m[1]}L${m[0]} ${m[1] + rr}L${m[0] - rr} ${m[1]}Z" fill="${sel && sel.tipo === 'lado' && sel.i === i ? '#E25555' : '#2F7BEA'}" stroke="#fff"/>`; });
      (L.columnas || []).forEach((c) => { if (sel && sel.tipo === 'col' && sel.id === c.id) s += contorno([[c.x - 7, c.y - 7], [c.x + 7, c.y - 7], [c.x + 7, c.y + 7], [c.x - 7, c.y + 7]], '#2F7BEA'); });
    }
    if (snapInfo) {
      const [x, y] = aPant(snapInfo.p);
      s += `<rect x="${x - 6}" y="${y - 6}" width="12" height="12" fill="none" stroke="#7CE08A" stroke-width="2"/>`;
      if (snapInfo.guia) snapInfo.guia.forEach(([a, b]) => { const A1 = aPant(a), B1 = aPant(b); s += `<path d="M${A1[0]} ${A1[1]}L${B1[0]} ${B1[1]}" stroke="#7CE08A" stroke-width="1" stroke-dasharray="3 4"/>`; });
    }
    return s;
  }
  // cartel con la medida sobre la abertura elegida (modo simple)
  function etiquetaSel(a) {
    const [x, y] = aPant([a.x + a.ancho / 2, a.ante + a.alto / 2]), t = `${fmt(a.ancho)} × ${fmt(a.alto)} cm`, w = t.length * 7.4 + 18;
    return `<g transform="translate(${x - w / 2} ${y - 12})"><rect width="${w}" height="24" rx="12" fill="#1B6CC8"/><text x="${w / 2}" y="16.5" text-anchor="middle" font-size="12.5" font-weight="600" fill="#fff">${t}</text></g>`;
  }
  const rectItem = (a) => [[a.x, a.ante], [a.x + a.ancho, a.ante], [a.x + a.ancho, a.ante + a.alto], [a.x, a.ante + a.alto]];
  function gripsItem(a) {
    const x0 = a.x, x1 = a.x + a.ancho, y0 = a.ante, y1 = a.ante + a.alto, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
    if (simple()) return [{ n: 'se', p: [x1, y0] }, { n: 'ne', p: [x1, y1] }, { n: 'sw', p: [x0, y0] }, { n: 'nw', p: [x0, y1] }];
    return [
      { n: 'sw', p: [x0, y0] }, { n: 'se', p: [x1, y0] }, { n: 'ne', p: [x1, y1] }, { n: 'nw', p: [x0, y1] },
      { n: 's', p: [xm, y0] }, { n: 'e', p: [x1, ym] }, { n: 'n', p: [xm, y1] }, { n: 'w', p: [x0, ym] },
    ];
  }

  // ── Herramientas y selección por puntero ───────────────────
  const tol = () => (tactil ? 22 : 10);
  function pick(sx, sy) {
    const L = lam(), w = aMundo(sx, sy), t = tol() / cam.z;
    if (L.tipo === 'fachada') {
      if (sel && sel.tipo === 'ab') {
        const a = L.items.find((i) => i.id === sel.id);
        if (a) for (const q of gripsItem(a)) { const [px, py] = aPant(q.p); if (Math.hypot(px - sx, py - sy) <= tol()) return { tipo: 'grip', grip: q.n, id: a.id }; }
      }
      if (sel && sel.tipo === 'pared') { const [px, py] = aPant([L.pared.ancho, L.pared.alto]); if (Math.hypot(px - sx, py - sy) <= tol()) return { tipo: 'gripPared' }; }
      for (let i = L.items.length - 1; i >= 0; i--) { const a = L.items[i]; if (w[0] >= a.x - t * 0.3 && w[0] <= a.x + a.ancho + t * 0.3 && w[1] >= a.ante - t * 0.3 && w[1] <= a.ante + a.alto + t * 0.3) return { tipo: 'ab', id: a.id }; }
      if (w[0] >= 0 && w[0] <= L.pared.ancho && w[1] >= 0 && w[1] <= L.pared.alto) return { tipo: 'pared' };
      return null;
    }
    const p = L.pts;
    for (const c of L.columnas || []) if (Math.abs(w[0] - c.x) <= 5 + t && Math.abs(w[1] - c.y) <= 5 + t) return { tipo: 'col', id: c.id };
    if (simple()) return dentro(w, p) ? { tipo: 'techo' } : null;
    for (let i = 0; i < p.length; i++) { const [px, py] = aPant(p[i]); if (Math.hypot(px - sx, py - sy) <= tol()) return { tipo: 'vert', i }; }
    for (let i = 0; i < p.length; i++) { const r = p[(i + 1) % p.length], [px, py] = aPant([(p[i][0] + r[0]) / 2, (p[i][1] + r[1]) / 2]); if (Math.hypot(px - sx, py - sy) <= tol()) return { tipo: 'medio', i }; }
    for (let i = 0; i < p.length; i++) if (distSeg(w, p[i], p[(i + 1) % p.length]) <= t) return { tipo: 'lado', i };
    if (dentro(w, p)) return { tipo: 'techo' };
    return null;
  }

  // Imán: grilla de 5 cm + referencias a objetos (REFENT)
  const redondear = (v, paso) => Math.round(v / paso) * paso;
  function imanFachada(L, a, nx, ny, nw, nh) {
    const t = (tactil ? 14 : 9) / cam.z;
    const xs = [0, L.pared.ancho, L.pared.ancho / 2], ys = [0, L.pared.alto];
    L.items.forEach((b) => { if (b.id !== a.id) { xs.push(b.x, b.x + b.ancho); ys.push(b.ante, b.ante + b.alto); } });
    const guia = [];
    let bx = null, by = null;
    if (toggles.refent) {
      // bordes y centro en X
      [[nx, 0], [nx + nw, nw], [nx + nw / 2, nw / 2]].forEach(([v, off]) => { xs.forEach((x) => { if (Math.abs(v - x) < t && (bx == null || Math.abs(v - x) < Math.abs(bx.d))) bx = { d: v - x, x: x - off, ref: x }; }); });
      [[ny, 0], [ny + nh, nh]].forEach(([v, off]) => { ys.forEach((y) => { if (Math.abs(v - y) < t && (by == null || Math.abs(v - y) < Math.abs(by.d))) by = { d: v - y, y: y - off, ref: y }; }); });
    }
    const paso = toggles.grilla ? 5 : 1;
    const x = bx ? bx.x : redondear(nx, paso), y = by ? Math.max(0, by.y) : Math.max(0, redondear(ny, paso));
    if (bx) guia.push([[bx.ref, -10], [bx.ref, L.pared.alto + 10]]);
    if (by) guia.push([[-10, by.ref], [L.pared.ancho + 10, by.ref]]);
    snapInfo = (bx || by) ? { p: [bx ? bx.ref : x, by ? by.ref : y], guia } : null;
    return [x, y];
  }
  function imanVertice(L, i, p) {
    const t = (tactil ? 14 : 9) / cam.z, n = L.pts.length;
    let [x, y] = toggles.grilla ? [redondear(p[0], 5), redondear(p[1], 5)] : [Math.round(p[0]), Math.round(p[1])];
    const guia = [];
    let hit = false;
    if (toggles.orto || toggles.refent) {
      L.pts.forEach((q, j) => {
        if (j === i) return;
        const vecino = j === (i + 1) % n || j === (i - 1 + n) % n;
        if (!(toggles.orto && vecino) && !toggles.refent) return;
        if (Math.abs(p[0] - q[0]) < t) { x = q[0]; guia.push([q, [x, y]]); hit = true; }
        if (Math.abs(p[1] - q[1]) < t) { y = q[1]; guia.push([q, [x, y]]); hit = true; }
      });
    }
    snapInfo = hit ? { p: [x, y], guia } : null;
    return [x, y];
  }

  let drag = null;
  const punteros = new Map();
  let pinch = null;

  function onDown(e) {
    if (e.button === 1 || (e.button === 0 && e.altKey)) { e.preventDefault(); }
    ui.svg.setPointerCapture(e.pointerId);
    punteros.set(e.pointerId, [e.offsetX, e.offsetY]);
    if (punteros.size === 2) {
      // pellizco: cancela lo que se estaba arrastrando
      if (drag && drag.movido && drag.antes) { plano = JSON.parse(drag.antes); historial.pop(); }
      drag = null; snapInfo = null;
      const [a, b] = [...punteros.values()];
      const c = modo === 'lamina' ? camL : cam;
      pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], z: c.z, cx: c.cx, cy: c.cy };
      return;
    }
    if (punteros.size > 2) return;
    const sx = e.offsetX, sy = e.offsetY;
    if (modo === 'lamina' || e.button === 1 || e.button === 2) { drag = { tipo: 'pan', sx, sy, cx: (modo === 'lamina' ? camL : cam).cx, cy: (modo === 'lamina' ? camL : cam).cy }; ui.view.classList.add('is-pan'); return; }
    const L = lam();
    if (herramienta === 'columna' && L.tipo === 'techo') {
      const w = aMundo(sx, sy);
      const p = toggles.grilla ? [redondear(w[0], 5), redondear(w[1], 5)] : w.map(Math.round);
      cambio(() => { L.columnas = L.columnas || []; const c = { id: nid(), x: p[0], y: p[1] }; L.columnas.push(c); sel = { tipo: 'col', id: c.id }; }, `Columna en X ${fmt(p[0])}  Y ${fmt(p[1])}.`);
      if (tactil) setHerramienta(null);
      return;
    }
    const h = pick(sx, sy);
    const w0 = aMundo(sx, sy);
    if (!h) { sel = null; pintarProps(); pedir(); drag = { tipo: 'pan', sx, sy, cx: cam.cx, cy: cam.cy }; ui.view.classList.add('is-pan'); return; }
    if (h.tipo === 'grip') { const a = L.items.find((i) => i.id === h.id); drag = { tipo: 'grip', grip: h.grip, id: h.id, w0, ini: Object.assign({}, a), antes: foto() }; pedir(); return; }
    if (h.tipo === 'gripPared') { drag = { tipo: 'gripPared', w0, ini: Object.assign({}, L.pared), antes: foto() }; return; }
    if (h.tipo === 'ab') { const a = L.items.find((i) => i.id === h.id); sel = { tipo: 'ab', id: a.id }; drag = { tipo: 'mover', id: a.id, w0, ini: Object.assign({}, a), antes: foto() }; }
    else if (h.tipo === 'vert') { sel = { tipo: 'vert', i: h.i }; drag = { tipo: 'vert', i: h.i, w0, ini: L.pts[h.i].slice(), antes: foto() }; }
    else if (h.tipo === 'medio') { sel = { tipo: 'lado', i: h.i }; drag = { tipo: 'lado', i: h.i, w0, ini: L.pts.map((q) => q.slice()), antes: foto() }; }
    else if (h.tipo === 'col') { const c = L.columnas.find((q) => q.id === h.id); sel = { tipo: 'col', id: c.id }; drag = { tipo: 'col', id: c.id, w0, ini: { x: c.x, y: c.y }, antes: foto() }; }
    else { sel = h; drag = { tipo: 'pan', sx, sy, cx: cam.cx, cy: cam.cy, suave: true }; }
    pintarProps(); pedir();
  }

  function onMove(e) {
    const sx = e.offsetX, sy = e.offsetY;
    if (punteros.has(e.pointerId)) punteros.set(e.pointerId, [sx, sy]);
    if (e.pointerType === 'mouse') cruz(sx, sy);
    if (pinch && punteros.size === 2) {
      const [a, b] = [...punteros.values()], c = modo === 'lamina' ? camL : cam, fl = modo === 'lamina' ? 1 : -1;
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const z = clamp(pinch.z * d / pinch.d, modo === 'lamina' ? 0.5 : 0.05, modo === 'lamina' ? 40 : 40);
      // punto del mundo bajo el centro inicial queda bajo el centro actual
      const wx = pinch.cx + (pinch.m[0] - vw / 2) / pinch.z, wy = pinch.cy + fl * (pinch.m[1] - vh / 2) / pinch.z;
      c.z = z; c.cx = wx - (m[0] - vw / 2) / z; c.cy = wy - fl * (m[1] - vh / 2) / z;
      camTocada = true; sucio = true; pedir(); return;
    }
    if (!drag) {
      if (e.pointerType === 'mouse' && modo === 'modelo') {
        const h = pick(sx, sy), prev = JSON.stringify(hover);
        hover = h && (h.tipo === 'ab' || h.tipo === 'lado') ? h : null;
        ui.view.dataset.hover = h ? h.tipo : '';
        if (JSON.stringify(hover) !== prev) pedir();
        tooltip(h, sx, sy);
      }
      return;
    }
    const L = lam();
    if (drag.tipo === 'pan') {
      const c = modo === 'lamina' ? camL : cam, fl = modo === 'lamina' ? 1 : -1;
      if (drag.suave && Math.hypot(sx - drag.sx, sy - drag.sy) < 4) return;
      if (Math.hypot(sx - drag.sx, sy - drag.sy) > 4) { drag.movido2 = true; camTocada = true; }
      c.cx = drag.cx - (sx - drag.sx) / c.z; c.cy = drag.cy - fl * (sy - drag.sy) / c.z;
      pedir(); return;
    }
    const w = aMundo(sx, sy), dx = w[0] - drag.w0[0], dy = w[1] - drag.w0[1];
    if (!drag.movido) { if (Math.hypot(dx, dy) * cam.z < 3) return; drag.movido = true; historial.push(drag.antes); rehacer = []; }
    if (drag.tipo === 'mover') {
      const a = L.items.find((i) => i.id === drag.id);
      const [x, y] = imanFachada(L, a, drag.ini.x + dx, drag.ini.ante + dy, a.ancho, a.alto);
      a.x = x; a.ante = y;
      tip(sx, sy, `X ${fmt(a.x)}   antepecho ${fmt(a.ante)}`);
    } else if (drag.tipo === 'grip') {
      const a = L.items.find((i) => i.id === drag.id), o = drag.ini, g = drag.grip, paso = toggles.grilla ? 5 : 1;
      let x0 = o.x, x1 = o.x + o.ancho, y0 = o.ante, y1 = o.ante + o.alto;
      if (g.includes('w')) x0 = redondear(o.x + dx, paso); if (g.includes('e')) x1 = redondear(o.x + o.ancho + dx, paso);
      if (g.includes('s')) y0 = Math.max(0, redondear(o.ante + dy, paso)); if (g.includes('n')) y1 = redondear(o.ante + o.alto + dy, paso);
      const lim = A.limites(A.tipo(a.tipo)), [lw0, lw1] = lim.ancho, [lh0, lh1] = lim.alto;
      if (x1 - x0 < lw0) { if (g.includes('w')) x0 = x1 - lw0; else x1 = x0 + lw0; }
      if (x1 - x0 > lw1) { if (g.includes('w')) x0 = x1 - lw1; else x1 = x0 + lw1; }
      if (y1 - y0 < lh0) { if (g.includes('s')) y0 = y1 - lh0; else y1 = y0 + lh0; }
      if (y1 - y0 > lh1) { if (g.includes('s')) y0 = y1 - lh1; else y1 = y0 + lh1; }
      Object.assign(a, { x: x0, ancho: x1 - x0, ante: y0, alto: y1 - y0 });
      tip(sx, sy, `${fmt(a.ancho)} × ${fmt(a.alto)} cm`);
    } else if (drag.tipo === 'gripPared') {
      const paso = toggles.grilla ? 5 : 1;
      L.pared.ancho = clamp(redondear(drag.ini.ancho + dx, paso), 50, 3000); L.pared.alto = clamp(redondear(drag.ini.alto + dy, paso), 50, 1500);
      tip(sx, sy, `Pared ${fmt(L.pared.ancho)} × ${fmt(L.pared.alto)} cm`);
    } else if (drag.tipo === 'vert') {
      L.pts[drag.i] = imanVertice(L, drag.i, [drag.ini[0] + dx, drag.ini[1] + dy]);
      tip(sx, sy, `X ${fmt(L.pts[drag.i][0])}   Y ${fmt(L.pts[drag.i][1])}`);
    } else if (drag.tipo === 'lado') {
      // estira el lado en su normal (mantiene los ángulos rectos)
      const n = L.pts.length, i = drag.i, a = drag.ini[i], b = drag.ini[(i + 1) % n];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / l, ny = (b[0] - a[0]) / l;
      let d = dx * nx + dy * ny; d = toggles.grilla ? redondear(d, 5) : Math.round(d);
      L.pts[i] = [a[0] + nx * d, a[1] + ny * d]; L.pts[(i + 1) % n] = [b[0] + nx * d, b[1] + ny * d];
      tip(sx, sy, `Desplazado ${d > 0 ? '+' : ''}${fmt(d)} cm`);
    } else if (drag.tipo === 'col') {
      const c = L.columnas.find((q) => q.id === drag.id), paso = toggles.grilla ? 5 : 1;
      c.x = redondear(drag.ini.x + dx, paso); c.y = redondear(drag.ini.y + dy, paso);
      tip(sx, sy, `X ${fmt(c.x)}   Y ${fmt(c.y)}`);
    }
    cacheLam = null; sucio = true; pedir();
  }

  function onUp(e) {
    punteros.delete(e.pointerId);
    if (punteros.size < 2) pinch = null;
    ui.view.classList.remove('is-pan');
    if (drag && drag.movido) { guardar(); pintarProps(); }
    // celular: tocar un objeto abre sus propiedades; tocar el vacío las cierra
    if (drag && !drag.movido && !drag.movido2 && innerWidth < 900 && modo === 'modelo' && (drag.tipo !== 'pan' || drag.suave)) raiz.classList.add('props-abiertas');
    if (drag && drag.tipo === 'pan' && !drag.suave && !drag.movido2 && innerWidth < 900 && !sel && !simple()) raiz.classList.remove('props-abiertas');
    if (punteros.size === 0) { drag = null; snapInfo = null; tip(); pedir(); }
  }

  function onWheel(e) {
    e.preventDefault(); camTocada = true;
    const c = modo === 'lamina' ? camL : cam, fl = modo === 'lamina' ? 1 : -1;
    const f = Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.0016));
    const z = clamp(c.z * f, modo === 'lamina' ? 0.5 : 0.05, 40);
    const wx = c.cx + (e.offsetX - vw / 2) / c.z, wy = c.cy - (modo === 'lamina' ? -1 : 1) * (e.offsetY - vh / 2) / c.z;
    c.z = z; c.cx = wx - (e.offsetX - vw / 2) / z; c.cy = wy + (modo === 'lamina' ? -1 : 1) * (e.offsetY - vh / 2) / z;
    pedir();
  }

  // cruz de cursor tipo CAD + coordenadas
  function cruz(sx, sy) {
    if (!ui.cruz) return;
    if (modo !== 'modelo') { ui.cruz.hidden = true; return; }
    ui.cruz.hidden = false;
    ui.cruz.style.transform = `translate(${sx}px, ${sy}px)`;
    const [x, y] = aMundo(sx, sy);
    if (ui.coords) ui.coords.textContent = `X ${fmt(x)}   Y ${fmt(y)}   cm`;
  }
  function tip(sx, sy, t) {
    if (!ui.hint) return;
    if (t == null) { ui.hint.hidden = true; return; }
    ui.hint.hidden = false; ui.hint.textContent = t;
    ui.hint.style.transform = `translate(${Math.min(sx + 18, vw - 180)}px, ${Math.max(sy - 38, 4)}px)`;
  }
  function tooltip(h, sx, sy) {
    const L = lam();
    if (h && h.tipo === 'ab') { const a = L.items.find((i) => i.id === h.id), r = referencias(); tip(sx, sy, `${r.de(a)} · ${fmt(a.ancho)} × ${fmt(a.alto)} · antep. ${fmt(a.ante)}`); }
    else if (h && h.tipo === 'lado') { const p = L.pts, a = p[h.i], b = p[(h.i + 1) % p.length]; tip(sx, sy, `Lado ${String.fromCharCode(65 + h.i)} · ${fmt(Math.hypot(b[0] - a[0], b[1] - a[1]))} cm`); }
    else if (h && h.tipo === 'vert') tip(sx, sy, 'Arrastrá el vértice');
    else if (h && h.tipo === 'medio') tip(sx, sy, `Arrastrá para mover el lado ${String.fromCharCode(65 + h.i)}`);
    else tip();
  }

  // ── Teclado y línea de comandos ────────────────────────────
  const COMANDOS = {
    AB: ['Agregar abertura', () => abrirBiblioteca()], ABERTURA: ['', () => abrirBiblioteca()],
    COL: ['Columna (techos)', () => setHerramienta('columna')], COLUMNA: ['', () => setHerramienta('columna')],
    Z: ['Zoom extensión', () => zoomExt()], ZOOM: ['', () => zoomExt()],
    U: ['Deshacer', () => deshacer()], DESHACER: ['', () => deshacer()], REHACER: ['Rehacer', () => rehacerFn()],
    B: ['Borrar lo seleccionado', () => borrarSel()], BORRAR: ['', () => borrarSel()],
    PARED: ['Propiedades de la pared', () => { if (lam().tipo === 'fachada') { sel = { tipo: 'pared' }; pintarProps(); pedir(); } }],
    LAM: ['Ver la lámina (presentación)', () => setModo(modo === 'lamina' ? 'modelo' : 'lamina')],
    PDF: ['Descargar PDF', () => exportarPdf()], PNG: ['Descargar imagen', () => exportarPng()], DXF: ['Descargar DXF', () => descargarDxf()],
    TALLER: ['', () => pedirTaller()],
    G: ['Grilla sí/no (F7)', () => alternar('grilla')], O: ['Orto sí/no (F8)', () => alternar('orto')], R: ['Referencia a objetos sí/no (F3)', () => alternar('refent')],
  };
  function ejecutar(txt) {
    const s = txt.trim(); if (!s) return;
    log('Comando: ' + s);
    const up = s.toUpperCase();
    // coordenadas "x,y" con la herramienta columna
    const m = s.match(/^(-?\d+(?:[.,]\d+)?)\s*[,;]\s*(-?\d+(?:[.,]\d+)?)$/);
    if (m && herramienta === 'columna' && lam().tipo === 'techo') {
      const x = +m[1].replace(',', '.'), y = +m[2].replace(',', '.'), L = lam();
      cambio(() => { L.columnas = L.columnas || []; L.columnas.push({ id: nid(), x, y }); }, `Columna en X ${fmt(x)}  Y ${fmt(y)}.`);
      return;
    }
    if (up === '?' || up === 'AYUDA') { log(Object.entries(COMANDOS).filter(([, v]) => v[0]).map(([k, v]) => k + ' ' + v[0]).join(' · ')); return; }
    const c = COMANDOS[up];
    if (c) c[1](); else log(`"${s}" no es un comando. Escribí ? para ver la lista.`);
  }

  function onKey(e) {
    const enInput = /INPUT|SELECT|TEXTAREA/.test(document.activeElement && document.activeElement.tagName);
    if ($('dialog[open]')) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { if (!enInput) { e.preventDefault(); e.shiftKey ? rehacerFn() : deshacer(); } return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { if (!enInput) { e.preventDefault(); rehacerFn(); } return; }
    if (e.key === 'F3') { e.preventDefault(); alternar('refent'); return; }
    if (e.key === 'F7') { e.preventDefault(); alternar('grilla'); return; }
    if (e.key === 'F8') { e.preventDefault(); alternar('orto'); return; }
    if (enInput && document.activeElement !== ui.cmd) return;
    if (e.key === 'Escape') { setHerramienta(null); sel = null; pintarProps(); pedir(); if (ui.cmd) ui.cmd.value = ''; return; }
    if (document.activeElement === ui.cmd) return;
    if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { e.preventDefault(); borrarSel(); return; }
    if (e.key.startsWith('Arrow') && sel) {
      e.preventDefault();
      const d = e.shiftKey ? 10 : 1, dx = e.key === 'ArrowLeft' ? -d : e.key === 'ArrowRight' ? d : 0, dy = e.key === 'ArrowDown' ? -d : e.key === 'ArrowUp' ? d : 0;
      moverSel(dx, dy); return;
    }
    // como en AutoCAD: escribir va directo a la línea de comandos
    if (ui.cmd && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && ui.cmd.offsetParent) ui.cmd.focus();
  }
  function moverSel(dx, dy) {
    const L = lam();
    cambio(() => {
      if (sel.tipo === 'ab') { const a = L.items.find((i) => i.id === sel.id); a.x += dx; a.ante = Math.max(0, a.ante + dy); }
      else if (sel.tipo === 'vert') { L.pts[sel.i] = [L.pts[sel.i][0] + dx, L.pts[sel.i][1] + dy]; }
      else if (sel.tipo === 'col') { const c = L.columnas.find((q) => q.id === sel.id); c.x += dx; c.y += dy; }
    });
  }
  function borrarSel() {
    const L = lam(); if (!sel) return log('No hay nada seleccionado.');
    if (sel.tipo === 'ab') cambio(() => { L.items = L.items.filter((i) => i.id !== sel.id); sel = null; }, 'Abertura borrada.');
    else if (sel.tipo === 'col') cambio(() => { L.columnas = L.columnas.filter((c) => c.id !== sel.id); sel = null; }, 'Columna borrada.');
    else if (sel.tipo === 'vert') { if (L.pts.length <= 3) return log('El techo necesita al menos 3 vértices.'); cambio(() => { L.pts.splice(sel.i, 1); if (L.apoyo >= L.pts.length) L.apoyo = 0; sel = null; }, 'Vértice borrado.'); }
  }
  function alternar(k) {
    toggles[k] = !toggles[k];
    $$(`[data-tg="${k}"]`, raiz).forEach((b) => b.setAttribute('aria-pressed', String(toggles[k])));
    log({ grilla: 'Grilla', orto: 'Orto', refent: 'Referencia a objetos' }[k] + (toggles[k] ? ' activada.' : ' desactivada.'));
    sucio = true; pedir();
  }
  function setHerramienta(h) {
    herramienta = h;
    $$('[data-herr]', raiz).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.herr === (h || 'sel'))));
    ui.view.dataset.herr = h || '';
    if (h === 'columna') log('COLUMNA  Tocá dónde va cada columna, o escribí X,Y en cm. Esc para terminar.');
  }
  // Simple (paso a paso, lienzo claro) o Avanzado (CAD completo): el plano es el mismo
  function setNivel(n, sinGuardar) {
    nivel = n === 'avanzado' ? 'avanzado' : 'simple';
    if (!sinGuardar) { try { localStorage.setItem('alumfer-plano-nivel', nivel); } catch (_) {} }
    document.body.classList.toggle('nivel-simple', simple());
    raiz.classList.toggle('is-simple', simple());
    $$('[data-nivel]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.nivel === nivel)));
    if (simple()) { setHerramienta(null); if (sel && sel.tipo !== 'ab' && sel.tipo !== 'col') sel = null; if (innerWidth < 900) raiz.classList.add('props-abiertas'); }
    if (dlgLib) delete dlgLib.dataset.ok;   // los dibujitos cambian de colores
    hover = null; todo();
    requestAnimationFrame(() => { medir(); zoomExt(); });
    if (!sinGuardar) { log(simple() ? 'Modo simple: completá los pasos del panel.' : 'Modo avanzado: herramientas de CAD, línea de comandos y vértices libres.'); ga('plano_nivel', { event_label: nivel }); }
  }
  function setModo(m) {
    modo = m;
    $$('[data-modo]', raiz).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modo === m)));
    raiz.classList.toggle('is-lamina', m === 'lamina');
    if (simple()) pintarTools();
    if (m === 'lamina') { cacheLam = null; zoomExt(); }
    sucio = true; pedir();
  }

  // ── Pestañas de láminas y barra de herramientas ───────────
  function pintarTabs() {
    ui.tabs.innerHTML = plano.laminas.map((L, i) => `<button type="button" role="tab" class="cad__tab" data-lam="${i}" aria-selected="${i === plano.activa}"><span class="cad__tab-ico" aria-hidden="true">${L.tipo === 'techo' ? '◇' : '▭'}</span>${esc(L.nombre)}</button>`).join('') +
      `<button type="button" class="cad__tab cad__tab--add" data-act="nueva" aria-label="Agregar lámina">+</button>`;
  }
  const ICO = {
    sel: '<path d="M5 3l14 8-6 1.5L10 19z"/>',
    ab: '<rect x="4" y="5" width="16" height="14"/><path d="M12 5v14M8 12h2M14 12h2"/>',
    boceto: '<path d="M5 4h10l4 4v12H5z"/><path d="M9 13l3 3 3-3M12 9v7"/>',
    col: '<rect x="9" y="4" width="6" height="16"/><path d="M6 20h12"/>',
    rect: '<rect x="4" y="6" width="16" height="12"/>',
    ele: '<path d="M4 5h9v7h7v7H4z"/>',
    zoom: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    undo: '<path d="M9 7L4 12l5 5"/><path d="M4 12h11a5 5 0 010 10h-3"/>',
    redo: '<path d="M15 7l5 5-5 5"/><path d="M20 12H9a5 5 0 000 10h3"/>',
    lam: '<rect x="3" y="5" width="18" height="14"/><path d="M14 15h7M14 15v4"/>',
    del: '<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5 3.5-5 3.5z"/>',
    real: '<path d="M3 17l5-6 4 4 3-3 6 5"/><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="16" cy="8.5" r="1.6"/>',
    rep: '<path d="M3 5v14M21 5v14"/><rect x="6" y="8" width="4" height="8"/><rect x="14" y="8" width="4" height="8"/>',
  };
  const icono = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${ICO[k]}</svg>`;
  function pintarTools() {
    const L = lam(); if (!L) return;
    const b = (k, label, attr, corto) => `<button type="button" class="cad__tool" ${attr} title="${label}">${icono(k)}<span${corto ? ` data-corto="${corto}"` : ''}>${label}</span></button>`;
    if (simple()) {
      let s = '';
      if (L.tipo === 'fachada') {
        s += b('ab', 'Agregar ventana o puerta', 'data-act="biblioteca" class="is-main"', 'Agregar');
        s += b('rep', 'Repartir parejo', 'data-act="repartir"', 'Repartir');
        s += b('play', 'Ver cómo abren', 'data-act="animar"', 'Abrir');
      } else {
        s += b('col', 'Agregar columna', `data-herr="columna" aria-pressed="${herramienta === 'columna'}"`, 'Columna');
      }
      s += b('real', 'Vista realista', `data-act="real" aria-pressed="${vistaReal}"`, 'Realista');
      s += b('undo', 'Deshacer', 'data-act="undo"') + b('zoom', 'Ver todo', 'data-act="zoom"');
      s += b('lam', modo === 'lamina' ? 'Volver a dibujar' : 'Ver la hoja', 'data-act="modo"', modo === 'lamina' ? 'Dibujar' : 'Ver hoja');
      ui.tools.innerHTML = s.replace(' class="is-main"', '').replace('class="cad__tool" data-act="biblioteca"', 'class="cad__tool cad__tool--main" data-act="biblioteca"');
      return;
    }
    let s = b('sel', 'Seleccionar', `data-herr="sel" aria-pressed="${!herramienta}"`, 'Elegir');
    if (L.tipo === 'fachada') {
      s += b('ab', 'Abertura', 'data-act="biblioteca"');
      s += b('boceto', 'Del boceto', 'data-act="boceto"');
      s += b('play', 'Ver cómo abren', 'data-act="animar"', 'Abrir');
    } else {
      s += b('col', 'Columna', `data-herr="columna" aria-pressed="${herramienta === 'columna'}"`);
      s += b('rect', 'Rectángulo', 'data-forma="rect"', 'Rect.');
      s += b('ele', 'En L', 'data-forma="ele"');
    }
    s += '<span class="cad__sep" aria-hidden="true"></span>';
    s += b('real', 'Realista', `data-act="real" aria-pressed="${vistaReal}"`);
    s += b('zoom', 'Encuadrar', 'data-act="zoom"', 'Ver todo') + b('undo', 'Deshacer', 'data-act="undo"') + b('redo', 'Rehacer', 'data-act="redo"');
    s += b('lam', 'Lámina', 'data-act="modo"');
    ui.tools.innerHTML = s;
  }

  // ── Panel de propiedades ───────────────────────────────────
  const num = (k, label, v, extra) => `<label class="pp"><span>${label}</span><span class="pp__num"><input type="number" inputmode="decimal" step="1" data-k="${k}" value="${Math.round(v * 10) / 10}"${extra || ''}><i>cm</i></span></label>`;
  const opt = (v, t, cur) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(t)}</option>`;
  const selCampo = (k, label, opciones) => `<label class="pp"><span>${label}</span><select data-k="${k}">${opciones}</select></label>`;
  function opcionesTipo(cur) {
    const grupos = {};
    A.TIPOS.forEach((t) => { (grupos[t.grupo] = grupos[t.grupo] || []).push(opt(t.id, t.nombre, cur)); });
    return Object.entries(grupos).map(([g, o]) => `<optgroup label="${g}">${o.join('')}</optgroup>`).join('');
  }
  function opcionesColor(cur) {
    const grupos = {};
    A.COLORES.forEach((c) => { (grupos[c.grupo] = grupos[c.grupo] || []).push(opt(c.id, c.nombre, cur)); });
    return Object.entries(grupos).map(([g, o]) => `<optgroup label="${g}">${o.join('')}</optgroup>`).join('');
  }

  // ── Panel paso a paso (modo simple) ────────────────────────
  function numS(k, label, v, o) {
    o = o || {};
    const id = o.id ? ` data-id="${o.id}"` : '', paso = o.paso || 5;
    return `<div class="ps"><label class="ps__lbl"><span>${o.n ? `<i class="ps__n">${o.n}</i>` : ''}${label}</span>${o.ayuda ? `<small>${o.ayuda}</small>` : ''}</label>` +
      `<div class="ps__ctrl"><button type="button" class="ps__btn" data-paso="${k}"${id} data-delta="${-paso}" aria-label="Restar ${paso} cm">−</button>` +
      `<span class="ps__num"><input type="number" inputmode="numeric" step="1" data-k="${k}"${id} value="${Math.round(v)}" aria-label="${esc(label)}"><i>cm</i></span>` +
      `<button type="button" class="ps__btn" data-paso="${k}"${id} data-delta="${paso}" aria-label="Sumar ${paso} cm">+</button></div></div>`;
  }
  const selS = (k, label, opciones, id) => `<label class="ps ps--sel"><span class="ps__lbl"><span>${label}</span></span><select data-k="${k}"${id ? ` data-id="${id}"` : ''}>${opciones}</select></label>`;
  const paso = (n, titulo, cuerpo, extra) => `<section class="pp-paso${extra || ''}"><h3><b>${n}</b>${titulo}</h3>${cuerpo}</section>`;
  const ICONO_L = (f) => f === 'ele'
    ? '<svg viewBox="0 0 120 84" aria-hidden="true"><path class="m" d="M16 8h98"/><path d="M18 12h94v34H64v34H18z"/><text x="64" y="27">1</text><text x="103" y="33">2</text><text x="41" y="74">3</text><text x="8" y="50">4</text></svg>'
    : '<svg viewBox="0 0 120 84" aria-hidden="true"><path class="m" d="M16 8h98"/><path d="M18 12h94v62H18z"/><text x="64" y="30">1</text><text x="103" y="48">2</text></svg>';

  function avisosFachada(L, refs) {
    const out = [];
    L.items.forEach((a) => {
      if (a.x < -0.5 || a.x + a.ancho > L.pared.ancho + 0.5) out.push(`${refs.de(a)} se sale de la pared por el costado.`);
      if (a.ante + a.alto > L.pared.alto + 0.5) out.push(`${refs.de(a)} queda más alta que la pared.`);
    });
    L.items.forEach((a, i) => L.items.slice(i + 1).forEach((b) => {
      if (!esComp(a) && !esComp(b) && a.x < b.x + b.ancho - 0.5 && b.x < a.x + a.ancho - 0.5 && a.ante < b.ante + b.alto - 0.5 && b.ante < a.ante + a.alto - 0.5) out.push(`${refs.de(a)} y ${refs.de(b)} se superponen.`);
    }));
    return out;
  }

  function propsSimple(L) {
    let s = '';
    const refs = referencias();
    const datos = `<div class="ps-datos"><label class="pp"><span>Tu nombre</span><input type="text" data-d="cliente" value="${esc(plano.datos.cliente)}" maxlength="60" autocomplete="name"></label><label class="pp"><span>Localidad de la obra</span><input type="text" data-d="localidad" value="${esc(plano.datos.localidad)}" maxlength="60"></label></div>` +
      `<div class="ps-fin"><button type="button" class="ps-boton ps-boton--line" data-act="modo">Ver cómo queda la hoja</button><button type="button" class="ps-boton" data-act="enviar">Enviar a Alumfer</button></div>`;
    if (L.tipo === 'fachada') {
      const pc = pared(L.paredColor).id;
      s += paso(1, 'Medí la pared', `<div class="ps-grid">${numS('p.ancho', 'Ancho', L.pared.ancho, { ayuda: 'De punta a punta' })}${numS('p.alto', 'Alto', L.pared.alto, { ayuda: 'Del piso al techo' })}</div>` +
        `<div class="ps-pared"><span class="ps__lbl"><span>Color de la pared</span></span><div role="group" aria-label="Color de la pared">${PAREDES.map((x) => `<button type="button" data-pcolor="${x.id}" aria-pressed="${x.id === pc}" title="${x.nombre}"><i class="${x.id === 'ladrillo' ? 'is-ladrillo' : ''}" style="background:${x.color}"></i><span>${x.nombre}</span></button>`).join('')}</div></div>` +
        selS('vista', 'La estás mirando desde', opt('interior', 'Adentro de la casa', L.vista) + opt('exterior', 'Afuera (la calle o el patio)', L.vista)));
      const items = L.items.slice().sort((a, b) => a.x - b.x);
      let lista = items.map((a) => {
        const t = A.tipo(a.tipo), abierta = sel && sel.tipo === 'ab' && sel.id === a.id;
        let c = `<div class="ps-item${abierta ? ' is-open' : ''}"><button type="button" class="ps-item__head" data-ir="${a.id}" aria-expanded="${abierta}"><b>${refs.de(a)}</b><span>${esc(t.nombre)}<small>${fmt(a.ancho)} × ${fmt(a.alto)} cm</small></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>`;
        if (abierta) {
          c += `<div class="ps-item__body">${selS('tipo', 'Tipo', opcionesTipo(a.tipo), a.id)}`;
          c += `<div class="ps-grid">${numS('ancho', 'Ancho', a.ancho, { id: a.id })}${numS('alto', 'Alto', a.alto, { id: a.id })}</div>`;
          c += `<div class="ps-grid">${numS('x', 'Desde la izquierda', a.x, { id: a.id, ayuda: 'Desde el borde de la pared' })}${numS('ante', 'Desde el piso', a.ante, { id: a.id, ayuda: t.grupo === 'Puertas' ? 'En puertas va 0' : 'Hasta el borde de abajo' })}</div>`;
          c += `<div class="ps-grid">${selS('color', 'Color', opcionesColor(a.color), a.id)}${t.sinVidrio ? '' : selS('vidrio', 'Vidrio', A.VIDRIOS.map((v) => opt(v.id, v.nombre.replace(' (doble vidriado)', ''), a.vidrio)).join(''), a.id)}</div>`;
          if (conLinea(t)) c += selS('linea', 'Línea de aluminio', A.LINEAS.map((l) => opt(l.id, l.nombre, a.linea || 'asesorar')).join(''), a.id);
          if (tieneMano(t)) c += selS('mano', 'Bisagras', opt('izq', 'A la izquierda', a.mano) + opt('der', 'A la derecha', a.mano), a.id);
          const extras = [];
          if (t.mosq) extras.push(`<label class="ps-chk"><input type="checkbox" data-k="mosquitero" data-id="${a.id}"${a.mosquitero ? ' checked' : ''}><span>Mosquitero</span></label>`);
          if (conAcc(t)) extras.push(`<label class="ps-chk"><input type="checkbox" data-k="reja" data-id="${a.id}"${a.reja ? ' checked' : ''}><span>Reja</span></label>`, `<label class="ps-chk"><input type="checkbox" data-k="postigon" data-id="${a.id}"${a.postigon ? ' checked' : ''}><span>Postigón</span></label>`);
          if (extras.length) c += `<div class="ps-extras"><span class="ps__lbl"><span>Agregados</span></span><div>${extras.join('')}</div></div>`;
          c += `<div class="pp-acts"><button type="button" class="is-main" data-act="animar" data-id="${a.id}">▶ Ver cómo abre</button><button type="button" data-pp="centrar" data-id="${a.id}">Centrar</button><button type="button" data-pp="duplicar" data-id="${a.id}">Duplicar</button><button type="button" class="is-danger" data-pp="borrar" data-id="${a.id}">Borrar</button></div></div>`;
        }
        return c + '</div>';
      }).join('');
      if (!items.length) lista = '<p class="pp-vacio">Todavía no hay ninguna. Tocá el botón de abajo y elegí qué va en esta pared.</p>';
      const av = avisosFachada(L, refs);
      lista += av.length ? `<ul class="ps-avisos">${av.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '';
      lista += `<div class="ps-fin"><button type="button" class="ps-boton" data-act="biblioteca">+ Agregar ventana o puerta</button>${items.length > 1 ? '<button type="button" class="ps-boton ps-boton--line" data-act="repartir">Repartir parejo</button>' : ''}${items.length ? '<button type="button" class="ps-boton ps-boton--line" data-act="animar">▶ Ver cómo abren</button>' : ''}</div>`;
      lista += items.length ? '<p class="ps-ayuda">También podés arrastrarlas en el dibujo. Tocá una para cambiar sus medidas.</p>' : '';
      s += paso(2, 'Ventanas y puertas', lista);
      s += paso(3, 'Tus datos y envío', datos);
      return s;
    }
    // techo
    if (sel && sel.tipo === 'col') {
      s += `<section class="pp-paso pp-paso--sel"><h3>Columna</h3><p class="ps-ayuda">Arrastrala en el dibujo para ubicarla.</p><div class="pp-acts"><button type="button" class="is-danger" data-pp="borrar">Borrar columna</button><button type="button" data-pp="deselec">Listo</button></div></section>`;
    }
    const f = paramForma(L);
    let c1 = `<div class="ps-formas"><button type="button" data-sforma="rect" aria-pressed="${!!f && f.forma === 'rect'}">${ICONO_L('rect')}<span>Rectangular</span></button><button type="button" data-sforma="ele" aria-pressed="${!!f && f.forma === 'ele'}">${ICONO_L('ele')}<span>En L</span></button></div>`;
    if (!f) c1 += '<p class="ps-ayuda">Esta forma la dibujaste a mano en el modo Avanzado. Podés seguir editándola ahí, o elegir una forma de arriba.</p>';
    s += paso(1, '¿Qué forma tiene?', c1);
    let c2 = '';
    if (f && f.forma === 'ele') {
      c2 += `<div class="ps-grid">${numS('s.W', 'Largo contra la pared', f.W, { n: 1 })}${numS('s.hc', 'Salida de la parte corta', f.hc, { n: 2 })}</div>`;
      c2 += `<div class="ps-grid">${numS('s.w2', 'Ancho de la parte larga', f.w2, { n: 3 })}${numS('s.H', 'Salida de la parte larga', f.H, { n: 4 })}</div>`;
    } else if (f) {
      c2 += `<div class="ps-grid">${numS('s.W', 'Largo contra la pared', f.W, { n: 1, ayuda: 'El lado que se apoya en la pared' })}${numS('s.H', 'Cuánto sale de la pared', f.H, { n: 2, ayuda: 'Hasta el frente del techo' })}</div>`;
    } else {
      c2 += `<p class="ps-ayuda">Superficie: <b>${coma(Math.abs(areaFirmada(L.pts)) / 10000, 2)} m²</b>. Los largos de cada lado se cambian en el modo Avanzado.</p>`;
    }
    s += paso(2, 'Medidas', c2);
    const pend = Math.max(0, pendiente(L));
    s += paso(3, 'Alturas', `<div class="ps-corte"><svg viewBox="0 0 160 70" aria-hidden="true"><path class="m" d="M6 4v62"/><path class="t" d="M10 14L150 26"/><path class="c" d="M146 26v40"/><path class="p" d="M2 66h156"/><text x="22" y="46">1</text><text x="134" y="52">2</text></svg></div>` +
      `<div class="ps-grid">${numS('alta', 'Altura en la pared', L.alta, { n: 1, ayuda: 'Desde el piso' })}${numS('baja', 'Altura en el frente', L.baja, { n: 2, ayuda: 'Del lado libre' })}</div>` +
      `<p class="ps-resumen">Pendiente <b>${coma(pend, 1)} %</b> · Superficie <b>${coma(Math.abs(areaFirmada(L.pts)) / 10000, 2)} m²</b></p>`);
    s += paso(4, 'Cubierta y estructura', `${selS('material', 'Policarbonato', MATERIALES.map((m) => opt(m.id, m.nombre, L.material)).join(''))}<div class="ps-grid">${selS('uso', 'Para', USOS.map((u) => opt(u, u, L.uso)).join(''))}${selS('color', 'Color de la estructura', opcionesColor(L.color))}</div><p class="ps-ayuda">¿Hay columnas o apoyos? Tocá <b>Agregar columna</b> y marcalos en el dibujo.</p>`);
    s += paso(5, 'Tus datos y envío', datos);
    return s;
  }

  function pintarProps() {
    const L = lam(); if (!L || !ui.props) return;
    if (simple()) {
      const ae = document.activeElement, foco = ae && ui.props.contains(ae) && (ae.dataset.k || ae.dataset.d) ? `[data-${ae.dataset.k ? 'k' : 'd'}="${ae.dataset.k || ae.dataset.d}"]${ae.dataset.id ? `[data-id="${ae.dataset.id}"]` : ''}` : null;
      const sc = ui.props.scrollTop;
      ui.props.innerHTML = propsSimple(L);
      ui.props.scrollTop = sc;
      if (foco) { const f = $(foco, ui.props); if (f) f.focus(); }
      $('.cad__props-title', raiz).textContent = L.tipo === 'fachada' ? 'Paso a paso · ' + L.nombre : 'Paso a paso · ' + L.nombre;
      raiz.classList.toggle('has-sel', !!sel);
      return;
    }
    let s = '', titulo = '';
    const refs = referencias();
    if (L.tipo === 'fachada' && sel && sel.tipo === 'ab') {
      const a = L.items.find((i) => i.id === sel.id), t = A.tipo(a.tipo);
      titulo = refs.de(a) + ' · ' + t.nombre;
      s += `<div class="pp-grid">${selCampo('tipo', 'Tipo', opcionesTipo(a.tipo))}</div>`;
      s += `<div class="pp-grid pp-grid--2">${num('ancho', 'Ancho', a.ancho, ` min="${A.limites(t).ancho[0]}" max="${A.limites(t).ancho[1]}"`)}${num('alto', 'Alto', a.alto, ` min="${A.limites(t).alto[0]}" max="${A.limites(t).alto[1]}"`)}`;
      s += `${num('x', 'Desde la izquierda', a.x)}${num('ante', 'Altura desde el piso', a.ante, ' min="0"')}</div>`;
      s += `<div class="pp-grid pp-grid--2">${selCampo('color', 'Color', opcionesColor(a.color))}${t.sinVidrio ? '' : selCampo('vidrio', 'Vidrio', A.VIDRIOS.map((v) => opt(v.id, v.nombre.replace(' (doble vidriado)', ''), a.vidrio)).join(''))}`;
      if (conLinea(t)) s += selCampo('linea', 'Línea', A.LINEAS.map((l) => opt(l.id, l.nombre, a.linea || 'asesorar')).join(''));
      if (conAcc(t)) s += `<label class="pp pp--check"><input type="checkbox" data-k="reja"${a.reja ? ' checked' : ''}><span>Con reja</span></label><label class="pp pp--check"><input type="checkbox" data-k="postigon"${a.postigon ? ' checked' : ''}><span>Con postigón</span></label>`;
      if (tieneMano(t)) s += selCampo('mano', 'Abre hacia', opt('izq', 'Izquierda (bisagras a la izq.)', a.mano) + opt('der', 'Derecha (bisagras a la der.)', a.mano));
      if (t.mosq) s += `<label class="pp pp--check"><input type="checkbox" data-k="mosquitero"${a.mosquitero ? ' checked' : ''}><span>Con mosquitero</span></label>`;
      s += `</div><div class="pp-acts"><button type="button" data-act="animar" data-id="${a.id}">▶ Ver cómo abre</button><button type="button" data-pp="duplicar">Duplicar</button><button type="button" data-pp="centrar">Centrar en la pared</button><button type="button" class="is-danger" data-pp="borrar">Borrar</button></div>`;
    } else if (L.tipo === 'fachada') {
      titulo = (sel && sel.tipo === 'pared') ? 'Pared' : L.nombre;
      s += `<div class="pp-grid pp-grid--2">${num('p.ancho', 'Ancho de la pared', L.pared.ancho, ' min="50"')}${num('p.alto', 'Alto de la pared', L.pared.alto, ' min="50"')}</div>`;
      s += `<div class="pp-grid pp-grid--2"><label class="pp"><span>Nombre de la lámina</span><input type="text" data-k="nombre" value="${esc(L.nombre)}" maxlength="40"></label>${selCampo('vista', 'Vista desde el', opt('interior', 'Interior', L.vista) + opt('exterior', 'Exterior', L.vista))}</div>`;
      s += `<div class="pp-grid">${selCampo('paredColor', 'Color de la pared (vista realista)', PAREDES.map((x) => opt(x.id, x.nombre, pared(L.paredColor).id)).join(''))}</div>`;
      const filas = planilla(L, refs);
      s += `<h4 class="pp-sub">Planilla de carpinterías</h4>`;
      s += filas.length ? `<ul class="pp-list">${filas.map((f) => `<li><button type="button" data-ir="${f.it.id}"><b>${f.ref}</b><span>${esc(A.tipo(f.it.tipo).nombre)}<small>${fmt(f.it.ancho)} × ${fmt(f.it.alto)} cm · ${esc(detalleItem(f.it))}</small></span><em>× ${f.cant}</em></button></li>`).join('')}</ul>` : '<p class="pp-vacio">Todavía no hay aberturas. Tocá <b>Abertura</b> para agregar la primera.</p>';
      s += `<div class="pp-acts"><button type="button" class="is-main" data-act="biblioteca">+ Agregar abertura</button>${plano.laminas.length > 1 ? '<button type="button" class="is-danger" data-pp="borrarLam">Borrar lámina</button>' : ''}</div>`;
    } else if (sel && sel.tipo === 'lado') {
      const p = L.pts, a = p[sel.i], b = p[(sel.i + 1) % p.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      titulo = 'Lado ' + String.fromCharCode(65 + sel.i);
      s += `<div class="pp-grid pp-grid--2">${num('lado', 'Largo', l, ' min="10"')}<label class="pp pp--check"><input type="checkbox" data-k="apoyo"${L.apoyo === sel.i ? ' checked' : ''}><span>Va contra la pared</span></label></div>`;
      s += `<p class="pp-ayuda">Cambiar el largo estira el techo hacia el lado que se aleja de ${String.fromCharCode(65 + sel.i)}. También podés arrastrar el rombo del medio.</p>`;
      s += `<div class="pp-acts"><button type="button" data-pp="partir">Partir el lado (agrega un vértice)</button></div>`;
    } else if (sel && sel.tipo === 'vert') {
      const q = L.pts[sel.i];
      titulo = 'Vértice ' + (sel.i + 1);
      s += `<div class="pp-grid pp-grid--2">${num('vx', 'X', q[0])}${num('vy', 'Y', q[1])}</div><div class="pp-acts"><button type="button" class="is-danger" data-pp="borrar">Borrar vértice</button></div>`;
    } else if (sel && sel.tipo === 'col') {
      const c = L.columnas.find((q) => q.id === sel.id);
      titulo = 'Columna';
      s += `<div class="pp-grid pp-grid--2">${num('cx', 'X', c.x)}${num('cy', 'Y', c.y)}</div><div class="pp-acts"><button type="button" class="is-danger" data-pp="borrar">Borrar columna</button></div>`;
    } else {
      titulo = L.nombre;
      const pend = pendiente(L), sup = Math.abs(areaFirmada(L.pts)) / 10000;
      s += `<div class="pp-kpis"><div><b>${coma(sup, 2)}</b><span>m²</span></div><div><b>${coma(Math.max(0, pend), 1)}</b><span>% pend.</span></div><div><b>${fmt(geoTecho(L).prof)}</b><span>cm prof.</span></div></div>`;
      s += `<div class="pp-grid pp-grid--2">${num('alta', 'Altura en la pared', L.alta, ' min="100"')}${num('baja', 'Altura libre en el frente', L.baja, ' min="100"')}</div>`;
      s += `<div class="pp-grid pp-grid--2">${selCampo('uso', 'Uso', USOS.map((u) => opt(u, u, L.uso)).join(''))}${selCampo('material', 'Cubierta', MATERIALES.map((m) => opt(m.id, m.nombre, L.material)).join(''))}`;
      s += `${selCampo('color', 'Color de la estructura', opcionesColor(L.color))}<label class="pp"><span>Nombre de la lámina</span><input type="text" data-k="nombre" value="${esc(L.nombre)}" maxlength="40"></label></div>`;
      s += `<p class="pp-ayuda">Tocá un lado para cambiar su largo o marcar cuál va contra la pared. Arrastrá los vértices para darle forma.</p>`;
      s += plano.laminas.length > 1 ? '<div class="pp-acts"><button type="button" class="is-danger" data-pp="borrarLam">Borrar lámina</button></div>' : '';
    }
    s += `<details class="pp-rotulo"${rotuloAbierto ? ' open' : ''}><summary>Datos del rótulo</summary><div class="pp-grid pp-grid--2"><label class="pp"><span>Tu nombre</span><input type="text" data-d="cliente" value="${esc(plano.datos.cliente)}" maxlength="60" autocomplete="name"></label><label class="pp"><span>Localidad de la obra</span><input type="text" data-d="localidad" value="${esc(plano.datos.localidad)}" maxlength="60"></label></div></details>`;
    const ae = document.activeElement, foco = ae && ui.props.contains(ae) ? (ae.dataset.k ? `[data-k="${ae.dataset.k}"]` : ae.dataset.d ? `[data-d="${ae.dataset.d}"]` : null) : null;
    ui.props.innerHTML = s;
    if (foco) { const f = $(foco, ui.props); if (f) f.focus(); }
    $('.cad__props-title', raiz).textContent = titulo;
    raiz.classList.toggle('has-sel', !!sel);
  }

  function onPropChange(e) {
    const el = e.target, L = lam();
    if (el.dataset.d) { cambio(() => { plano.datos[el.dataset.d] = el.value.trim(); }, null, true); return; }
    const k = el.dataset.k; if (!k) return;
    const v = el.type === 'checkbox' ? el.checked : el.type === 'number' ? parseFloat(String(el.value).replace(',', '.')) : el.value;
    if (el.type === 'number' && !isFinite(v)) { pintarProps(); return; }
    if (el.dataset.id) sel = { tipo: 'ab', id: el.dataset.id };
    if (k.startsWith('s.')) { cambio(() => formaParam(L, k.slice(2), v), null, true); zoomSuave(); return; }
    cambio(() => {
      if (k === 'paredColor' || k === 'vista') L[k] = v;
      else if (k === 'p.ancho') L.pared.ancho = clamp(v, 50, 3000);
      else if (k === 'p.alto') L.pared.alto = clamp(v, 50, 1500);
      else if (L.tipo === 'fachada' && sel && sel.tipo === 'ab') {
        const a = L.items.find((i) => i.id === sel.id);
        if (k === 'tipo') {
          const t = A.tipo(v), prev = A.tipo(a.tipo);
          a.tipo = v;
          if (t.grupo !== prev.grupo || t.kind !== prev.kind) { a.ancho = t.ancho; a.alto = t.alto; a.ante = t.antepecho; }
        }
        else if (k === 'ancho') a.ancho = clamp(v, ...A.limites(A.tipo(a.tipo)).ancho);
        else if (k === 'alto') a.alto = clamp(v, ...A.limites(A.tipo(a.tipo)).alto);
        else if (k === 'ante') a.ante = Math.max(0, v);
        else a[k] = v;
      } else if (k === 'lado') estirarLado(L, sel.i, clamp(v, 10, 5000));
      else if (k === 'apoyo') { if (v) L.apoyo = sel.i; }
      else if (k === 'vx') L.pts[sel.i][0] = v;
      else if (k === 'vy') L.pts[sel.i][1] = v;
      else if (k === 'cx' || k === 'cy') { const c = L.columnas.find((q) => q.id === sel.id); c[k[1]] = v; }
      else if (k === 'alta' || k === 'baja') L[k] = clamp(v, 100, 1200);
      else if (k === 'nombre') { L.nombre = String(v).trim() || L.nombre; pintarTabs(); }
      else L[k] = v;
    }, null, true);
  }
  // nuevo largo del lado i: corre los vértices que quedan "más allá" de su extremo
  function estirarLado(L, i, largo) {
    const n = L.pts.length, a = L.pts[i], b = L.pts[(i + 1) % n];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (b[0] - a[0]) / l, uy = (b[1] - a[1]) / l, d = largo - l;
    const lim = (b[0] - a[0]) * ux + (b[1] - a[1]) * uy - 0.5;
    L.pts = L.pts.map((q, j) => (j !== i && ((q[0] - a[0]) * ux + (q[1] - a[1]) * uy) >= lim) ? [n2(q[0] + ux * d), n2(q[1] + uy * d)] : q);
  }

  function onPropClick(e) {
    const st = e.target.closest('[data-paso]');
    if (st) {
      const q = `[data-k="${st.dataset.paso}"]${st.dataset.id ? `[data-id="${st.dataset.id}"]` : ''}`, inp = $(q, ui.props);
      if (inp) { inp.value = Math.max(0, Math.round((parseFloat(inp.value) || 0) + +st.dataset.delta)); inp.dispatchEvent(new Event('change', { bubbles: true })); }
      return;
    }
    const pcb = e.target.closest('[data-pcolor]');
    if (pcb) { cambio(() => { lam().paredColor = pcb.dataset.pcolor; }); if (!vistaReal) aviso('El color de la pared se ve con la vista realista.'); return; }
    const fz = e.target.closest('[data-sforma]');
    if (fz) { cambio(() => formaParam(lam(), 'forma', fz.dataset.sforma), fz.dataset.sforma === 'ele' ? 'Forma en L.' : 'Forma rectangular.'); zoomExt(); return; }
    const b = e.target.closest('[data-pp], [data-ir]'); if (!b) return;
    const L = lam();
    if (b.dataset.ir) {
      const ya = sel && sel.tipo === 'ab' && sel.id === b.dataset.ir;
      sel = ya && simple() ? null : { tipo: 'ab', id: b.dataset.ir }; pintarProps(); pedir(); return;
    }
    if (b.dataset.id) sel = { tipo: 'ab', id: b.dataset.id };
    const a = b.dataset.pp;
    if (a === 'deselec') { sel = null; pintarProps(); pedir(); return; }
    if (a === 'borrar') borrarSel();
    else if (a === 'duplicar') {
      const o = L.items.find((i) => i.id === sel.id);
      cambio(() => { const c = Object.assign({}, o, { id: nid(), x: o.x + o.ancho + 20 }); L.items.push(c); if (c.x + c.ancho > L.pared.ancho) L.pared.ancho = Math.ceil((c.x + c.ancho + 30) / 10) * 10; sel = { tipo: 'ab', id: c.id }; }, 'Abertura duplicada.');
    } else if (a === 'centrar') { const o = L.items.find((i) => i.id === sel.id); cambio(() => { o.x = n2((L.pared.ancho - o.ancho) / 2); }); }
    else if (a === 'partir') {
      cambio(() => { const n = L.pts.length, p = L.pts[sel.i], q = L.pts[(sel.i + 1) % n]; L.pts.splice(sel.i + 1, 0, [n2((p[0] + q[0]) / 2), n2((p[1] + q[1]) / 2)]); if (L.apoyo > sel.i) L.apoyo++; sel = { tipo: 'vert', i: sel.i + 1 }; }, 'Vértice agregado: arrastralo para darle forma.');
    } else if (a === 'borrarLam') {
      if (!confirm('¿Borrar la lámina "' + L.nombre + '"?')) return;
      cambio(() => { plano.laminas.splice(plano.activa, 1); plano.activa = Math.max(0, plano.activa - 1); sel = null; });
      todo();
    }
  }

  // ── Formas de techo ────────────────────────────────────────
  // Rectángulo o L con medidas en palabras (modo simple). Devuelve null si
  // la forma se editó libremente en el modo avanzado.
  const generarL = (W, H, w2, hc) => [[0, H], [W, H], [W, H - hc], [w2, H - hc], [w2, 0], [0, 0]];
  function paramForma(L) {
    const p = L.pts, b = bbox(p), W = n2(b.x1 - b.x0), H = n2(b.y1 - b.y0);
    const igual = (q) => q.length === p.length && q.every((v, i) => Math.abs(v[0] + b.x0 - p[i][0]) < 0.6 && Math.abs(v[1] + b.y0 - p[i][1]) < 0.6);
    if (L.apoyo === 0 && igual([[0, H], [W, H], [W, 0], [0, 0]])) return { forma: 'rect', W, H };
    if (L.apoyo === 0 && p.length === 6) {
      const w2 = n2(p[3][0] - b.x0), hc = n2(H - (p[3][1] - b.y0));
      if (igual(generarL(W, H, w2, hc))) return { forma: 'ele', W, H, w2, hc };
    }
    return null;
  }
  function formaParam(L, k, v) {
    const f = paramForma(L) || { forma: 'rect', W: 400, H: 300 };
    const b = bbox(L.pts);
    if (k === 'forma') {
      if (v === 'ele' && f.forma !== 'ele') Object.assign(f, { forma: 'ele', w2: Math.round(f.W * 0.55 / 5) * 5, hc: Math.round(f.H * 0.5 / 5) * 5 });
      else f.forma = v;
    } else f[k] = Math.round(v);
    f.W = clamp(f.W, 50, 3000); f.H = clamp(f.H, 50, 2000);
    let q;
    if (f.forma === 'ele') {
      f.w2 = clamp(f.w2 || f.W / 2, 20, f.W - 20); f.hc = clamp(f.hc || f.H / 2, 20, f.H - 20);
      q = generarL(f.W, f.H, f.w2, f.hc);
    } else q = [[0, f.H], [f.W, f.H], [f.W, 0], [0, 0]];
    const ox = isFinite(b.x0) ? b.x0 : 0, oy = isFinite(b.y0) ? b.y0 : 0;
    L.pts = q.map(([x, y]) => [n2(x + ox), n2(y + oy)]);
    L.apoyo = 0;
  }
  // tras cambiar medidas grandes, reencuadra si el dibujo se salió de la vista
  function zoomSuave() {
    const L = lam(), b = extension(escena(L, kPant(), apilarPant(), flagsPant()), kPant());
    const [x0, y0] = aPant([b.x0, b.y1]), [x1, y1] = aPant([b.x1, b.y0]);
    if (x0 < 0 || y0 < 0 || x1 > vw || y1 > vh || (x1 - x0) < vw * 0.35) zoomExt();
  }
  // Repartir parejo: mismas separaciones entre aberturas y a los bordes
  function repartir() {
    const L = lam(); if (L.tipo !== 'fachada' || !L.items.length) return;
    const it = L.items.slice().sort((a, b) => a.x - b.x), total = it.reduce((s, a) => s + a.ancho, 0);
    const gap = (L.pared.ancho - total) / (it.length + 1);
    if (gap < 0) { aviso('No entran todas en la pared: agrandá el ancho de la pared.'); return; }
    cambio(() => { let x = gap; it.forEach((a) => { const o = L.items.find((i) => i.id === a.id); o.x = n2(x); x += a.ancho + gap; }); }, 'Aberturas repartidas parejo.');
    ga('plano_repartir');
  }
  function aviso(t) {
    log(t);
    let el = $('.cad__toast', raiz);
    if (!el) { el = document.createElement('div'); el.className = 'cad__toast'; el.setAttribute('role', 'status'); ui.view.appendChild(el); }
    el.textContent = t; el.classList.add('is-on');
    clearTimeout(aviso.t); aviso.t = setTimeout(() => el.classList.remove('is-on'), 2600);
  }
  function forma(tipoF) {
    const L = lam(), b = bbox(L.pts), W = Math.round(b.x1 - b.x0) || 400, H = Math.round(b.y1 - b.y0) || 300;
    cambio(() => {
      if (tipoF === 'rect') L.pts = [[0, H], [W, H], [W, 0], [0, 0]];
      else { const w2 = Math.round(W * 0.55 / 5) * 5, h2 = Math.round(H * 0.5 / 5) * 5; L.pts = [[0, H], [W, H], [W, h2], [w2, h2], [w2, 0], [0, 0]]; }
      L.apoyo = 0; sel = null;
    }, tipoF === 'rect' ? 'Forma rectangular.' : 'Forma en L: arrastrá los vértices o cambiá los largos.');
    zoomExt();
  }

  // ── Biblioteca de aberturas ────────────────────────────────
  const dlgLib = $('.cad-lib');
  function miniAbertura(t) {
    const it = nuevaAbertura(t.id), m = 2, k = Math.min(56 / it.ancho, 44 / it.alto);
    const P = mapear(geoAbertura(it), ([x, y]) => [m + (56 - it.ancho * k) / 2 + x * k, m + (44 - it.alto * k) / 2 + y * k]);
    return `<svg viewBox="0 0 60 48" aria-hidden="true">${aSvg(P, (p) => p, 1, 'pantalla')}</svg>`;
  }
  function abrirBiblioteca() {
    if (lam().tipo !== 'fachada') return log('Las aberturas se agregan en una lámina de fachada.');
    if (!dlgLib.dataset.ok) {
      const grupos = {};
      A.TIPOS.forEach((t) => { (grupos[t.grupo] = grupos[t.grupo] || []).push(`<button type="button" class="cad-lib__item" data-tipo="${t.id}">${miniAbertura(t)}<span>${esc(t.nombre)}</span><small>${t.ancho} × ${t.alto}</small></button>`); });
      $('.cad-lib__body', dlgLib).innerHTML = Object.entries(grupos).map(([g, o]) => `<h3>${g}</h3><div class="cad-lib__grid">${o.join('')}</div>`).join('');
      dlgLib.dataset.ok = '1';
    }
    dlgLib.showModal();
  }
  function insertar(tipoId) {
    const L = lam(), t = A.tipo(tipoId);
    // primer hueco libre, de izquierda a derecha
    let x = 40;
    L.items.slice().sort((a, b) => a.x - b.x).forEach((b) => { if (x + t.ancho > b.x - 20 && x < b.x + b.ancho + 20) x = b.x + b.ancho + 40; });
    cambio(() => {
      const it = nuevaAbertura(tipoId, x);
      if (it.ante + it.alto > L.pared.alto) it.ante = Math.max(0, L.pared.alto - it.alto - 20);
      L.items.push(it);
      if (x + t.ancho + 40 > L.pared.ancho) L.pared.ancho = Math.ceil((x + t.ancho + 40) / 10) * 10;
      sel = { tipo: 'ab', id: it.id };
    }, `${t.nombre} agregada. Arrastrala o cargá las medidas en Propiedades.`);
    zoomExt();
    ga('plano_abertura', { event_label: tipoId });
  }
  function traerBoceto(silencioso) {
    let lista = [];
    try { lista = JSON.parse(localStorage.getItem(BOCETO) || '[]'); } catch (_) {}
    if (!lista.length) { if (!silencioso) alert('Tu boceto está vacío. Armalo en "Diseñá tu abertura" y volvé, o agregá aberturas acá con el botón Abertura.'); return false; }
    const L = lam();
    cambio(() => {
      let x = L.items.reduce((m, i) => Math.max(m, i.x + i.ancho), 0) + 40;
      lista.forEach((b) => {
        for (let c = 0; c < Math.max(1, +b.cantidad || 1); c++) {
          const it = nuevaAbertura(b.tipo, x, { ancho: +b.ancho, alto: +b.alto, color: b.color, vidrio: b.vidrio, mosquitero: !!b.mosquitero });
          L.items.push(it); x += it.ancho + 40;
        }
      });
      L.pared.ancho = Math.max(L.pared.ancho, Math.ceil(x / 10) * 10);
      L.pared.alto = Math.max(L.pared.alto, ...L.items.map((i) => Math.ceil((i.ante + i.alto + 30) / 10) * 10));
      sel = null;
    }, `Se trajeron ${lista.reduce((s, b) => s + Math.max(1, +b.cantidad || 1), 0)} aberturas del boceto. Ubicalas arrastrando o cargá "Desde la izquierda" y "Altura desde el piso".`);
    zoomExt();
    ga('plano_boceto');
    return true;
  }

  // ── Láminas ────────────────────────────────────────────────
  const dlgNueva = $('.cad-nueva');
  function agregarLamina(tipoL) {
    const n = plano.laminas.filter((l) => l.tipo === tipoL).length + 1;
    cambio(() => { plano.laminas.push(tipoL === 'techo' ? nuevoTecho(n) : nuevaFachada(n)); plano.activa = plano.laminas.length - 1; sel = null; });
    todo(); zoomExt();
    ga('plano_lamina', { event_label: tipoL });
  }
  function todo() { pintarTabs(); pintarTools(); pintarProps(); cacheLam = null; sucio = true; pedir(); }

  // ── Protección: uso exclusivo de Alumfer ──────────────────
  // Nada sale del sistema sin pasar antes por Alumfer: para descargar o
  // compartir hay que enviar el plano (nombre y teléfono). Todo lo que se
  // exporta lleva marca de agua con los datos de quien lo hizo. El DXF y
  // las hojas sin marca son sólo para el taller (código de taller).
  // En una página web no se puede impedir una captura de pantalla: por eso
  // la marca de agua también está en la pantalla.
  const HUELLA_TALLER = '1266efebc2edc53d24157e392bb06ba37f0dc44b118342c219096cde4266d049';
  let taller = false;
  try { taller = sessionStorage.getItem('alumfer-taller') === HUELLA_TALLER; } catch (_) {}
  // firma del contenido: si el plano cambia después de enviarlo, hay que reenviarlo
  function firma() {
    const t = JSON.stringify([plano.laminas, plano.datos]);
    let h = 2166136261;
    for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  }
  const enviado = () => taller || !!(plano.envio && plano.envio.tel && plano.envio.firma === firma());
  async function huella(txt) {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
    return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
  }
  async function pedirTaller() {
    const c = prompt('Código de taller de Alumfer:');
    if (!c) return;
    let h = '';
    try { h = await huella(c.trim().toUpperCase()); } catch (_) {}
    if (h === HUELLA_TALLER) {
      taller = true;
      try { sessionStorage.setItem('alumfer-taller', h); } catch (_) {}
      raiz.classList.add('is-taller');
      aviso('Modo taller: DXF y hojas sin marca de agua habilitados.');
      cacheLam = null; pedir();
    } else aviso('Código incorrecto.');
  }
  function exigirEnvio(accion) {
    if (enviado()) return true;
    abrirEnviar(accion);
    return false;
  }
  const textoMarca = () => 'ALUMFER · alumfer.com.ar' + (plano.datos.cliente ? ' · ' + plano.datos.cliente : '');

  // ── Exportar ───────────────────────────────────────────────
  let fuente64 = null;
  async function fuente() {
    if (fuente64) return fuente64;
    try {
      const b = await (await fetch('/fonts/ibm-plex-mono-400-latin.woff2')).blob();
      fuente64 = await new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(b); });
    } catch (_) { fuente64 = ''; }
    return fuente64;
  }
  const nombreArchivo = (ext) => 'plano-alumfer' + (plano.datos.cliente ? '-' + plano.datos.cliente.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '') + '.' + ext;
  function bajar(blob, nombre) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  async function pngBlob(idx) {
    const f = await fuente();
    const svg = laminaSvg(idx, { px: 3508, fuente: f });
    const img = new Image();
    await new Promise((ok, mal) => { img.onload = ok; img.onerror = mal; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); });
    const c = document.createElement('canvas'); c.width = 3508; c.height = 2480;
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
    return new Promise((ok) => c.toBlob(ok, 'image/png'));
  }
  async function exportarPng() {
    if (!exigirEnvio('png')) return;
    const b = await pngBlob(plano.activa);
    bajar(b, nombreArchivo('png').replace('.png', '-' + (plano.activa + 1) + '.png'));
    ga('plano_png');
  }
  function exportarPdf() {
    if (!exigirEnvio('pdf')) return;
    const box = $('#cad-print');
    box.innerHTML = plano.laminas.map((_, i) => `<div class="cad-print__hoja">${laminaSvg(i)}</div>`).join('');
    ga('plano_pdf');
    setTimeout(() => window.print(), 60);
  }
  function descargarDxf() {
    if (!taller) { aviso('El DXF es sólo para el taller de Alumfer.'); return; }
    const txt = exportarDxf(), bytes = Uint8Array.from(txt, (c) => { const n = c.charCodeAt(0); return n < 256 ? n : 63; });
    bajar(new Blob([bytes], { type: 'application/dxf' }), nombreArchivo('dxf'));
    log('DXF descargado: abrilo en AutoCAD, LibreCAD o cualquier programa CAD. Unidades en cm.');
    ga('plano_dxf');
  }

  // Link del plano: el estado entero comprimido en el #
  const b64 = { de: (u8) => { let s = ''; u8.forEach((c) => { s += String.fromCharCode(c); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
    a: (s) => { const b = atob(s.replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(b, (c) => c.charCodeAt(0)); } };
  async function codificar() {
    const json = new TextEncoder().encode(JSON.stringify(plano));
    if (window.CompressionStream) {
      const buf = await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer();
      return 'z' + b64.de(new Uint8Array(buf));
    }
    return 'j' + b64.de(json);
  }
  async function decodificar(s) {
    const datos = b64.a(s.slice(1));
    if (s[0] === 'z') {
      const buf = await new Response(new Blob([datos]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer();
      return JSON.parse(new TextDecoder().decode(buf));
    }
    return JSON.parse(new TextDecoder().decode(datos));
  }
  async function linkPlano() { return location.origin + '/plano/#p=' + (await codificar()); }

  function resumenTexto(link) {
    const refs = referencias(), lin = [];
    plano.laminas.forEach((L) => {
      if (L.tipo === 'fachada') {
        lin.push(`▸ ${L.nombre} (pared ${fmt(L.pared.ancho)} × ${fmt(L.pared.alto)} cm, vista desde el ${L.vista}):`);
        const f = planilla(L, refs);
        if (!f.length) lin.push('  (sin aberturas)');
        f.forEach((r) => lin.push(`  ${r.ref} × ${r.cant} — ${A.tipo(r.it.tipo).nombre} ${fmt(r.it.ancho)} × ${fmt(r.it.alto)} cm, antepecho ${[...r.antes].join('/')} cm · ${detalleItem(r.it)}`));
      } else {
        lin.push(`▸ ${L.nombre}:`);
        datosTecho(L).forEach(([k, v]) => lin.push(`  ${k}: ${v.replace(/\u00a0/g, ' ')}`));
      }
    });
    if (link) lin.push('', 'Plano completo (se abre y se edita en la web): ' + link);
    return lin.join('\n');
  }

  const AVISO_IMPRIMIR = '<div class="cad-print__aviso"><b>ALUMFER</b><p>Para imprimir o descargar el plano, primero envialo a Alumfer desde el botón «Enviar a Alumfer». Es gratis y sin compromiso.</p><p>alumfer.com.ar · (011) 6336-8643</p></div>';

  // ── Enviar a Alumfer ───────────────────────────────────────
  const dlgEnv = $('.cad-enviar');
  function marcarEnvio() {
    const f = $('form', dlgEnv);
    plano.envio = { fecha: new Date().toISOString().slice(0, 10), tel: f['Teléfono'].value.trim(), nombre: f.Nombre.value.trim(), firma: firma() };
    guardar(); estadoEnvio(); cacheLam = null; pedir();
  }
  function estadoEnvio() {
    const ok = enviado();
    dlgEnv.classList.toggle('is-enviado', ok);
    $$('[data-env="pdf"], [data-env="png"]', dlgEnv).forEach((b) => { b.disabled = !ok; b.title = ok ? '' : 'Se habilita al enviar el plano'; });
    $$('.cad-menu [data-act]', raiz).forEach((b) => b.classList.toggle('is-bloq', !ok && b.dataset.act !== 'dxf'));
  }
  function abrirEnviar(motivo) {
    const f = $('form', dlgEnv);
    const msj = $('.cad-enviar__motivo', dlgEnv);
    if (msj) {
      msj.hidden = !motivo || enviado();
      msj.textContent = plano.envio ? 'Cambiaste el plano después de enviarlo: mandanos esta versión y se habilita la descarga.' : 'Para descargar, imprimir o compartir el plano, primero mandánoslo. Es gratis y sin compromiso: así lo tenemos para presupuestarte.';
    }
    estadoEnvio();
    f.Nombre.value = plano.datos.cliente || f.Nombre.value;
    f.Localidad.value = plano.datos.localidad || f.Localidad.value;
    $('.cad-enviar__resumen', dlgEnv).textContent = resumenTexto();
    dlgEnv.showModal();
    ga('plano_enviar_abrir');
  }
  async function enviarWa() {
    const f = $('form', dlgEnv);
    if (!f.Nombre.value.trim() || !f['Teléfono'].value.trim()) { f.reportValidity(); return; }
    plano.datos.cliente = f.Nombre.value.trim(); plano.datos.localidad = f.Localidad.value.trim(); guardar();
    const link = await linkPlano();
    const txt = `Hola, soy ${plano.datos.cliente || '(nombre)'}${plano.datos.localidad ? ', de ' + plano.datos.localidad : ''}. Les mando mi plano para presupuesto, hecho en alumfer.com.ar:\n\n` + resumenTexto(link) + (f.Consulta.value.trim() ? '\n\nComentario: ' + f.Consulta.value.trim() : '');
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(txt)}`, '_blank', 'noopener');
    marcarEnvio();
    ga('plano_whatsapp');
  }
  async function enviarForm(e) {
    e.preventDefault();
    const f = e.target, btn = $('[type="submit"]', f), lbl = btn.textContent;
    plano.datos.cliente = f.Nombre.value.trim(); plano.datos.localidad = f.Localidad.value.trim(); guardar();
    btn.disabled = true; btn.textContent = 'Enviando…';
    try {
      const fd = new FormData(f);
      fd.set('Consulta', (f.Consulta.value.trim() ? f.Consulta.value.trim() + '\n\n' : '') + 'PLANO DESDE LA WEB\n' + resumenTexto(await linkPlano()));
      const res = await fetch('/enviar.php', { method: 'POST', headers: { Accept: 'application/json' }, body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      ga('plano_formulario');
      marcarEnvio();
      btn.disabled = false; btn.textContent = '¡Enviado!';
      aviso('¡Listo! Recibimos tu plano. Ya podés descargarlo.');
    } catch (_) {
      btn.disabled = false; btn.textContent = lbl;
      alert('No pudimos enviar el plano. Probá por WhatsApp o llamanos al (011) 6336-8643.');
    }
  }

  // ── Arranque ───────────────────────────────────────────────
  const dlgInicio = $('.cad-inicio');
  function arrancar(tipoL, conBoceto) {
    plano = planoVacio();
    plano.laminas.push(tipoL === 'techo' ? nuevoTecho(1) : nuevaFachada(1));
    historial = []; rehacer = []; sel = null; guardar();
    if (dlgInicio.open) dlgInicio.close();
    todo(); zoomExt();
    if (tipoL === 'fachada' && !(conBoceto && traerBoceto(true))) setTimeout(abrirBiblioteca, 250);
    ga('plano_nuevo', { event_label: tipoL });
  }

  async function cargar() {
    const h = location.hash.match(/#p=([\w-]+)/);
    if (h) {
      try {
        const p = await decodificar(h[1]);
        if (p && Array.isArray(p.laminas) && p.laminas.length) {
          try { const prev = localStorage.getItem(CLAVE); if (prev) localStorage.setItem(CLAVE + '-anterior', prev); } catch (_) {}
          plano = p; plano.activa = 0; guardar();
          history.replaceState(null, '', location.pathname);
          log('Plano compartido abierto. Lo que cambies queda guardado en este navegador.');
          return true;
        }
      } catch (_) { log('No se pudo abrir el link del plano.'); }
    }
    try { const s = JSON.parse(localStorage.getItem(CLAVE) || 'null'); if (s && s.laminas && s.laminas.length) { plano = s; plano.activa = clamp(plano.activa || 0, 0, s.laminas.length - 1); return true; } } catch (_) {}
    return false;
  }

  function enlazar() {
    ui.svg.addEventListener('pointerdown', onDown);
    ui.svg.addEventListener('pointermove', onMove);
    ui.svg.addEventListener('pointerup', onUp);
    ui.svg.addEventListener('pointercancel', onUp);
    ui.svg.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && ui.cruz) { ui.cruz.hidden = true; tip(); } });
    ui.svg.addEventListener('wheel', onWheel, { passive: false });
    ui.svg.addEventListener('dblclick', (e) => { if (!pick(e.offsetX, e.offsetY)) zoomExt(); });
    ui.svg.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('keydown', onKey);
    new ResizeObserver(() => { medir(); if (!camTocada) zoomExt(); }).observe(ui.view);

    raiz.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act], [data-herr], [data-lam], [data-modo], [data-tg], [data-forma], [data-nivel]');
      if (!b) return;
      if (b.dataset.lam != null) { plano.activa = +b.dataset.lam; sel = null; guardar(); todo(); zoomExt(); return; }
      if (b.dataset.herr) { setHerramienta(b.dataset.herr === 'sel' ? null : b.dataset.herr); return; }
      if (b.dataset.modo) { setModo(b.dataset.modo); return; }
      if (b.dataset.tg) { alternar(b.dataset.tg); return; }
      if (b.dataset.forma) { forma(b.dataset.forma); return; }
      if (b.dataset.nivel) { setNivel(b.dataset.nivel); return; }
      const a = b.dataset.act;
      if (a === 'biblioteca') abrirBiblioteca();
      else if (a === 'boceto') traerBoceto();
      else if (a === 'repartir') repartir();
      else if (a === 'animar') animar(b.dataset.id);
      else if (a === 'real') {
        vistaReal = !vistaReal;
        try { localStorage.setItem('alumfer-plano-vista', vistaReal ? 'real' : 'tecnica'); } catch (_) {}
        pintarTools(); pedir();
        aviso(vistaReal ? 'Vista realista: colores y vidrios ilustrativos. La hoja final sale en formato técnico.' : 'Vista técnica, como sale en la hoja.');
        ga('plano_vista', { event_label: vistaReal ? 'real' : 'tecnica' });
      }
      else if (a === 'zoom') zoomExt();
      else if (a === 'undo') deshacer();
      else if (a === 'redo') rehacerFn();
      else if (a === 'modo') setModo(modo === 'lamina' ? 'modelo' : 'lamina');
      else if (a === 'nueva') dlgNueva.showModal();
      else if (a === 'exportar') { const m = $('.cad-menu', raiz); m.hidden = !m.hidden; b.setAttribute('aria-expanded', String(!m.hidden)); }
      else if (a === 'pdf') { $('.cad-menu', raiz).hidden = true; exportarPdf(); }
      else if (a === 'png') { $('.cad-menu', raiz).hidden = true; exportarPng(); }
      else if (a === 'dxf') { $('.cad-menu', raiz).hidden = true; descargarDxf(); }
      else if (a === 'link') { $('.cad-menu', raiz).hidden = true; copiarLink(); }
      else if (a === 'enviar') abrirEnviar();
      else if (a === 'props') raiz.classList.toggle('props-abiertas');
      else if (a === 'inicio') dlgInicio.showModal();
    });
    document.addEventListener('click', (e) => { const m = $('.cad-menu', raiz); if (m && !m.hidden && !e.target.closest('.cad-menu, [data-act="exportar"]')) m.hidden = true; });

    ui.props.addEventListener('toggle', (e) => { if (e.target.matches('.pp-rotulo')) rotuloAbierto = e.target.open; }, true);
    ui.props.addEventListener('change', onPropChange);
    ui.props.addEventListener('click', onPropClick);
    ui.props.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('input')) e.target.blur(); });
    if (ui.cmd) ui.cmd.addEventListener('keydown', (e) => { if (e.key === 'Enter') { ejecutar(ui.cmd.value); ui.cmd.value = ''; ui.cmd.blur(); } else if (e.key === 'Escape') { ui.cmd.value = ''; ui.cmd.blur(); } });

    dlgLib.addEventListener('click', (e) => { const b = e.target.closest('[data-tipo]'); if (b) { dlgLib.close(); insertar(b.dataset.tipo); } else if (e.target === dlgLib || e.target.closest('[data-cerrar]')) dlgLib.close(); });
    dlgNueva.addEventListener('click', (e) => { const b = e.target.closest('[data-nueva]'); if (b) { dlgNueva.close(); agregarLamina(b.dataset.nueva); } else if (e.target === dlgNueva || e.target.closest('[data-cerrar]')) dlgNueva.close(); });
    dlgInicio.addEventListener('click', (e) => { const nv = e.target.closest('[data-nivel]'); if (nv) { setNivel(nv.dataset.nivel); return; } const b = e.target.closest('[data-inicio]'); if (!b) return; if (b.dataset.inicio === 'seguir') { dlgInicio.close(); return; } arrancar(b.dataset.inicio); });
    dlgInicio.addEventListener('cancel', (e) => { if (!plano.laminas.length) e.preventDefault(); });
    dlgEnv.addEventListener('click', (e) => { if (e.target === dlgEnv || e.target.closest('[data-cerrar]')) dlgEnv.close(); if (e.target.closest('[data-env="wa"]')) enviarWa(); if (e.target.closest('[data-env="pdf"]')) exportarPdf(); if (e.target.closest('[data-env="png"]')) exportarPng(); });
    $('form', dlgEnv).addEventListener('submit', enviarForm);
    window.addEventListener('afterprint', () => { $('#cad-print').innerHTML = AVISO_IMPRIMIR; });
    $('#cad-print').innerHTML = AVISO_IMPRIMIR;
    // Ctrl/Cmd+P sin haber enviado: abre el envío
    document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p' && !enviado()) { e.preventDefault(); abrirEnviar('pdf'); } }, true);
    ui.svg.addEventListener('dragstart', (e) => e.preventDefault());
  }
  async function copiarLink() {
    if (!exigirEnvio('link')) return;
    const l = await linkPlano();
    try { await navigator.clipboard.writeText(l); log('Link del plano copiado. Quien lo abra ve el plano y lo puede editar.'); }
    catch (_) { prompt('Copiá el link del plano:', l); }
    ga('plano_link');
  }

  (async function iniciar() {
    setNivel(nivel, true);
    if (taller) raiz.classList.add('is-taller');
    enlazar();
    if (new URLSearchParams(location.search).has('taller') && !taller) setTimeout(pedirTaller, 400);
    medir();
    const hay = await cargar();
    const qs = new URLSearchParams(location.search), q = qs.get('nuevo'), boceto = qs.get('boceto') === '1';
    if (q || boceto) history.replaceState(null, '', location.pathname + location.hash);
    if (!hay && (q === 'techo' || q === 'fachada')) arrancar(q, boceto);
    else if (!hay) { todo(); dlgInicio.showModal(); }
    else {
      todo(); zoomExt();
      if (q === 'fachada' && boceto) { agregarLamina('fachada'); traerBoceto(true); }
      else if (q === 'techo' || q === 'fachada') { if (!plano.laminas.some((l) => l.tipo === q)) agregarLamina(q); else { plano.activa = plano.laminas.findIndex((l) => l.tipo === q); todo(); zoomExt(); } }
      $('[data-inicio="seguir"]', dlgInicio).hidden = false;
    }
    estadoEnvio();
    log('Listo. Escribí ? y Enter para ver los comandos.');
    raiz.classList.add('is-ready');
  })();

  // para pruebas automáticas
  window.__plano = { get: () => plano, pant: (p) => aPant(p), dxf: exportarDxf, lamina: (i) => laminaSvg(i == null ? plano.activa : i), escala: (i) => escalaLamina(plano.laminas[i == null ? plano.activa : i]).den, codificar, decodificar, cam };
})();
