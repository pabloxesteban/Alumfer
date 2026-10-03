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
    { id: 'pbalcon-corr-3', grupo: 'Puertas',  nombre: 'Puerta balcón corrediza 3 hojas', kind: 'corr',   hojas: 3, ancho: 240, alto: 205, antepecho: 0,   mosq: true },
    { id: 'pbalcon-abrir',  grupo: 'Puertas',  nombre: 'Puerta balcón de abrir',          kind: 'abrir',  hojas: 2, ancho: 140, alto: 205, antepecho: 0,   mosq: true },
    { id: 'puerta-tablero', grupo: 'Puertas',  nombre: 'Puerta de tablero / inyectada',   kind: 'ciega',  hojas: 1, ancho: 90,  alto: 205, antepecho: 0,   mosq: false, sinVidrio: true },
    // Cerramientos y complementos: mismos nombres que la app de presupuestos
    { id: 'cerramiento',    grupo: 'Cerramientos', nombre: 'Cerramiento de quincho / galería', kind: 'corr', hojas: 4, ancho: 400, alto: 220, antepecho: 0, mosq: true, max: [1200, 320] },
    { id: 'baranda',        grupo: 'Cerramientos', nombre: 'Baranda de aluminio y vidrio', kind: 'baranda',  hojas: 1, ancho: 300, alto: 100, antepecho: 0, mosq: false, max: [1200, 150], sinAcc: true },
    { id: 'porton-corr',    grupo: 'Cerramientos', nombre: 'Portón corredizo',             kind: 'porton',   hojas: 1, ancho: 300, alto: 200, antepecho: 0, mosq: false, max: [800, 300], sinVidrio: true, sinAcc: true },
    { id: 'porton-levad',   grupo: 'Cerramientos', nombre: 'Portón levadizo',              kind: 'levadizo', hojas: 1, ancho: 250, alto: 210, antepecho: 0, mosq: false, max: [600, 300], sinVidrio: true, sinAcc: true },
    { id: 'bajo-mesada',    grupo: 'Cerramientos', nombre: 'Bajo mesada de aluminio',      kind: 'mueble',   hojas: 2, ancho: 120, alto: 85,  antepecho: 0, mosq: false, sinVidrio: true, sinAcc: true },
    { id: 'mosq-corr',      grupo: 'Complementos', nombre: 'Mosquitero corredizo',         kind: 'mosq',     hojas: 2, ancho: 150, alto: 110, antepecho: 95, mosq: false, sinVidrio: true, sinAcc: true },
    { id: 'mosq-fijo',      grupo: 'Complementos', nombre: 'Mosquitero fijo',              kind: 'mosq',     hojas: 1, ancho: 100, alto: 100, antepecho: 95, mosq: false, sinVidrio: true, sinAcc: true },
    { id: 'postigon',       grupo: 'Complementos', nombre: 'Postigón de aluminio',         kind: 'postigon', hojas: 2, ancho: 150, alto: 110, antepecho: 95, mosq: false, sinVidrio: true, sinAcc: true },
    { id: 'reja',           grupo: 'Complementos', nombre: 'Reja de seguridad',            kind: 'reja',     hojas: 1, ancho: 150, alto: 110, antepecho: 95, mosq: false, sinVidrio: true, sinAcc: true }
  ];

  // Líneas de perfiles (mismos nombres que la app de presupuestos; sin precios)
  var LINEAS = [
    { id: 'asesorar', nombre: 'Que me asesoren' },
    { id: 'herrero',  nombre: 'Herrero' },
    { id: 'rotonda',  nombre: 'Rotonda' },
    { id: 'a30',      nombre: 'A30 New' },
    { id: 'modena',   nombre: 'Módena' }
  ];
  function linea(id) { return LINEAS.find(function (l) { return l.id === id; }) || LINEAS[0]; }
  function limites(t) { return { ancho: [LIMITES.ancho[0], (t.max && t.max[0]) || LIMITES.ancho[1]], alto: [LIMITES.alto[0], (t.max && t.max[1]) || LIMITES.alto[1]] }; }

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
    if (opts.foto) return real(item, opts);
    var t = tipo(item.tipo), c = color(item.color), v = vidrio(item.vidrio);
    if (['corr', 'abrir', 'puerta', 'band', 'oscilo', 'fijo', 'ciega'].indexOf(t.kind) < 0) return real(item, { opaco: true });
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
      if (opts.foto) return '';
      var l = Math.max(8, Math.min(22, W * 0.07)), a = l * 0.3;
      var x2 = x + dir * l;
      return '<path d="M' + r1(x) + ' ' + r1(y) + 'H' + r1(x2) + 'm' + r1(-dir * a) + ' ' + r1(-a) + 'l' + r1(dir * a) + ' ' + r1(a) + 'l' + r1(-dir * a) + ' ' + r1(a) + '" fill="none" stroke="' + acc + '" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    // Triángulo de apertura (punta hacia el lado de las bisagras)
    function apertura(x, y, w, h, lado) {
      if (opts.foto) return '';
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
    } else if (t.kind === 'abrir' || t.kind === 'puerta' || t.kind === 'ciega') {
      var aw = iw / n;
      for (var k = 0; k < n; k++) {
        var hx = ix + k * aw, lado = (n === 1 || k === 0) ? 'izq' : 'der';
        if (t.kind === 'ciega') {
          out.push(rect(hx, iy, aw, ih, marcoFill));
          out.push(rect(hx + aw * 0.16, iy + ih * 0.07, aw * 0.68, ih * 0.38, 'none', ' stroke-opacity="0.55"'));
          out.push(rect(hx + aw * 0.16, iy + ih * 0.52, aw * 0.68, ih * 0.4, 'none', ' stroke-opacity="0.55"'));
          out.push(apertura(hx + S, iy + S, aw - 2 * S, ih - 2 * S, lado));
        } else if (t.kind === 'puerta') {
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

  /**
   * Dibujo realista (color, vidrio, accesorios) con apertura animable.
   * item: { tipo, ancho, alto, color, vidrio, mosquitero, mano, reja, postigon }
   * opts: { t: 0..1 cuánto está abierta, luz, px, opaco }
   * Los marcos son anillos (fill-rule evenodd): el vidrio deja ver lo que
   * hay detrás, y cada hoja se puede mover sin máscaras.
   */
  function real(item, opts) {
    opts = opts || {};
    var t = tipo(item.tipo), c = color(item.color), v = vidrio(item.vidrio);
    var W = +item.ancho || t.ancho, H = +item.alto || t.alto;
    var id = 'ar' + (++uid);
    var F = Math.max(3, Math.min(6, Math.min(W, H) * 0.045));
    var S = Math.max(2.5, F * 0.75);
    var sw = r1(Math.max(0.25, Math.min(W, H) * 0.004));
    var linea = oscuro(c.solido) ? '#0B0D10' : '#3C4248';
    var T = opts.t == null ? 0 : Math.max(0, Math.min(1, +opts.t));
    var ease = function (x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
    var defs = [], out = [];
    var mf = c.solido;
    if (c.grad) {
      defs.push('<linearGradient id="' + id + 'm" x1="0" y1="0" x2="1" y2="0.25"><stop offset="0" stop-color="' + c.grad[0] + '"/><stop offset="0.5" stop-color="' + c.grad[1] + '"/><stop offset="1" stop-color="' + c.grad[2] + '"/></linearGradient>');
      mf = 'url(#' + id + 'm)';
    }
    var vf;
    if (opts.opaco) defs.push('<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + (v.id === 'esmerilado' ? '#E6ECF1' : v.id === 'espejado' ? '#9DB0C2' : '#D3E6F7') + '"/><stop offset="1" stop-color="' + (v.id === 'espejado' ? '#7F95A8' : '#ECF4FB') + '"/></linearGradient>');
    else if (v.id === 'esmerilado') defs.push('<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EEF2F5" stop-opacity="0.92"/><stop offset="1" stop-color="#DDE4EA" stop-opacity="0.88"/></linearGradient>');
    else if (v.id === 'espejado') defs.push('<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8FA4B8" stop-opacity="0.9"/><stop offset="0.45" stop-color="#DDE6EE" stop-opacity="0.9"/><stop offset="0.55" stop-color="#B9C8D5" stop-opacity="0.9"/><stop offset="1" stop-color="#6F869B" stop-opacity="0.92"/></linearGradient>');
    else defs.push('<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#CFE3F5" stop-opacity="' + (v.id === 'dvh' ? 0.34 : 0.24) + '"/><stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0.08"/><stop offset="1" stop-color="#BFD6EC" stop-opacity="' + (v.id === 'dvh' ? 0.32 : 0.22) + '"/></linearGradient>');
    vf = 'url(#' + id + 'g)';
    var pm = Math.max(0.8, Math.min(W, H) * 0.012);
    defs.push('<pattern id="' + id + 'h" width="' + r1(pm) + '" height="' + r1(pm) + '" patternUnits="userSpaceOnUse"><path d="M0 ' + r1(pm / 2) + 'h' + r1(pm) + 'M' + r1(pm / 2) + ' 0v' + r1(pm) + '" stroke="#4A535C" stroke-width="' + r1(pm * 0.16) + '" stroke-opacity="0.75"/></pattern>');
    var luz = Math.max(0.4, Math.min(1.6, +opts.luz || 1));
    defs.push('<filter id="' + id + 'L" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope="' + luz + '"/><feFuncG type="linear" slope="' + luz + '"/><feFuncB type="linear" slope="' + luz + '"/></feComponentTransfer></filter>');
    defs.push('<linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.26"/><stop offset="0.12" stop-color="#000" stop-opacity="0"/></linearGradient>');

    var st = ' stroke="' + linea + '" stroke-width="' + sw + '"';
    function R(x, y, w, h, fill, extra) { return '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(Math.max(0, w)) + '" height="' + r1(Math.max(0, h)) + '" fill="' + fill + '"' + st + (extra || '') + '/>'; }
    function rp(x, y, w, h) { return 'M' + r1(x) + ' ' + r1(y) + 'h' + r1(w) + 'v' + r1(h) + 'h' + r1(-w) + 'z'; }
    function anillo(x, y, w, h, huecos, fill) { return '<path fill-rule="evenodd" d="' + rp(x, y, w, h) + huecos.map(function (q) { return rp(q[0], q[1], q[2], q[3]); }).join('') + '" fill="' + (fill || mf) + '"' + st + '/>'; }
    function vidrioR(x, y, w, h) {
      var g = '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '" fill="' + vf + '"/>';
      if (v.id === 'dvh') { var d = Math.min(1.6, Math.min(w, h) * 0.06); g += '<rect x="' + r1(x + d) + '" y="' + r1(y + d) + '" width="' + r1(w - 2 * d) + '" height="' + r1(h - 2 * d) + '" fill="none" stroke="' + linea + '" stroke-opacity="0.22" stroke-width="' + r1(sw * 0.7) + '"/>'; }
      if (v.id !== 'esmerilado') { var k = Math.min(w, h); g += '<path d="M' + r1(x + w * 0.18) + ' ' + r1(y + h * 0.75) + 'l' + r1(k * 0.32) + ' ' + r1(-k * 0.32) + 'M' + r1(x + w * 0.28) + ' ' + r1(y + h * 0.8) + 'l' + r1(k * 0.2) + ' ' + r1(-k * 0.2) + '" stroke="#fff" stroke-opacity="0.7" stroke-width="' + r1(Math.min(W, H) * 0.008) + '" fill="none"/>'; }
      return g;
    }
    function hojaV(x, y, w, h) { return anillo(x, y, w, h, [[x + S, y + S, w - 2 * S, h - 2 * S]]) + vidrioR(x + S, y + S, w - 2 * S, h - 2 * S); }
    function manija(x, y, vertical) {
      var l = Math.max(6, Math.min(14, H * 0.08)), g = Math.max(1.2, sw * 4);
      return vertical ? '<rect x="' + r1(x - g / 2) + '" y="' + r1(y - l / 2) + '" width="' + r1(g) + '" height="' + r1(l) + '" rx="' + r1(g / 2) + '" fill="' + linea + '"/>'
        : '<rect x="' + r1(x - l / 2) + '" y="' + r1(y - g / 2) + '" width="' + r1(l) + '" height="' + r1(g) + '" rx="' + r1(g / 2) + '" fill="' + linea + '"/>';
    }
    function malla(x, y, w, h) { return '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '" fill="url(#' + id + 'h)" fill-opacity="0.9"/>'; }
    function persiana(x, y, w, h) {
      var s = R(x, y, w, h, mf), paso = Math.max(3, Math.min(6, h / 14));
      var d = '';
      for (var yy = y + S + paso; yy < y + h - S; yy += paso) d += 'M' + r1(x + S) + ' ' + r1(yy) + 'h' + r1(w - 2 * S);
      return s + '<path d="' + d + '" stroke="#000" stroke-opacity="0.28" stroke-width="' + r1(sw * 2) + '" fill="none"/>' + R(x + S * 0.6, y + S * 0.6, w - S * 1.2, h - S * 1.2, 'none', ' stroke-opacity="0.5"');
    }
    // movimientos
    function gira(cont, hx, x0, y0, w, h, s) {
      if (s <= 0) return cont;
      var k = 1 - 0.74 * s;
      return '<g transform="translate(' + r1(hx) + ' 0) scale(' + k.toFixed(3) + ' 1) translate(' + r1(-hx) + ' 0)">' + cont + '<rect x="' + r1(x0) + '" y="' + r1(y0) + '" width="' + r1(w) + '" height="' + r1(h) + '" fill="#000" fill-opacity="' + (0.3 * s).toFixed(2) + '"/></g>';
    }
    function inclina(cont, yb, x0, y0, w, h, s) {
      if (s <= 0) return cont;
      var k = 1 - 0.38 * s;
      return '<g transform="translate(0 ' + r1(yb) + ') scale(1 ' + k.toFixed(3) + ') translate(0 ' + r1(-yb) + ')">' + cont + '<rect x="' + r1(x0) + '" y="' + r1(y0) + '" width="' + r1(w) + '" height="' + r1(h) + '" fill="#000" fill-opacity="' + (0.22 * s).toFixed(2) + '"/></g>';
    }
    var mueve = function (cont, dx, dy) { return (dx || dy) ? '<g transform="translate(' + r1(dx || 0) + ' ' + r1(dy || 0) + ')">' + cont + '</g>' : cont; };

    var ix = F, iy = F, iw = W - 2 * F, ih = H - 2 * F, n = t.hojas, e = ease(T);
    var conVidrio = !t.sinVidrio, sombraInt = false;

    if (t.kind === 'corr') {
      out.push(anillo(0, 0, W, H, [[ix, iy, iw, ih]]));
      var hw = iw / n, quietas = [], movidas = [];
      for (var i = 0; i < n; i++) {
        var x = ix + i * hw - (i > 0 ? S * 0.5 : 0), w = hw + (i > 0 && i < n - 1 ? S : S * 0.5);
        var cont = hojaV(x, iy, w, ih) + manija(i < n - 1 ? x + w - S * 1.4 : x + S * 1.4, iy + ih * 0.5, true);
        var anda = i < n / 2 && !(n % 2 === 1 && i === (n - 1) / 2);
        if (anda) movidas.push(mueve(cont, (hw - S) * 0.94 * e, 0)); else quietas.push(cont);
      }
      out.push(quietas.join(''));
      if (item.mosquitero && t.mosq) out.push(malla(ix + (n - 1) * hw + S * 0.4, iy + S * 0.4, hw - S * 0.8, ih - S * 0.8));
      out.push(movidas.join(''));
      sombraInt = true;
    } else if (t.kind === 'abrir' || t.kind === 'puerta' || t.kind === 'ciega') {
      out.push(anillo(0, 0, W, H, [[ix, iy, iw, ih]]));
      if (item.mosquitero && t.mosq) out.push(malla(ix, iy, iw, ih));
      var aw = iw / n;
      for (var k2 = 0; k2 < n; k2++) {
        var hx0 = ix + k2 * aw;
        var izq = n === 1 ? item.mano !== 'der' : k2 === 0;   // bisagras a la izquierda
        var c2 = '';
        if (t.kind === 'abrir') c2 = hojaV(hx0, iy, aw, ih);
        else if (t.kind === 'puerta') {
          var tr = ih * 0.6;
          c2 = anillo(hx0, iy, aw, ih, [[hx0 + S, iy + S, aw - 2 * S, tr - S * 1.5]]) + vidrioR(hx0 + S, iy + S, aw - 2 * S, tr - S * 1.5);
          var pz = iy + tr + S * 0.5, ph = ih - tr - S * 1.5, lin = '';
          for (var z = 1; z < 5; z++) lin += 'M' + r1(hx0 + S * 1.6) + ' ' + r1(pz + ph * z / 5) + 'H' + r1(hx0 + aw - S * 1.6);
          c2 += '<path d="' + lin + '" stroke="#000" stroke-opacity="0.22" stroke-width="' + r1(sw * 1.6) + '" fill="none"/>';
        } else {
          c2 = R(hx0, iy, aw, ih, mf);
          var m = aw * 0.16;
          c2 += R(hx0 + m, iy + ih * 0.07, aw - 2 * m, ih * 0.38, 'none', ' stroke-opacity="0.55"') + R(hx0 + m, iy + ih * 0.52, aw - 2 * m, ih * 0.4, 'none', ' stroke-opacity="0.55"');
          c2 += '<rect x="' + r1(hx0 + m + 1.2) + '" y="' + r1(iy + ih * 0.07 + 1.2) + '" width="' + r1(aw - 2 * m - 2.4) + '" height="' + r1(ih * 0.38 - 2.4) + '" fill="none" stroke="#fff" stroke-opacity="0.25" stroke-width="' + sw + '"/>';
        }
        c2 += manija(izq ? hx0 + aw - S * 1.5 : hx0 + S * 1.5, iy + ih * (t.kind === 'abrir' ? 0.5 : 0.52), true);
        out.push(gira(c2, izq ? hx0 : hx0 + aw, hx0, iy, aw, ih, e));
      }
      sombraInt = true;
    } else if (t.kind === 'band') {
      out.push(anillo(0, 0, W, H, [[ix, iy, iw, ih]]));
      out.push(inclina(hojaV(ix, iy, iw, ih) + manija(ix + iw / 2, iy + S * 1.5, false), iy + ih, ix, iy, iw, ih, e));
      sombraInt = true;
    } else if (t.kind === 'oscilo') {
      out.push(anillo(0, 0, W, H, [[ix, iy, iw, ih]]));
      var cont3 = hojaV(ix, iy, iw, ih) + manija(item.mano === 'der' ? ix + S * 1.5 : ix + iw - S * 1.5, iy + ih * 0.5, true);
      // primero bascula (ventila), después abre como hoja de abrir
      if (T <= 0.45) out.push(inclina(cont3, iy + ih, ix, iy, iw, ih, ease(Math.min(1, T / 0.22)) * (T > 0.3 ? Math.max(0, 1 - (T - 0.3) / 0.15) : 1)));
      else out.push(gira(cont3, item.mano === 'der' ? ix + iw : ix, ix, iy, iw, ih, ease((T - 0.45) / 0.55)));
      sombraInt = true;
    } else if (t.kind === 'fijo') {
      out.push(anillo(0, 0, W, H, [[ix, iy, iw, ih]]) + vidrioR(ix, iy, iw, ih));
      sombraInt = true;
    } else if (t.kind === 'baranda') {
      var np = Math.max(1, Math.ceil(W / 120)), pw = 4.5, top = 6, base = 4;
      for (var b = 0; b < np; b++) { var gx = b * W / np + pw / 2 + 1, gw = W / np - pw - 2; out.push(vidrioR(gx, top + 2, gw, H - top - base - 4)); }
      for (var q = 0; q <= np; q++) out.push(R(Math.min(W - pw, Math.max(0, q * W / np - pw / 2)), 0, pw, H, mf));
      out.push(R(-1, 0, W + 2, top, mf) + R(0, H - base, W, base, mf));
    } else if (t.kind === 'porton') {
      var hojaP = R(0, 0, W, H, mf), tab = '';
      for (var yy2 = 10; yy2 < H - 4; yy2 += 10) tab += 'M' + r1(S) + ' ' + r1(yy2) + 'H' + r1(W - S);
      hojaP += '<path d="' + tab + '" stroke="#000" stroke-opacity="0.22" stroke-width="' + r1(sw * 2) + '" fill="none"/>' + R(S, S, W - 2 * S, H - 2 * S, 'none', ' stroke-opacity="0.45"');
      hojaP += manija(S * 2, H * 0.5, true);
      out.push(mueve(hojaP, W * 0.92 * e, 0));
    } else if (t.kind === 'levadizo') {
      defs.push('<clipPath id="' + id + 'c"><rect x="0" y="0" width="' + W + '" height="' + H + '"/></clipPath>');
      var hojaL = R(0, 0, W, H, mf), secc = '', tb = '';
      for (var p4 = 1; p4 < 4; p4++) secc += 'M0 ' + r1(H * p4 / 4) + 'H' + r1(W);
      for (var yy3 = 6; yy3 < H; yy3 += 6) tb += 'M' + r1(S) + ' ' + r1(yy3) + 'H' + r1(W - S);
      hojaL += '<path d="' + tb + '" stroke="#000" stroke-opacity="0.12" stroke-width="' + sw + '" fill="none"/><path d="' + secc + '" stroke="' + linea + '" stroke-width="' + r1(sw * 2) + '" fill="none"/>' + manija(W / 2, H - 6, false);
      out.push('<g clip-path="url(#' + id + 'c)">' + mueve(hojaL, 0, -H * 0.92 * e) + '</g>');
      out.push(R(0, 0, W, H, 'none'));
    } else if (t.kind === 'mueble') {
      var mes = 4, dw = W / 2;
      out.push(R(0, mes, W, H - mes, '#3A3F45'));
      for (var d2 = 0; d2 < 2; d2++) {
        var dx0 = d2 * dw, izq2 = d2 === 0, puertaM = R(dx0 + 0.6, mes + 0.6, dw - 1.2, H - mes - 1.2, mf) + R(dx0 + dw * 0.12, mes + (H - mes) * 0.1, dw * 0.76, (H - mes) * 0.8, 'none', ' stroke-opacity="0.4"') + manija(izq2 ? dx0 + dw - 4 : dx0 + 4, mes + 10, true);
        out.push(gira(puertaM, izq2 ? dx0 : dx0 + dw, dx0, mes, dw, H - mes, e * 0.9));
      }
      out.push(R(-2, 0, W + 4, mes, '#A9AFB5'));
    } else if (t.kind === 'mosq') {
      var fm = Math.max(2, F * 0.6);
      out.push(anillo(0, 0, W, H, [[fm, fm, W - 2 * fm, H - 2 * fm]]));
      if (n === 1) out.push(malla(fm, fm, W - 2 * fm, H - 2 * fm));
      else {
        var mw = (W - 2 * fm) / 2;
        out.push(anillo(fm + mw, fm, mw, H - 2 * fm, [[fm + mw + 2, fm + 2, mw - 4, H - 2 * fm - 4]]) + malla(fm + mw + 2, fm + 2, mw - 4, H - 2 * fm - 4));
        out.push(mueve(anillo(fm, fm, mw, H - 2 * fm, [[fm + 2, fm + 2, mw - 4, H - 2 * fm - 4]]) + malla(fm + 2, fm + 2, mw - 4, H - 2 * fm - 4), (mw - 2) * 0.94 * e, 0));
      }
    } else if (t.kind === 'postigon') {
      var pw2 = W / 2;
      out.push(gira(persiana(0, 0, pw2, H), 0, 0, 0, pw2, H, e) + gira(persiana(pw2, 0, pw2, H), W, pw2, 0, pw2, H, e));
    } else if (t.kind === 'reja') {
      out.push(rejaR(0, 0, W, H, true));
    }

    function rejaR(x, y, w, h, marco) {
      var g = '', bw = Math.max(1.4, Math.min(2.2, w * 0.012)), nb = Math.max(2, Math.round(w / 12));
      if (marco) g += anillo(x, y, w, h, [[x + 3, y + 3, w - 6, h - 6]]);
      for (var i2 = 1; i2 < nb; i2++) g += R(x + i2 * w / nb - bw / 2, y, bw, h, mf);
      g += R(x, y + h * 0.33 - bw / 2, w, bw, mf) + R(x, y + h * 0.66 - bw / 2, w, bw, mf);
      return g;
    }
    // sombra en la parte de arriba del vano: da profundidad
    if (sombraInt && !opts.opaco) out.push('<rect x="' + r1(ix) + '" y="' + r1(iy) + '" width="' + r1(iw) + '" height="' + r1(ih) + '" fill="url(#' + id + 's)" pointer-events="none"/>');
    // accesorios de ventanas y puertas
    if (!t.sinAcc && item.reja) out.push(rejaR(0, 0, W, H, false));
    if (!t.sinAcc && item.postigon) out.push(persiana(-W / 2 - 1, 0, W / 2, H) + persiana(W + 1, 0, W / 2, H));

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" overflow="visible"' + (opts.px ? ' width="' + opts.px + '" height="' + Math.round(opts.px * H / W) + '"' : '') + '><defs>' + defs.join('') + '</defs><g filter="url(#' + id + 'L)">' + out.join('') + '</g></svg>';
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
    var partes = [t.nombre, item.ancho + ' × ' + item.alto + ' cm'];
    if (!t.sinVidrio) partes.push('vidrio ' + v.nombre.replace(' (doble vidriado)', ''));
    partes.push(c.grupo.toLowerCase() + ' ' + c.nombre.toLowerCase());
    if (item.linea && item.linea !== 'asesorar') partes.push('línea ' + linea(item.linea).nombre);
    if (item.mosquitero && t.mosq) partes.push('con mosquitero');
    if (item.reja && !t.sinAcc) partes.push('con reja');
    if (item.postigon && !t.sinAcc) partes.push('con postigón');
    var s = partes.join(' · ');
    if (+item.cantidad > 1) s = item.cantidad + ' × ' + s;
    if (item.nota) s += ' — ' + item.nota;
    return s;
  }

  return { TIPOS: TIPOS, COLORES: COLORES, VIDRIOS: VIDRIOS, LINEAS: LINEAS, LIMITES: LIMITES, limites: limites, tipo: tipo, color: color, vidrio: vidrio, linea: linea, dibujar: dibujar, real: real, resumen: resumen };
})();
