/* ============================================================
   ALUMFER — Presupuestos · Íconos

   Dibujos simples de cada tipo de abertura, para reconocerla de
   un vistazo sin leer. Son SVG de línea: heredan el color del
   texto y escalan sin perder nitidez.
   ============================================================ */

window.Iconos = (function () {
  'use strict';

  function svg(contenido, caja) {
    return '<svg viewBox="0 0 ' + (caja || '48 48') + '" fill="none" stroke="currentColor" ' +
           'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
           contenido + '</svg>';
  }

  var MARCO_ANCHO = '<rect x="5" y="9" width="38" height="30" rx="1.5"/>';
  var MARCO_ALTO  = '<rect x="12" y="4" width="24" height="40" rx="1.5"/>';
  var FLECHA      = '<path d="M14 24h9m0 0-3.2-3.2M23 24l-3.2 3.2"/>';

  /* Dibujos por tipología (ids de precios-base.js) */
  var ABERTURAS = {
    // Ventanas
    'vent-corr-2': MARCO_ANCHO + '<path d="M24 9v30"/>' + FLECHA,
    'vent-corr-3': MARCO_ANCHO + '<path d="M17.7 9v30M30.3 9v30"/><path d="M8 24h6.5m0 0-2.6-2.6M14.5 24l-2.6 2.6"/>',
    'vent-corr-4': MARCO_ANCHO + '<path d="M14.5 9v30M24 9v30M33.5 9v30"/><path d="M7 24h5m0 0-2-2M12 24l-2 2"/><path d="M41 24h-5m0 0 2-2M36 24l2 2"/>',
    'vent-abrir-1': MARCO_ANCHO + '<path d="M40 11 9 24l31 13"/><circle cx="39" cy="24" r="1.6" fill="currentColor"/>',
    'vent-abrir-2': MARCO_ANCHO + '<path d="M24 9v30"/><path d="M22 11 7 24l15 13"/><path d="M26 11l15 13-15 13"/>',
    'banderola':    MARCO_ANCHO + '<path d="M7 37 24 12l17 25"/>',
    'oscilo':       MARCO_ANCHO + '<path d="M40 11 9 24l31 13"/><path d="M7 37 24 24l17 13"/>',
    'pano-fijo':    MARCO_ANCHO + '<rect x="11" y="15" width="26" height="18" rx="1"/>',

    // Puertas
    'puerta-abrir':   MARCO_ALTO + '<path d="M33 7 15 24l18 17"/><circle cx="31" cy="25" r="1.6" fill="currentColor"/>',
    'puerta-doble':   MARCO_ALTO + '<path d="M24 4v40"/><circle cx="21.5" cy="25" r="1.4" fill="currentColor"/><circle cx="26.5" cy="25" r="1.4" fill="currentColor"/>',
    'puerta-tablero': MARCO_ALTO + '<rect x="17" y="9" width="14" height="13" rx="1"/><rect x="17" y="27" width="14" height="12" rx="1"/><circle cx="33" cy="25" r="1.4" fill="currentColor"/>',
    'pbalcon-corr-2': MARCO_ALTO + '<path d="M24 4v40"/><path d="M16 24h7m0 0-2.6-2.6M23 24l-2.6 2.6"/>',
    'pbalcon-corr-3': '<rect x="7" y="4" width="34" height="40" rx="1.5"/><path d="M18.3 4v40M29.7 4v40"/><path d="M10 24h6m0 0-2.4-2.4M16 24l-2.4 2.4"/>',
    'pbalcon-abrir':  MARCO_ALTO + '<path d="M33 7 15 24l18 17"/><path d="M17 13h14"/><circle cx="31" cy="25" r="1.4" fill="currentColor"/>',

    // Cerramientos y obra
    'cerramiento':    '<rect x="4" y="10" width="40" height="30" rx="1.5"/><path d="M14 10v30M24 10v30M34 10v30"/><path d="M2 44h44"/>',
    'baranda':        '<path d="M4 12h40M4 18h40"/><path d="M9 12v22M24 12v22M39 12v22"/><path d="M2 37h44"/>',
    'techo-policarb': '<path d="M4 36 16 12h30L34 36z"/><path d="M13 36 25 12M22 36 34 12"/>',
    'porton-corr':    '<rect x="4" y="12" width="40" height="26" rx="1.5"/><path d="M13 12v26M22 12v26M31 12v26"/><path d="M8 44h32m0 0-3-3m3 3-3 3"/>',
    'porton-levad':   '<rect x="6" y="10" width="36" height="28" rx="1.5"/><path d="M6 18h36M6 26h36M6 34h36"/><path d="M24 46V40m0 0-3 3m3-3 3 3"/>',
    'bajo-mesada':    '<path d="M3 14h42"/><rect x="7" y="18" width="34" height="22" rx="1.5"/><path d="M24 18v22"/><path d="M20 28h-2M30 28h-2"/>',

    // Complementos
    'mosq-corr': MARCO_ANCHO + '<path d="M14 9v30M24 9v30M34 9v30" stroke-width="1.1"/><path d="M5 17h38M5 24h38M5 31h38" stroke-width="1.1"/>' + FLECHA,
    'mosq-fijo': MARCO_ANCHO + '<path d="M14 9v30M24 9v30M34 9v30" stroke-width="1.1"/><path d="M5 17h38M5 24h38M5 31h38" stroke-width="1.1"/>',
    'postigon':  MARCO_ANCHO + '<path d="M9 15h30M9 21h30M9 27h30M9 33h30"/>',
    'reja':      MARCO_ANCHO + '<path d="M13 9v30M19 9v30M25 9v30M31 9v30M37 9v30"/>'
  };

  /* Si una tipología es nueva y no tiene dibujo propio, usa el del grupo */
  var GRUPOS = {
    'Ventanas': ABERTURAS['vent-corr-2'],
    'Puertas': ABERTURAS['puerta-abrir'],
    'Cerramientos': ABERTURAS['cerramiento'],
    'Complementos': ABERTURAS['mosq-fijo']
  };

  function abertura(id, grupo) {
    return svg(ABERTURAS[id] || GRUPOS[grupo] || MARCO_ANCHO);
  }

  /* Íconos de la interfaz (caja 24×24) */
  var UI = {
    nuevo:       '<path d="M12 5v14M5 12h14"/>',
    guardar:     '<path d="M20 6 9 17l-5-5"/>',
    imprimir:    '<path d="M7 9V3h10v6"/><path d="M7 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="7" y="15" width="10" height="6" rx="1"/>',
    whatsapp:    '<path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.6-4.8A8.5 8.5 0 1 1 21 11.5z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5"/>',
    copiar:      '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4V4h11v1"/>',
    presupuesto: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>',
    historial:   '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    precios:     '<path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9z"/><circle cx="8" cy="8" r="1.4" fill="currentColor"/>',
    borrar:      '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>',
    duplicar:    '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 14V4h10"/>',
    cambiar:     '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
    cerrar:      '<path d="M6 6l12 12M18 6 6 18"/>',
    abajo:       '<path d="m6 9 6 6 6-6"/>',
    buscar:      '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
    aviso:       '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/>'
  };

  function ui(nombre) { return svg(UI[nombre] || '', '24 24'); }

  return { abertura: abertura, ui: ui, ABERTURAS: ABERTURAS };
})();
