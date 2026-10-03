// ============================================================
// ALUMFER — aberturas.js
// Dibujo paramétrico de aberturas a escala (SVG), con cotas.
// Lo usa el diseñador (/disena-tu-abertura/). Las tipologías y
// sus nombres son los mismos de la app interna de presupuestos,
// así lo que manda el cliente se carga tal cual.
// Unidades del dibujo: centímetros.
// ============================================================

window.Aberturas = (function () {
  'use strict';

  // kind: cómo se dibuja · hojas · medida inicial · antepecho (altura desde el piso)
  var TIPOS = [
    { id: 'vent-corr-2',    grupo: 'Ventanas', nombre: 'Ventana corrediza 2 hojas',       kind: 'corr',   hojas: 2, ancho: 150, alto: 110, antepecho: 95,  mosq: true },
    { id: 'vent-corr-3',    grupo: 'Ventanas', nombre: 'Ventana corrediza 3 hojas',       kind: 'corr',   hojas: 3, ancho: 200, alto: 110, antepecho: 95,  mosq: true },
    { id: 'vent-corr-4',    grupo: 'Ventanas', nombre: 'Ventana corrediza 4 hojas',       kind: 'corr',   hojas: 4, ancho: 260, alto: 120, antepecho: 90,  mosq: true },
    { id: 'vent-abrir-1',   grupo: 'Ventanas', nombre: 'Ventana de abrir 1 hoja',         kind: 'abrir',  hojas: 1, ancho: 60,  alto: 90,  antepecho: 100, mosq: true },
    { id: 'vent-abrir-2',   grupo: 'Ventanas', nombre: 'Ventana de abrir 2 hojas',        kind: 'abrir',  hojas: 2, ancho: 120, alto: 110, antepecho: 95,  mosq: true },
    { id: 'banderola',      grupo: 'Ventanas', nombre: 'Banderola / ventiluz',            kind: 'band',   hojas: 1, ancho: 60,  alto: 40,  antepecho: 170, mosq: false },
    { id: 'oscilo',         grupo: 'Ventanas', nombre: 'Ventana oscilobatiente',          kind: 'oscilo', hojas: 1, ancho: 70,  alto: 110, antepecho: 95,  mosq: false },
    { id: 'pano-fijo',      grupo: 'Ventanas', nombre: 'Paño fijo',                       kind: 'fijo',   hojas: 1, ancho: 100, alto: 100, antepecho: 95,  mosq: false },
    { id: 'puerta-abrir',   grupo: 'Puertas',  nombre: 'Puerta de abrir 1 hoja',          kind: 'puerta', hojas: 1, ancho: 90,  alto: 205, antepecho: 0,   mosq: false },
    { id: 'puerta-doble',   grupo: 'Puertas',  nombre: 'Puerta doble de abrir',           kind: 'puerta', hojas: 2, ancho: 150, alto: 205, antepecho: 0,   mosq: false },
    { id: 'pbalcon-corr-2', grupo: 'Puertas',  nombre: 'Puerta balcón corrediza 2 hojas', kind: 'corr',   hojas: 2, ancho: 180, alto: 205, antepecho: 0,   mosq: true },
    { id: 'pbalcon-corr-3', grupo: 'Puertas',  nombre: 'Puerta balcón corrediza 3 hojas', kind: 'corr',   hojas: 3, ancho: 240, alto: 205, antepecho: 0,   mosq: true }
  ];

  var LIMITES = { ancho: [30, 400], alto: [30, 260] };

  // Terminaciones (mismas que el configurador de la home)
  var COLORES = [
    { id: 'blanco',        grupo: 'Pintura',   nombre: 'Blanco',          solido: '#EEEEEA' },
    { id: 'negro',         grupo: 'Pintura',   nombre: 'Negro',           solido: '#1E1F21' },
    { id: 'bronce',        grupo: 'Pintura',   nombre: 'Bronce colonial', solido: '#4A3B30' },
    { id: 'gris',          grupo: 'Pintura',   nombre: 'Gris',            solido: '#8A8E94' },
    { id: 'simil-madera',  grupo: 'Pintura',   nombre: 'Símil madera',    solido: '#93491B', grad: ['#8B4513', '#B65E2A', '#7A3A10'] },
    { id: 'microtexturado',grupo: 'Pintura',   nombre: 'Microtexturado',  solido: '#D2D2CF' },
    { id: 'azul',          grupo: 'Pintura',   nombre: 'Azul',            solido: '#1B4F8A' },
    { id: 'verde',         grupo: 'Pintura',   nombre: 'Verde',           solido: '#2E7D32' },
    { id: 'rojo',          grupo: 'Pintura',   nombre: 'Rojo',            solido: '#B71C1C' },
    { id: 'amarillo',      grupo: 'Pintura',   nombre: 'Amarillo',        solido: '#F9A825' },
    { id: 'anod-natural',  grupo: 'Anodizado', nombre: 'Natural',         solido: '#C2C2C2', grad: ['#B8B8B8', '#DADADA', '#A8A8A8'] },
    { id: 'anod-oro',      grupo: 'Anodizado', nombre: 'Oro',             solido: '#CFAE52', grad: ['#C8A84B', '#E8C86A', '#B89438'] },
    { id: 'anod-negro',    grupo: 'Anodizado', nombre: 'Negro',           solido: '#202020', grad: ['#1A1A1A', '#2E2E2E', '#111111'] },
    { id: 'anod-champagne',grupo: 'Anodizado', nombre: 'Champagne',       solido: '#D6C8A6', grad: ['#D4C5A0', '#E8DCC0', '#C4B590'] },
    { id: 'anod-peltre',   grupo: 'Anodizado', nombre: 'Peltre',          solido: '#909090', grad: ['#8A8A8A', '#A8A8A8', '#787878'] }
  ];

  var VIDRIOS = [
    { id: 'transparente', nombre: 'Transparente' },
    { id: 'esmerilado',   nombre: 'Esmerilado' },
    { id: 'espejado',     nombre: 'Espejado' },
    { id: 'dvh',          nombre: 'DVH (doble vidriado)' }
  ];

  function tipo(id)   { return TIPOS.find(function (t) { return t.id === id; }) || TIPOS[0]; }
  function color(id)  { return COLORES.find(function (c) { return c.id === id; }) || COLORES[0]; }
  function vidrio(id) { return VIDRIOS.find(function (v) { return v.id === id; }) || VIDRIOS[0]; }

  function oscuro(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) < 120;
  }

  var uid = 0;

  /**
   * Devuelve el SVG de una abertura.
   * item: { tipo, ancho, alto, color, vidrio, mosquitero }
   * opts: { cotas, persona, anim, mini }
   */
  function dibujar(item, opts) {
    opts = opts || {};
    var t = tipo(item.tipo), c = color(item.color), v = vidrio(item.vidrio);
    var W = +item.ancho || t.ancho, H = +item.alto || t.alto;
    var id = 'ab' + (++uid);
    var F = Math.max(3, Math.min(6, Math.min(W, H) * 0.045));   // marco
    var S = Math.max(2.5, F * 0.75);                             // perfil de hoja
    var linea = oscuro(c.solido) ? '#0B0D10' : '#3C4248';
    var acc = '#1B6CC8';
    var out = [];

    // ── defs: color del perfil y vidrio ─────────────────────
    var defs = [];
    var marcoFill = c.solido;
    if (c.grad) {
      defs.push('<linearGradient id="' + id + 'm" x1="0" y1="0" x2="1" y2="0.25"><stop offset="0" stop-color="' + c.grad[0] + '"/><stop offset="0.5" stop-color="' + c.grad[1] + '"/><stop offset="1" stop-color="' + c.grad[2] + '"/></linearGradient>');
      marcoFill = 'url(#' + id + 'm)';
    }
    var vidrioFill;
    if (v.id === 'esmerilado') {
      defs.push('<pattern id="' + id + 'g" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#E6ECF1"/><circle cx="1" cy="1" r="0.45" fill="#C9D3DC"/><circle cx="2.4" cy="2.2" r="0.35" fill="#D5DDE4"/></pattern>');
      vidrioFill = 'url(#' + id + 'g)';
    } else if (v.id === 'espejado') {
      defs.push('<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9DB0C2"/><stop offset="0.45" stop-color="#DCE5EC"/><stop offset="0.55" stop-color="#C3D0DB"/><stop offset="1" stop-color="#7F95A8"/></linearGradient>');
      vidrioFill = 'url(#' + id + 'g)';
    } else {
      defs.push('<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D3E6F7"/><stop offset="1" stop-color="#ECF4FB"/></linearGradient>');
      vidrioFill = 'url(#' + id + 'g)';
    }
    defs.push('<pattern id="' + id + 'h" width="2" height="2" patternUnits="userSpaceOnUse"><path d="M0 1h2M1 0v2" stroke="#5B6670" stroke-width="0.18"/></pattern>');

    function rect(x, y, w, h, fill, extra) {
      return '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(Math.max(0, w)) + '" height="' + r1(Math.max(0, h)) + '" fill="' + fill + '" stroke="' + linea + '" stroke-width="1" vector-effect="non-scaling-stroke"' + (extra || '') + '/>';
    }
    function path(d, extra, trazo) {
      return '<path d="' + d + '" fill="none" stroke="' + (trazo || linea) + '" stroke-width="1" vector-effect="non-scaling-stroke"' + (extra || '') + '/>';
    }
    function reflejo(x, y, w, h) {
      var k = Math.min(w, h);
      return '<path d="M' + r1(x + w * 0.18) + ' ' + r1(y + h * 0.75) + 'l' + r1(k * 0.32) + ' ' + r1(-k * 0.32) + 'M' + r1(x + w * 0.28) + ' ' + r1(y + h * 0.8) + 'l' + r1(k * 0.2) + ' ' + r1(-k * 0.2) + '" stroke="#fff" stroke-opacity="0.75" stroke-width="1.4" vector-effect="non-scaling-stroke" fill="none"/>';
    }
    function pano(x, y, w, h) {
      var s = rect(x, y, w, h, vidrioFill);
      if (v.id === 'dvh') {
        var d = Math.min(1.6, Math.min(w, h) * 0.06);
        s += rect(x + d, y + d, w - 2 * d, h - 2 * d, 'none', ' stroke-opacity="0.55" stroke-dasharray="3 2"');
      }
      if (v.id !== 'esmerilado') s += reflejo(x, y, w, h);
      return s;
    }
    function hoja(x, y, w, h) { return rect(x, y, w, h, marcoFill) + pano(x + S, y + S, w - 2 * S, h - 2 * S); }
    function manija(x, y, vertical) {
      var l = Math.max(6, Math.min(14, H * 0.08));
      return vertical
        ? '<rect x="' + r1(x - 0.9) + '" y="' + r1(y - l / 2) + '" width="1.8" height="' + r1(l) + '" rx="0.9" fill="' + linea + '"/>'
        : '<rect x="' + r1(x - l / 2) + '" y="' + r1(y - 0.9) + '" width="' + r1(l) + '" height="1.8" rx="0.9" fill="' + linea + '"/>';
    }
    function flecha(x, y, dir) {
      var l = Math.max(8, Math.min(22, W * 0.07)), a = l * 0.3;
      var x2 = x + dir * l;
      return '<path d="M' + r1(x) + ' ' + r1(y) + 'H' + r1(x2) + 'm' + r1(-dir * a) + ' ' + r1(-a) + 'l' + r1(dir * a) + ' ' + r1(a) + 'l' + r1(-dir * a) + ' ' + r1(a) + '" fill="none" stroke="' + acc + '" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    // Triángulo de apertura (punta hacia el lado de las bisagras)
    function apertura(x, y, w, h, lado) {
      var p;
      if (lado === 'izq') p = 'M' + r1(x + w) + ' ' + r1(y) + 'L' + r1(x) + ' ' + r1(y + h / 2) + 'L' + r1(x + w) + ' ' + r1(y + h);
      if (lado === 'der') p = 'M' + r1(x) + ' ' + r1(y) + 'L' + r1(x + w) + ' ' + r1(y + h / 2) + 'L' + r1(x) + ' ' + r1(y + h);
      if (lado === 'abajo') p = 'M' + r1(x) + ' ' + r1(y) + 'L' + r1(x + w / 2) + ' ' + r1(y + h) + 'L' + r1(x + w) + ' ' + r1(y);
      if (lado === 'arriba') p = 'M' + r1(x) + ' ' + r1(y + h) + 'L' + r1(x + w / 2) + ' ' + r1(y) + 'L' + r1(x + w) + ' ' + r1(y + h);
      return path(p, ' stroke-dasharray="4 3" stroke-opacity="0.85"', acc);
    }

    // ── abertura ────────────────────────────────────────────
    out.push(rect(0, 0, W, H, marcoFill));
    var ix = F, iy = F, iw = W - 2 * F, ih = H - 2 * F;
    var n = t.hojas;

    if (t.kind === 'corr') {
      var hw = iw / n;
      for (var i = 0; i < n; i++) {
        var x = ix + i * hw - (i > 0 ? S * 0.5 : 0), w = hw + (i > 0 && i < n - 1 ? S : S * 0.5);
        out.push(hoja(x, iy, w, ih));
      }
      for (var j = 0; j < n; j++) {
        var cx = ix + j * hw + hw / 2, cy = iy + ih * 0.5;
        var dir = (n % 2 === 1 && j === (n - 1) / 2) ? 0 : (j < n / 2 ? 1 : -1);
        if (dir === 0) { out.push(flecha(cx, cy, 1)); out.push(flecha(cx, cy, -1)); }
        else out.push(flecha(cx - dir * Math.min(10, hw * 0.15), cy, dir));
        if (j < n - 1) out.push(manija(ix + (j + 1) * hw - S * 1.4, iy + ih * 0.5, true));
      }
      if (item.mosquitero && t.mosq) {
        var mx = ix + (n - 1) * hw, mw = hw;
        out.push('<rect x="' + r1(mx + S * 0.4) + '" y="' + r1(iy + S * 0.4) + '" width="' + r1(mw - S * 0.8) + '" height="' + r1(ih - S * 0.8) + '" fill="url(#' + id + 'h)" fill-opacity="0.85" stroke="#5B6670" stroke-width="1" stroke-dasharray="2 2" vector-effect="non-scaling-stroke"/>');
      }
    } else if (t.kind === 'abrir' || t.kind === 'puerta') {
      var aw = iw / n;
      for (var k = 0; k < n; k++) {
        var hx = ix + k * aw, lado = (n === 1 || k === 0) ? 'izq' : 'der';
        if (t.kind === 'puerta') {
          var travesano = ih * 0.6;
          out.push(rect(hx, iy, aw, ih, marcoFill));
          out.push(pano(hx + S, iy + S, aw - 2 * S, travesano - S * 1.5));
          var pz = iy + travesano + S * 0.5, ph = ih - travesano - S * 1.5;
          out.push(rect(hx + S, pz, aw - 2 * S, ph, marcoFill));
          var lineas = '';
          for (var z = 1; z < 5; z++) lineas += 'M' + r1(hx + S * 1.6) + ' ' + r1(pz + ph * z / 5) + 'H' + r1(hx + aw - S * 1.6);
          out.push(path(lineas, ' stroke-opacity="0.45"'));
          out.push(apertura(hx + S, iy + S, aw - 2 * S, travesano - S * 1.5, lado));
        } else {
          out.push(hoja(hx, iy, aw, ih));
          out.push(apertura(hx + S, iy + S, aw - 2 * S, ih - 2 * S, lado));
        }
        var mxx = lado === 'izq' ? hx + aw - S * 1.5 : hx + S * 1.5;
        out.push(manija(mxx, iy + ih * (t.kind === 'puerta' ? 0.52 : 0.5), true));
      }
      if (item.mosquitero && t.mosq) {
        out.push('<rect x="' + r1(ix + S) + '" y="' + r1(iy + S) + '" width="' + r1(iw - 2 * S) + '" height="' + r1(ih - 2 * S) + '" fill="url(#' + id + 'h)" fill-opacity="0.5" stroke="#5B6670" stroke-dasharray="2 2" stroke-width="1" vector-effect="non-scaling-stroke"/>');
      }
    } else if (t.kind === 'band') {
      out.push(hoja(ix, iy, iw, ih));
      out.push(apertura(ix + S, iy + S, iw - 2 * S, ih - 2 * S, 'abajo'));
      out.push(manija(ix + iw / 2, iy + S * 1.5, false));
    } else if (t.kind === 'oscilo') {
      out.push(hoja(ix, iy, iw, ih));
      out.push(apertura(ix + S, iy + S, iw - 2 * S, ih - 2 * S, 'izq'));
      out.push(apertura(ix + S, iy + S, iw - 2 * S, ih - 2 * S, 'abajo'));
      out.push(manija(ix + iw - S * 1.5, iy + ih * 0.5, true));
    } else {
      out.push(pano(ix, iy, iw, ih));
    }

    // ── escena: piso y persona de referencia ────────────────
    var piso = H + t.antepecho;
    var escena = '';
    var personaX = W + 30;
    if (opts.persona) {
      escena += '<line x1="-40" y1="' + piso + '" x2="' + (W + 110) + '" y2="' + piso + '" stroke="currentColor" stroke-opacity="0.45" stroke-width="1" vector-effect="non-scaling-stroke"/>';
      if (t.antepecho > 0) escena += '<line x1="0" y1="' + H + '" x2="0" y2="' + piso + '" stroke="currentColor" stroke-opacity="0.25" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/>';
      escena += persona(personaX, piso, Math.max(W + 120, 200) / 30);
    }

    // ── cotas ───────────────────────────────────────────────
    var cotas = '';
    var vbX = -14, vbY = -14, vbW = W + 28, vbH = H + 28;
    if (opts.persona) {
      vbW = Math.max(vbW, personaX + 60 + 14);
      var top = Math.min(0, piso - 185);
      vbY = Math.min(vbY, top - 6);
      vbH = piso + 14 - vbY;
      vbX = -40;
      vbW = vbW + 26;
    }
    if (opts.cotas) {
      var fs = Math.max(vbW, vbH) / (opts.mini ? 14 : 30);
      var off = fs * 1.3;
      vbX -= off; vbY -= off; vbW += off; vbH += off;
      var cl = ' class="anim" pathLength="1"';
      cotas += '<g class="cotas" fill="none" stroke="' + acc + '" stroke-width="1" vector-effect="non-scaling-stroke">';
      cotas += '<path' + cl + ' d="M0 ' + r1(-off * 0.55) + 'H' + W + '"/>';
      cotas += '<path d="M0 ' + r1(-off * 0.95) + 'v' + r1(off * 0.8) + 'M' + W + ' ' + r1(-off * 0.95) + 'v' + r1(off * 0.8) + '" stroke-opacity="0.6"/>';
      cotas += '<path' + cl + ' d="M' + r1(-off * 0.55) + ' 0V' + H + '"/>';
      cotas += '<path d="M' + r1(-off * 0.95) + ' 0h' + r1(off * 0.8) + 'M' + r1(-off * 0.95) + ' ' + H + 'h' + r1(off * 0.8) + '" stroke-opacity="0.6"/>';
      cotas += '</g>';
      var txt = ' font-family="IBM Plex Mono, ui-monospace, monospace" font-size="' + r1(fs) + '" fill="' + acc + '" text-anchor="middle"';
      cotas += '<text x="' + r1(W / 2) + '" y="' + r1(-off * 0.55 - fs * 0.35) + '"' + txt + ' paint-order="stroke" stroke="var(--cota-bg, #fff)" stroke-width="' + r1(fs * 0.5) + '">' + W + ' cm</text>';
      cotas += '<text x="' + r1(-off * 0.55 - fs * 0.35) + '" y="' + r1(H / 2) + '" transform="rotate(-90 ' + r1(-off * 0.55 - fs * 0.35) + ' ' + r1(H / 2) + ')"' + txt + ' paint-order="stroke" stroke="var(--cota-bg, #fff)" stroke-width="' + r1(fs * 0.5) + '">' + H + ' cm</text>';
      if (opts.persona && t.antepecho > 0) {
        cotas += '<text x="' + r1(fs * 0.5) + '" y="' + r1(H + t.antepecho / 2) + '" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="' + r1(fs * 0.8) + '" fill="currentColor" fill-opacity="0.6" text-anchor="start">≈' + t.antepecho + ' cm del piso</text>';
      }
    }

    var label = t.nombre + ', ' + W + ' por ' + H + ' centímetros, vidrio ' + v.nombre.toLowerCase() + ', color ' + c.nombre.toLowerCase();
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + r1(vbX) + ' ' + r1(vbY) + ' ' + r1(vbW) + ' ' + r1(vbH) + '" role="img" aria-label="' + label + '"' + (opts.anim ? ' class="is-anim"' : '') + '><defs>' + defs.join('') + '</defs>' + escena + '<g class="abertura">' + out.join('') + '</g>' + cotas + '</svg>';
  }

  function persona(x, piso, fs) {
    // Silueta de 1,70 m, de perfil neutro
    var y = piso - 170;
    return '<g class="persona" fill="currentColor" fill-opacity="0.32">' +
      '<circle cx="' + (x + 22) + '" cy="' + (y + 11) + '" r="11"/>' +
      '<path d="M' + (x + 8) + ' ' + (y + 28) + 'q14 -6 28 0l6 58h-8l-5 -40v124h-9v-70h-4v70h-9v-124l-5 40h-8z"/>' +
      '<text x="' + (x + 22) + '" y="' + (y - 6) + '" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="' + r1(fs * 0.85) + '" text-anchor="middle" fill-opacity="0.9">1,70 m</text>' +
      '</g>';
  }

  function r1(n) { return Math.round(n * 10) / 10; }

  function resumen(item) {
    var t = tipo(item.tipo), c = color(item.color), v = vidrio(item.vidrio);
    var partes = [t.nombre, item.ancho + ' × ' + item.alto + ' cm', 'vidrio ' + v.nombre.replace(' (doble vidriado)', ''), c.grupo.toLowerCase() + ' ' + c.nombre.toLowerCase()];
    if (item.mosquitero && t.mosq) partes.push('con mosquitero');
    var s = partes.join(' · ');
    if (+item.cantidad > 1) s = item.cantidad + ' × ' + s;
    if (item.nota) s += ' — ' + item.nota;
    return s;
  }

  return { TIPOS: TIPOS, COLORES: COLORES, VIDRIOS: VIDRIOS, LIMITES: LIMITES, tipo: tipo, color: color, vidrio: vidrio, dibujar: dibujar, resumen: resumen };
})();
