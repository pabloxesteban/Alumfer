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

  /* Colores de la marca (tokens.css) */
  var AZUL = [27, 108, 200], CARBON = [26, 28, 30], GRIS = [90, 90, 85],
      LINEA = [232, 228, 220], FONDO = [245, 244, 241], BLANCO = [255, 255, 255];

  /* Columnas de la tabla: [clave, título, ancho, alineación] */
  var COLS = [
    ['n', '#', 7, 'center'],
    ['dibujo', '', 14, 'center'],
    ['desc', 'Descripción', 0, 'left'],     // 0 = lo que sobra
    ['medidas', 'Medidas', 25, 'center'],
    ['cant', 'Cant.', 12, 'center'],
    ['unit', 'Unitario', 24, 'right'],
    ['importe', 'Importe', 28, 'right']
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
  function generar(presupuesto, r, precios) {
    if (!window.jspdf || !window.jspdf.jsPDF) return Promise.reject(new Error('Falta jsPDF'));
    var e = precios.empresa || {};
    var items = presupuesto.items || [];
    var I = window.Iconos;

    // Un dibujo por tipología (no por ítem): se repiten mucho.
    var tipos = {};
    r.lineas.forEach(function (l, i) {
      var it = items[i] || {};
      if (!(it.tipologiaId in tipos)) tipos[it.tipologiaId] = I.abertura(it.tipologiaId, l.tipologia && l.tipologia.grupo);
    });
    var ids = Object.keys(tipos);

    return Promise.all([logo(e)].concat(ids.map(function (id) { return dibujo(tipos[id]); })))
      .then(function (res) {
        var dibujos = {};
        ids.forEach(function (id, i) { dibujos[id] = res[i + 1]; });
        return componer(presupuesto, r, precios, res[0], dibujos);
      });
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
    function texto(t, x, yy, opts) { doc.text(limpiar(t), x, yy, opts || {}); }
    function partir(t, ancho) { return doc.splitTextToSize(limpiar(t), ancho); }
    var MM_POR_PT = 0.3528;
    function alturaLinea(tam) { return tam * MM_POR_PT * 1.3; }

    /* ── Membrete ── */
    var xTexto = MARGEN;
    if (imgLogo) {
      var lado = 22;
      var prop = imgLogo.ancho / imgLogo.alto;
      var lw = prop >= 1 ? lado : lado * prop, lh = prop >= 1 ? lado / prop : lado;
      doc.addImage(imgLogo.datos, 'JPEG', MARGEN, y, lw, lh);
      xTexto = MARGEN + lw + 5;
    }
    color(CARBON); letra(14, 'bold');
    var nombreLineas = partir(e.nombre || '', 78);
    texto(nombreLineas, xTexto, y + 6);
    var yMarca = y + 6 + alturaLinea(14) * nombreLineas.length;
    if (e.slogan) { color(GRIS); letra(8.5); texto(partir(e.slogan, 78), xTexto, yMarca); }

    var contacto = [
      e.direccion,
      e.telefono ? 'Tel. / WhatsApp: ' + e.telefono : '',
      e.email, e.web
    ].filter(Boolean);
    color(GRIS); letra(8.5);
    var yc = y + 3;
    contacto.forEach(function (c) {
      partir(c, 72).forEach(function (l) { texto(l, ANCHO - MARGEN, yc, { align: 'right' }); yc += alturaLinea(8.5); });
    });

    y = Math.max(y + 24, yMarca + 6, yc + 1);
    relleno(AZUL); doc.rect(MARGEN, y, UTIL, 0.9, 'F');
    y += 9;

    /* ── Título ── */
    color(AZUL); letra(9, 'bold');
    texto('PRESUPUESTO', MARGEN, y);
    color(CARBON); letra(18, 'bold');
    texto('N.º ' + (presupuesto.numero || 'sin número'), MARGEN, y + 8);

    letra(9); color(GRIS);
    texto('Fecha', ANCHO - MARGEN - 46, y, { align: 'right' });
    texto('Válido hasta', ANCHO - MARGEN, y, { align: 'right' });
    color(CARBON); letra(10.5, 'bold');
    texto(F.fechaCorta(presupuesto.fecha), ANCHO - MARGEN - 46, y + 6, { align: 'right' });
    texto(F.fechaCorta(vence), ANCHO - MARGEN, y + 6, { align: 'right' });
    y += 15;

    /* ── Cliente ── */
    var obra = [cli.direccion, cli.localidad].filter(Boolean).join(', ');
    var datos = [
      ['Cliente', cli.nombre || '-'],
      ['Teléfono', cli.telefono || '-'],
      ['Obra', obra || '-'],
      ['Email', cli.email || '-']
    ];
    var colAncho = (UTIL - 12) / 2;
    letra(10, 'bold');
    var filasCli = [
      Math.max(partir(datos[0][1], colAncho).length, partir(datos[1][1], colAncho).length),
      Math.max(partir(datos[2][1], colAncho).length, partir(datos[3][1], colAncho).length)
    ];
    var altoCli = 8 + filasCli.reduce(function (s, n) { return s + 5 + n * alturaLinea(10) + 2; }, 0);
    relleno(FONDO); doc.roundedRect(MARGEN, y, UTIL, altoCli, 2, 2, 'F');
    var ycli = y + 6;
    [[0, 1], [2, 3]].forEach(function (par, fila) {
      par.forEach(function (k, col) {
        var x = MARGEN + 6 + col * (colAncho + 0);
        color(GRIS); letra(7.5, 'bold');
        texto(datos[k][0].toUpperCase(), x, ycli);
        color(CARBON); letra(10, 'bold');
        texto(partir(datos[k][1], colAncho - 4), x, ycli + 4.6);
      });
      ycli += 5 + filasCli[fila] * alturaLinea(10) + 2;
    });
    y += altoCli + 7;

    /* ── Tabla ── */
    function encabezadoTabla() {
      relleno(CARBON); doc.rect(MARGEN, y, UTIL, 8, 'F');
      color(BLANCO); letra(8.5, 'bold');
      COLS.forEach(function (c) {
        if (!c[1]) return;
        var x = c[3] === 'right' ? c.x + c[2] - 2 : c[3] === 'center' ? c.x + c[2] / 2 : c.x + 2;
        texto(c[1], x, y + 5.3, { align: c[3] });
      });
      y += 8;
    }

    function nuevaPagina() {
      doc.addPage();
      y = MARGEN;
      color(GRIS); letra(8.5);
      texto('Presupuesto N.º ' + (presupuesto.numero || '') + (cli.nombre ? ' · ' + cli.nombre : '') + ' (continuación)', MARGEN, y + 2);
      y += 7;
    }

    encabezadoTabla();
    var anchoDesc = COLS[2][2] - 4;

    r.lineas.forEach(function (l, i) {
      var item = items[i] || {};
      var d = l.descripcion;
      letra(9.5, 'bold'); var tit = partir(d.titulo, anchoDesc);
      letra(8.5);         var det = d.detalle ? partir(d.detalle, anchoDesc) : [];
      letra(8.5, 'italic'); var nota = item.nota ? partir(item.nota, anchoDesc) : [];
      var altoTexto = tit.length * alturaLinea(9.5) + (det.length + nota.length) * alturaLinea(8.5);
      var alto = Math.max(16, altoTexto + 6);

      if (y + alto > LIMITE) { nuevaPagina(); encabezadoTabla(); }

      var base = y + 5.5;
      color(GRIS); letra(9);
      texto(String(i + 1), COLS[0].x + COLS[0][2] / 2, base, { align: 'center' });

      var png = dibujos[item.tipologiaId];
      if (png) doc.addImage(png, 'PNG', COLS[1].x + 1.5, y + 2, 11, 11);

      var yy = base;
      color(CARBON); letra(9.5, 'bold');
      tit.forEach(function (t) { texto(t, COLS[2].x + 2, yy); yy += alturaLinea(9.5); });
      color(GRIS); letra(8.5);
      det.forEach(function (t) { texto(t, COLS[2].x + 2, yy); yy += alturaLinea(8.5); });
      letra(8.5, 'italic');
      nota.forEach(function (t) { texto(t, COLS[2].x + 2, yy); yy += alturaLinea(8.5); });

      color(CARBON); letra(9);
      texto(F.medidasMetros(l.anchoMm, l.altoMm), COLS[3].x + COLS[3][2] / 2, base, { align: 'center' });
      texto(String(l.cantidad), COLS[4].x + COLS[4][2] / 2, base, { align: 'center' });
      texto(F.moneda(l.unitario), COLS[5].x + COLS[5][2] - 2, base, { align: 'right' });
      letra(9, 'bold');
      texto(F.moneda(l.total), COLS[6].x + COLS[6][2] - 2, base, { align: 'right' });

      y += alto;
      trazo(LINEA); doc.setLineWidth(0.3); doc.line(MARGEN, y, MARGEN + UTIL, y);
    });

    /* ── Totales ── */
    var filas = [['Subtotal', r.subtotal]];
    if (r.descuento > 0) filas.push(['Descuento ' + F.numero(r.descuentoPct, 0) + ' %', -r.descuento]);
    if (r.colocacion > 0) filas.push(['Colocación', r.colocacion]);
    if (r.flete > 0) filas.push(['Flete', r.flete]);
    if (r.aplicaIva) {
      filas.push(['Neto gravado', r.subtotal - r.descuento + r.colocacion + r.flete]);
      filas.push(['IVA ' + F.numero(r.ivaPct, 0) + ' %', r.iva]);
    }
    var altoTotales = filas.length * 6.5 + 14 + (r.anticipoPct > 0 ? 12 : 0);
    y += 6;
    if (y + altoTotales > LIMITE) nuevaPagina();

    var xT = ANCHO - MARGEN - 84;
    filas.forEach(function (f) {
      color(GRIS); letra(9.5);
      texto(f[0], xT + 3, y + 4);
      color(CARBON);
      texto((f[1] < 0 ? '- ' : '') + F.moneda(Math.abs(f[1])), ANCHO - MARGEN - 3, y + 4, { align: 'right' });
      y += 6.5;
    });
    y += 1;
    relleno(AZUL); doc.roundedRect(xT, y, 84, 11, 1.5, 1.5, 'F');
    color(BLANCO); letra(10, 'bold');
    texto('TOTAL', xT + 4, y + 7.2);
    letra(13, 'bold');
    texto(F.moneda(r.total), ANCHO - MARGEN - 4, y + 7.6, { align: 'right' });
    y += 11;
    if (r.anticipoPct > 0) {
      color(GRIS); letra(8.5);
      y += 5;
      texto('Anticipo ' + F.numero(r.anticipoPct, 0) + ' %: ' + F.moneda(r.anticipo), ANCHO - MARGEN - 3, y, { align: 'right' });
      y += alturaLinea(8.5);
      texto('Saldo contra entrega: ' + F.moneda(r.saldo), ANCHO - MARGEN - 3, y, { align: 'right' });
    }
    y += 10;

    /* ── Condiciones y observaciones ── */
    function seccion(titulo, renglones, vinieta) {
      if (!renglones.length) return;
      if (y + 14 > LIMITE) nuevaPagina();
      color(AZUL); letra(9, 'bold');
      texto(titulo.toUpperCase(), MARGEN, y);
      y += 5.5;
      color(CARBON); letra(9);
      renglones.forEach(function (r0) {
        partir(r0, UTIL - 6).forEach(function (l, j) {
          if (y > LIMITE) { nuevaPagina(); color(CARBON); letra(9); }
          if (vinieta && j === 0) texto('•', MARGEN + 1, y);
          texto(l, MARGEN + (vinieta ? 5 : 0), y);
          y += alturaLinea(9);
        });
        y += 0.8;
      });
      y += 5;
    }

    seccion('Condiciones', window.Documento.condiciones(presupuesto, r, precios), true);
    if (presupuesto.notas) seccion('Observaciones', String(presupuesto.notas).split(/\n+/).filter(Boolean), false);

    /* ── Pie en todas las páginas ── */
    var total = doc.getNumberOfPages();
    var pie = [e.nombre, e.telefono, e.web].filter(Boolean).join('  ·  ');
    for (var p = 1; p <= total; p++) {
      doc.setPage(p);
      trazo(LINEA); doc.setLineWidth(0.3); doc.line(MARGEN, PIE - 4, ANCHO - MARGEN, PIE - 4);
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

  return { generar: generar, nombreArchivo: nombreArchivo, limpiar: limpiar };
})();
