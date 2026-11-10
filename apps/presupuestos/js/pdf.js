/* ============================================================
   ALUMFER — Presupuestos · PDF del presupuesto

   Arma un PDF de verdad (texto vectorial, A4) con jsPDF, sin pasar
   por el diálogo de impresión. Así se puede descargar o mandar
   como archivo por WhatsApp o email desde el celular.

   - Una fila por abertura, con su dibujo, y salto de página
     automático que repite el encabezado de la tabla.
   - Logo y datos de la empresa: los vigentes (Precios → Tu empresa).
   - Precios y condiciones: los guardados con el presupuesto.

   Las fuentes estándar de PDF solo traen los caracteres de Windows
   occidental (WinAnsi): `limpiar()` cambia los que no entran.
   ============================================================ */

window.PDF = (function () {
  'use strict';

  var F = window.Formato;

  /* Medidas en mm (A4 vertical) */
  var ANCHO = 210, ALTO = 297, MARGEN = 15;
  var UTIL = ANCHO - 2 * MARGEN;
  var PIE = ALTO - 12;            // línea del pie de página
  var LIMITE = PIE - 8;           // de acá para abajo no se escribe contenido

  /* Los mismos colores de la app (estilos.css): tinta, gris y un solo acento, el azul del logo. */
  var AZUL = [23, 74, 140], CARBON = [27, 29, 31], GRIS = [83, 87, 92], LINEA = [213, 210, 203];

  /* Columnas de la tabla: [clave, título, ancho, alineación] */
  var COLS = [
    ['n', 'Ítem', 11, 'left'],
    ['dibujo', '', 14, 'center'],
    ['desc', 'Descripción', 0, 'left'],     // 0 = lo que sobra
    ['medidas', 'Medidas', 27, 'left'],
    ['cant', 'Cant.', 11, 'right'],
    ['unit', 'Unitario', 25, 'right'],
    ['importe', 'Importe', 27, 'right']
  ];
  (function () {
    var fijo = 0;
    COLS.forEach(function (c) { fijo += c[2]; });
    COLS[2][2] = UTIL - fijo;
    var x = MARGEN;
    COLS.forEach(function (c) { c.x = x; x += c[2]; });
  })();

  var EXTRA_WINANSI = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';

  /** Deja solo lo que las fuentes estándar del PDF pueden dibujar. */
  function limpiar(t) {
    return String(t == null ? '' : t)
      .replace(/[−‐‑]/g, '-')
      .replace(/[   ]/g, ' ')
      .replace(/[^\u0000-ÿ]/g, function (c) { return EXTRA_WINANSI.indexOf(c) > -1 ? c : ''; });
  }

  /* ── Imágenes ─────────────────────────────────────────────── */

  function cargarImagen(src) {
    return new Promise(function (resolver, rechazar) {
      var img = new Image();
      img.onload = function () { resolver(img); };
      img.onerror = rechazar;
      img.src = src;
    });
  }

  /** Imagen → JPEG en dataURL, achicada y sobre fondo blanco (el PDF no necesita más). */
  function aJpeg(img, maxPx) {
    var escala = Math.min(1, maxPx / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.round((img.naturalWidth || 1) * escala));
    c.height = Math.max(1, Math.round((img.naturalHeight || 1) * escala));
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return { datos: c.toDataURL('image/jpeg', 0.9), ancho: c.width, alto: c.height };
  }

  function logo(empresa) {
    return cargarImagen(empresa.logo || 'logo-alumfer.jpg')
      .then(function (img) { return aJpeg(img, 400); })
      .catch(function () { return null; });   // sin logo, el PDF sale igual
  }

  /** Dibujo de la abertura (SVG de iconos.js) pasado a PNG. */
  function dibujo(svg) {
    var completo = svg
      .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" ')
      .replace(/currentColor/g, '#2E3338');
    return cargarImagen('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(completo))
      .then(function (img) {
        var c = document.createElement('canvas');
        c.width = 96; c.height = 96;
        c.getContext('2d').drawImage(img, 0, 0, 96, 96);
        return c.toDataURL('image/png');
      })
      .catch(function () { return null; });
  }

  /* ── Armado ───────────────────────────────────────────────── */

  /**
   * @param presupuesto  el presupuesto abierto
   * @param r            resultado de Calculo.calcularPresupuesto
   * @param precios      precios con los que se calculó (empresa = la vigente)
   * @returns Promise<Blob>
   */
  /*
   * jsPDF pesa 420 KB: ya no se carga al abrir la app (la demoraba en
   * celulares lentos). Se pide en segundo plano unos segundos después de
   * abrir (precargar) y, si todavía no llegó, al generar el primer PDF.
   */
  var cargandoJsPDF = null;
  function cargarJsPDF() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve();
    if (!cargandoJsPDF) {
      cargandoJsPDF = new Promise(function (ok, mal) {
        var s = document.createElement('script');
        s.src = 'js/vendor/jspdf.umd.min.js';
        s.onload = function () { ok(); };
        s.onerror = function () { cargandoJsPDF = null; mal(new Error('No se pudo cargar jsPDF')); };
        document.head.appendChild(s);
      });
    }
    return cargandoJsPDF;
  }

  function generar(presupuesto, r, precios) {
    return cargarJsPDF().then(function () { return armar(presupuesto, r, precios); });
  }

  function armar(presupuesto, r, precios) {
    if (!window.jspdf || !window.jspdf.jsPDF) return Promise.reject(new Error('Falta jsPDF'));
    var e = precios.empresa || {};
    var items = presupuesto.items || [];
    var I = window.Iconos;

    // Un dibujo por tipología y forma (no por ítem): se repiten mucho.
    // Las formas especiales muestran la forma, que es lo que más la identifica.
    var tipos = {};
    r.lineas.forEach(function (l, i) {
      var it = items[i] || {};
      var k = claveDibujo(it, l);
      if (!(k in tipos)) tipos[k] = l.libre ? I.ui('lapiz') : l.forma !== 'rect' ? I.forma(l.forma) : I.abertura(it.tipologiaId, l.tipologia && l.tipologia.grupo);
    });
    var ids = Object.keys(tipos);

    return Promise.all([logo(e)].concat(ids.map(function (id) { return dibujo(tipos[id]); })))
      .then(function (res) {
        var dibujos = {};
        ids.forEach(function (id, i) { dibujos[id] = res[i + 1]; });
        return componer(presupuesto, r, precios, res[0], dibujos);
      });
  }

  function claveDibujo(item, l) { return (item.tipologiaId || '') + '|' + (l.forma || 'rect'); }

  /**
   * Orden de las filas: si alguna abertura tiene lugar ("Quincho", "Baño"),
   * se agrupan por lugar en el orden en que aparecen, con su subtotal.
   */
  function gruposPorLugar(r) {
    var hayLugar = r.lineas.some(function (l) { return l.lugar; });
    if (!hayLugar) return [{ lugar: '', filas: r.lineas.map(function (l, i) { return i; }) }];
    var grupos = [], porLugar = {};
    r.lineas.forEach(function (l, i) {
      var k = l.lugar || '';
      if (!porLugar[k]) { porLugar[k] = { lugar: k || 'Otras aberturas', filas: [], subtotal: 0 }; grupos.push(porLugar[k]); }
      porLugar[k].filas.push(i);
      porLugar[k].subtotal += l.total;
    });
    return grupos;
  }

  function componer(presupuesto, r, precios, imgLogo, dibujos) {
    var doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', compress: true });
    var e = precios.empresa || {};
    var g = precios.generales || {};
    var a = presupuesto.ajustes || {};
    var cli = presupuesto.cliente || {};
    var items = presupuesto.items || [];
    var validez = a.validezDias != null ? a.validezDias : g.validezDias;
    var vence = F.sumarDias(presupuesto.fecha || F.fechaISO(), validez);
    var y = MARGEN;

    doc.setProperties({
      title: limpiar('Presupuesto ' + (presupuesto.numero || '') + (cli.nombre ? ' - ' + cli.nombre : '')),
      author: limpiar(e.nombre || ''),
      creator: 'Presupuestos Alumfer'
    });

    function color(rgb) { doc.setTextColor(rgb[0], rgb[1], rgb[2]); }
    function relleno(rgb) { doc.setFillColor(rgb[0], rgb[1], rgb[2]); }
    function trazo(rgb) { doc.setDrawColor(rgb[0], rgb[1], rgb[2]); }
    function letra(tam, estilo) { doc.setFont('helvetica', estilo || 'normal'); doc.setFontSize(tam); }
    function texto(t, x, yy, opts) {
      var limpio = Array.isArray(t) ? t.map(limpiar) : limpiar(t);
      // jsPDF mide mal el espacio duro de "$ 1.000" y lo alineado a la derecha quedaba corrido:
      // ahí va un espacio común (es una sola línea, no se puede partir).
      if (opts && opts.align === 'right' && typeof limpio === 'string') limpio = limpio.replace(/\u00a0/g, ' ');
      doc.text(limpio, x, yy, opts || {});
    }
    function partir(t, ancho) { return doc.splitTextToSize(limpiar(t), ancho); }
    var MM_POR_PT = 0.3528;
    function alturaLinea(tam) { return tam * MM_POR_PT * 1.3; }

    /** Rótulo chico en mayúsculas espaciadas: nombra un dato sin competir con él. */
    function rotulo(t, x, yy, alineado, rgb) {
      color(rgb || GRIS); letra(6.8, 'bold');
      if (!alineado && doc.setCharSpace) doc.setCharSpace(0.25);
      texto(String(t).toUpperCase(), x, yy, alineado ? { align: alineado } : {});
      if (doc.setCharSpace) doc.setCharSpace(0);
    }
    function raya(yy, rgb, grosor, x1, x2) {
      trazo(rgb || LINEA); doc.setLineWidth(grosor || 0.2);
      doc.line(x1 == null ? MARGEN : x1, yy, x2 == null ? MARGEN + UTIL : x2, yy);
    }
    /** x del texto de una columna según su alineación (los números, a la derecha). */
    function xCol(c) { return c[3] === 'right' ? c.x + c[2] : c[3] === 'center' ? c.x + c[2] / 2 : c.x; }

    /* ── Membrete: quién lo manda ── */
    var xTexto = MARGEN;
    if (imgLogo) {
      var lado = 18;
      var prop = imgLogo.ancho / imgLogo.alto;
      var lw = prop >= 1 ? lado : lado * prop, lh = prop >= 1 ? lado / prop : lado;
      doc.addImage(imgLogo.datos, 'JPEG', MARGEN, y, lw, lh);
      xTexto = MARGEN + lw + 5;
    }
    color(CARBON); letra(13, 'bold');
    var nombreLineas = partir(e.nombre || '', 82);
    texto(nombreLineas, xTexto, y + 7);
    var yMarca = y + 7 + alturaLinea(13) * nombreLineas.length;
    if (e.slogan) { color(GRIS); letra(8.5); texto(partir(e.slogan, 82), xTexto, yMarca - 0.5); }

    var contacto = [
      e.direccion,
      e.telefono ? 'Tel. / WhatsApp: ' + e.telefono : '',
      e.email, e.web
    ].filter(Boolean);
    color(GRIS); letra(8.5);
    var yc = y + 3.5;
    contacto.forEach(function (c) {
      partir(c, 72).forEach(function (l) { texto(l, ANCHO - MARGEN, yc, { align: 'right' }); yc += alturaLinea(8.5); });
    });
    y = Math.max(y + 20, yMarca + 4, yc + 1) + 9;

    /* ── Título: qué es, qué número y hasta cuándo vale ── */
    rotulo('Presupuesto', MARGEN, y);
    color(CARBON); letra(22, 'bold');
    texto('N.º ' + (presupuesto.numero || 'sin número'), MARGEN, y + 9.5);
    rotulo('Fecha', ANCHO - MARGEN - 40, y + 2.5, 'right');
    rotulo('Válido hasta', ANCHO - MARGEN, y + 2.5, 'right');
    color(CARBON); letra(10.5, 'bold');
    texto(F.fechaCorta(presupuesto.fecha), ANCHO - MARGEN - 40, y + 8.5, { align: 'right' });
    texto(F.fechaCorta(vence), ANCHO - MARGEN, y + 8.5, { align: 'right' });
    y += 13.5;
    relleno(AZUL); doc.rect(MARGEN, y, UTIL, 0.9, 'F');     // la raya azul: la firma de Alumfer
    y += 8.5;

    /* ── Cliente: solo los datos que existen, sin guiones de relleno ── */
    var obra = [cli.direccion, cli.localidad].filter(Boolean).join(', ');
    var datos = [['Para', cli.nombre], ['Teléfono', cli.telefono], ['Obra', obra], ['Email', cli.email]]
      .filter(function (d) { return d[1]; });
    if (datos.length) {
      var porFila = datos.length === 4 ? 2 : Math.min(3, datos.length);
      var colAncho = UTIL / porFila;
      for (var fi = 0; fi < datos.length; fi += porFila) {
        var fila = datos.slice(fi, fi + porFila);
        letra(10.5, 'bold');
        var renglones = fila.map(function (d) { return partir(d[1], colAncho - 6); });
        fila.forEach(function (d, k) {
          var x = MARGEN + k * colAncho;
          rotulo(d[0], x, y);
          color(CARBON); letra(10.5, 'bold');
          texto(renglones[k], x, y + 5);
        });
        y += 5 + Math.max.apply(null, renglones.map(function (r0) { return r0.length; })) * alturaLinea(10.5) + 3;
      }
      y += 4;
    }

    /* ── Tabla: títulos chicos, renglones separados por una raya fina ── */
    function encabezadoTabla() {
      COLS.forEach(function (c) {
        if (c[1]) rotulo(c[1], xCol(c), y + 3.4, c[3] === 'left' ? null : c[3]);
      });
      y += 5.6;
      raya(y, CARBON, 0.35);
    }

    function nuevaPagina() {
      doc.addPage();
      y = MARGEN;
      color(GRIS); letra(8.5);
      texto('Presupuesto N.º ' + (presupuesto.numero || '') + (cli.nombre ? ' · ' + cli.nombre : '') + ' (continuación)', MARGEN, y + 2);
      y += 8;
    }

    encabezadoTabla();
    var anchoDesc = COLS[2][2] - 4;

    var numero = 0;
    var grupos = gruposPorLugar(r);

    function encabezadoGrupo(g) {
      if (y + 10 + 16 > LIMITE) { nuevaPagina(); encabezadoTabla(); }
      y += 3;
      rotulo(g.lugar, MARGEN, y + 4.2, null, AZUL);
      if (grupos.length > 1) {
        color(GRIS); letra(8.5);
        texto('Subtotal ' + F.moneda(g.subtotal), MARGEN + UTIL, y + 4.2, { align: 'right' });
      }
      y += 6.4;
      raya(y);
    }

    grupos.forEach(function (g) {
      if (g.lugar) encabezadoGrupo(g);
      g.filas.forEach(function (i) { filaItem(r.lineas[i], i); });
    });

    function filaItem(l, i) {
      var item = items[i] || {};
      var d = l.descripcion;
      numero++;
      letra(9.5, 'bold'); var tit = partir(d.titulo, anchoDesc);
      letra(8.5);         var det = d.detalle ? partir(d.detalle, anchoDesc) : [];
      letra(8.5, 'italic'); var nota = item.nota ? partir(item.nota, anchoDesc) : [];
      letra(9);           var med = partir(F.medidasItem(l), COLS[3][2] - 2);
      var altoTexto = tit.length * alturaLinea(9.5) + (det.length + nota.length) * alturaLinea(8.5);
      var alto = Math.max(16, altoTexto + 7, med.length * alturaLinea(9) + 7);

      if (y + alto > LIMITE) { nuevaPagina(); encabezadoTabla(); }

      var base = y + 6;
      color(AZUL); letra(9, 'bold');
      texto((r.codigos && r.codigos[i]) || String(numero), xCol(COLS[0]), base);

      var png = dibujos[claveDibujo(item, l)];
      if (png) doc.addImage(png, 'PNG', COLS[1].x + 0.5, y + 2.5, 11, 11);

      var yy = base;
      color(CARBON); letra(9.5, 'bold');
      tit.forEach(function (t) { texto(t, COLS[2].x, yy); yy += alturaLinea(9.5); });
      color(GRIS); letra(8.5);
      det.forEach(function (t) { texto(t, COLS[2].x, yy); yy += alturaLinea(8.5); });
      letra(8.5, 'italic');
      nota.forEach(function (t) { texto(t, COLS[2].x, yy); yy += alturaLinea(8.5); });

      color(CARBON); letra(9);
      med.forEach(function (m, j) { texto(m, xCol(COLS[3]), base + j * alturaLinea(9)); });
      texto(String(l.cantidad), xCol(COLS[4]), base, { align: 'right' });
      texto(F.moneda(l.unitario), xCol(COLS[5]), base, { align: 'right' });
      letra(9.5, 'bold');
      texto(F.moneda(l.total), xCol(COLS[6]), base, { align: 'right' });

      y += alto;
      raya(y);
    }

    /* ── Totales: a la derecha, el total es la cifra más grande de la hoja ── */
    var filas = [['Subtotal', r.subtotal]];
    if (r.descuento > 0) filas.push(['Descuento ' + F.numero(r.descuentoPct, 0) + ' %', -r.descuento]);
    if (r.colocacion > 0) filas.push(['Colocación', r.colocacion]);
    if (r.flete > 0) filas.push(['Flete', r.flete]);
    if (r.aplicaIva) {
      filas.push(['Neto gravado', r.subtotal - r.descuento + r.colocacion + r.flete]);
      filas.push(['IVA ' + F.numero(r.ivaPct, 0) + ' %', r.iva]);
    }
    var altoTotales = filas.length * 6.2 + 16 + (r.anticipoPct > 0 ? 12 : 0);
    y += 7;
    if (y + altoTotales > LIMITE) nuevaPagina();

    var xT = ANCHO - MARGEN - 86, xD = ANCHO - MARGEN;
    filas.forEach(function (f) {
      color(GRIS); letra(9.5);
      texto(f[0], xT, y + 4);
      color(CARBON);
      texto((f[1] < 0 ? '- ' : '') + F.moneda(Math.abs(f[1])), xD, y + 4, { align: 'right' });
      y += 6.2;
    });
    y += 1.5;
    raya(y, CARBON, 0.35, xT, xD);
    y += 9;
    color(CARBON); letra(11, 'bold');
    texto('TOTAL', xT, y);
    letra(18, 'bold');
    texto(F.moneda(r.total), xD, y + 0.4, { align: 'right' });
    y += 2;
    if (r.anticipoPct > 0) {
      color(GRIS); letra(8.5);
      y += 5.5;
      texto('Anticipo ' + F.numero(r.anticipoPct, 0) + ' %', xT, y);
      texto(F.moneda(r.anticipo), xD, y, { align: 'right' });
      y += alturaLinea(8.5) + 0.6;
      texto('Saldo contra entrega', xT, y);
      texto(F.moneda(r.saldo), xD, y, { align: 'right' });
    }
    y += 12;

    /* ── Condiciones y observaciones ── */
    function seccion(titulo, renglones, vinieta) {
      if (!renglones.length) return;
      if (y + 16 > LIMITE) nuevaPagina();
      raya(y - 4);
      rotulo(titulo, MARGEN, y + 1, null, AZUL);
      y += 6.5;
      color(CARBON); letra(9);
      renglones.forEach(function (r0) {
        partir(r0, UTIL - 6).forEach(function (l, j) {
          if (y > LIMITE) { nuevaPagina(); color(CARBON); letra(9); }
          if (vinieta && j === 0) { color(GRIS); texto('•', MARGEN + 0.5, y); color(CARBON); }
          texto(l, MARGEN + (vinieta ? 4.5 : 0), y);
          y += alturaLinea(9);
        });
        y += 1;
      });
      y += 8;
    }

    seccion('Condiciones', window.Documento.condiciones(presupuesto, r, precios), true);
    if (presupuesto.notas) seccion('Observaciones', String(presupuesto.notas).split(/\n+/).filter(Boolean), false);

    /* ── Pie en todas las páginas ── */
    var total = doc.getNumberOfPages();
    var pie = [e.nombre, e.telefono, e.web].filter(Boolean).join('  ·  ');
    for (var p = 1; p <= total; p++) {
      doc.setPage(p);
      trazo(LINEA); doc.setLineWidth(0.2); doc.line(MARGEN, PIE - 4, ANCHO - MARGEN, PIE - 4);
      color(GRIS); letra(7.5);
      texto(pie, MARGEN, PIE);
      texto('Página ' + p + ' de ' + total, ANCHO - MARGEN, PIE, { align: 'right' });
    }

    return doc.output('blob');
  }

  /** "Presupuesto P-2026-0007 Maria Gomez.pdf" — sin caracteres raros. */
  function nombreArchivo(presupuesto) {
    var cli = (presupuesto.cliente && presupuesto.cliente.nombre) || '';
    var base = 'Presupuesto ' + (presupuesto.numero || '') + (cli ? ' ' + cli : '');
    base = base.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w .-]/g, '').replace(/\s+/g, ' ').trim();
    return base + '.pdf';
  }

  return { generar: generar, nombreArchivo: nombreArchivo, limpiar: limpiar, precargar: cargarJsPDF };
})();
