/* ============================================================
   ALUMFER — Presupuestos · Documento imprimible y mensaje de WhatsApp
   ============================================================ */

window.Documento = (function () {
  'use strict';

  var F = window.Formato;

  function esc(t) { return F.escapar(t); }

  function lineaDescripcion(l) {
    var d = l.descripcion;
    var partes = [esc(d.titulo)];
    if (d.detalle) partes.push('<span class="hoja-detalle">' + esc(d.detalle) + '</span>');
    return partes.join('<br>');
  }

  /**
   * Condiciones comerciales en texto, una por renglón. Las usan la hoja
   * impresa y el PDF, así las dos dicen siempre lo mismo.
   */
  function condiciones(presupuesto, r, precios) {
    var g = precios.generales || {};
    var a = presupuesto.ajustes || {};
    var validez = a.validezDias != null ? a.validezDias : g.validezDias;
    var L = [];
    L.push('Precios en pesos, válidos por ' + validez + ' días a partir de la fecha.');
    if (r.anticipoPct > 0) {
      L.push('Anticipo del ' + F.numero(r.anticipoPct, 0) + ' % (' + F.moneda(r.anticipo) +
             ') para iniciar la fabricación; saldo de ' + F.moneda(r.saldo) + ' contra entrega.');
    }
    if (g.formaPago) L.push('Forma de pago: ' + g.formaPago);
    if (g.plazoEntrega) L.push('Plazo de entrega: ' + g.plazoEntrega);
    L.push('Las medidas definitivas se toman en obra antes de fabricar.');
    L.push(r.colocacion > 0 ? 'Incluye colocación.' : 'No incluye colocación ni trabajos de albañilería.');
    if (!r.aplicaIva) L.push('Precio final, IVA incluido.');
    return L;
  }

  /** HTML del presupuesto listo para imprimir. */
  function hoja(presupuesto, r, precios) {
    var e = precios.empresa || {};
    var g = precios.generales || {};
    var a = presupuesto.ajustes || {};
    var cli = presupuesto.cliente || {};
    var validez = a.validezDias != null ? a.validezDias : g.validezDias;
    var vence = F.sumarDias(presupuesto.fecha || F.fechaISO(), validez);

    var filas = r.lineas.map(function (l, i) {
      var item = (presupuesto.items || [])[i] || {};
      return '' +
        '<tr>' +
          '<td class="c">' + (i + 1) + '</td>' +
          '<td>' + lineaDescripcion(l) +
            (item.nota ? '<br><span class="hoja-nota">' + esc(item.nota) + '</span>' : '') +
          '</td>' +
          '<td class="c">' + esc(F.medidasMetros(l.anchoMm, l.altoMm)) + '</td>' +
          '<td class="c">' + l.cantidad + '</td>' +
          '<td class="d">' + esc(F.moneda(l.unitario)) + '</td>' +
          '<td class="d">' + esc(F.moneda(l.total)) + '</td>' +
        '</tr>';
    }).join('');

    var filasTotales = [];
    var agregar = function (rotulo, valor, clase) {
      filasTotales.push('<tr class="' + (clase || '') + '"><td>' + esc(rotulo) + '</td><td class="d">' + esc(F.moneda(valor)) + '</td></tr>');
    };
    agregar('Subtotal', r.subtotal);
    if (r.descuento > 0) agregar('Descuento ' + F.numero(r.descuentoPct, 0) + ' %', -r.descuento);
    if (r.colocacion > 0) agregar('Colocación', r.colocacion);
    if (r.flete > 0) agregar('Flete', r.flete);
    if (r.aplicaIva) {
      agregar('Neto gravado', r.subtotal - r.descuento + r.colocacion + r.flete);
      agregar('IVA ' + F.numero(r.ivaPct, 0) + ' %', r.iva);
    }
    agregar('TOTAL', r.total, 'hoja-total');

    return '' +
    '<article class="hoja-doc">' +
      '<header class="hoja-membrete">' +
        '<div class="hoja-marca">' +
          '<img src="' + esc(e.logo || 'logo-alumfer.jpg') + '" alt="' + esc(e.nombre || 'Logo') + '" class="hoja-logo">' +
          '<div>' +
            '<strong>' + esc(e.nombre) + '</strong>' +
            '<span>' + esc(e.slogan) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="hoja-contacto">' +
          '<div>' + esc(e.direccion) + '</div>' +
          '<div>Tel / WhatsApp: ' + esc(e.telefono) + '</div>' +
          '<div>' + esc(e.email) + '</div>' +
          '<div>' + esc(e.web) + '</div>' +
        '</div>' +
      '</header>' +

      '<div class="hoja-titulo">' +
        '<h1>Presupuesto ' + esc(presupuesto.numero || '') + '</h1>' +
        '<div>' +
          '<div>Fecha: <strong>' + esc(F.fechaLarga(presupuesto.fecha)) + '</strong></div>' +
          '<div>Válido hasta: <strong>' + esc(F.fechaLarga(vence)) + '</strong></div>' +
        '</div>' +
      '</div>' +

      '<section class="hoja-cliente">' +
        '<div><span>Cliente</span><strong>' + esc(cli.nombre || '—') + '</strong></div>' +
        '<div><span>Teléfono</span><strong>' + esc(cli.telefono || '—') + '</strong></div>' +
        '<div><span>Obra</span><strong>' + esc([cli.direccion, cli.localidad].filter(Boolean).join(', ') || '—') + '</strong></div>' +
      '</section>' +

      '<table class="hoja-tabla">' +
        '<thead><tr>' +
          '<th class="c">#</th><th>Descripción</th><th class="c">Medidas</th>' +
          '<th class="c">Cant.</th><th class="d">Unitario</th><th class="d">Importe</th>' +
        '</tr></thead>' +
        '<tbody>' + filas + '</tbody>' +
      '</table>' +

      '<div class="hoja-cierre">' +
        '<section class="hoja-condiciones">' +
          '<h2>Condiciones</h2>' +
          '<ul>' + condiciones(presupuesto, r, precios).map(function (c) {
            return '<li>' + esc(c) + '</li>';
          }).join('') + '</ul>' +
          (presupuesto.notas ? '<h2>Observaciones</h2><p>' + esc(presupuesto.notas).replace(/\n/g, '<br>') + '</p>' : '') +
        '</section>' +
        '<section class="hoja-totales">' +
          '<table>' + filasTotales.join('') + '</table>' +
        '</section>' +
      '</div>' +

      '<footer class="hoja-pie">' +
        esc(e.nombre) + ' · ' + esc(e.direccion) + ' · ' + esc(e.telefono) + ' · ' + esc(e.web) +
      '</footer>' +
    '</article>';
  }

  function imprimir(presupuesto, r, precios) {
    var contenedor = document.getElementById('hoja');
    contenedor.innerHTML = hoja(presupuesto, r, precios);
    var titulo = document.title;
    document.title = 'Presupuesto ' + (presupuesto.numero || '') +
      (presupuesto.cliente && presupuesto.cliente.nombre ? ' - ' + presupuesto.cliente.nombre : '');
    window.print();
    setTimeout(function () { document.title = titulo; }, 500);
  }

  /** Resumen en texto plano para WhatsApp o para copiar. */
  function texto(presupuesto, r, precios) {
    var e = precios.empresa || {};
    var g = precios.generales || {};
    var a = presupuesto.ajustes || {};
    var cli = presupuesto.cliente || {};
    var validez = a.validezDias != null ? a.validezDias : g.validezDias;
    var L = [];

    L.push('*ALUMFER — Presupuesto ' + (presupuesto.numero || '') + '*');
    if (cli.nombre) L.push('Para: ' + cli.nombre);
    L.push('Fecha: ' + F.fechaCorta(presupuesto.fecha));
    L.push('');

    r.lineas.forEach(function (l, i) {
      var d = l.descripcion;
      L.push((i + 1) + '. *' + d.titulo + '* — ' + F.medidasMetros(l.anchoMm, l.altoMm) +
             (l.cantidad > 1 ? ' (x' + l.cantidad + ')' : ''));
      if (d.detalle) L.push('   ' + d.detalle);
      L.push('   ' + F.moneda(l.total));
    });

    L.push('');
    if (r.descuento > 0) L.push('Subtotal: ' + F.moneda(r.subtotal) + ' — Descuento ' + F.numero(r.descuentoPct, 0) + '%: -' + F.moneda(r.descuento));
    if (r.colocacion > 0) L.push('Colocación: ' + F.moneda(r.colocacion));
    if (r.flete > 0) L.push('Flete: ' + F.moneda(r.flete));
    if (r.aplicaIva) L.push('IVA ' + F.numero(r.ivaPct, 0) + '%: ' + F.moneda(r.iva));
    L.push('*TOTAL: ' + F.moneda(r.total) + '*');
    if (r.anticipoPct > 0) L.push('Anticipo ' + F.numero(r.anticipoPct, 0) + '%: ' + F.moneda(r.anticipo) + ' · Saldo: ' + F.moneda(r.saldo));
    L.push('');
    L.push('Válido por ' + validez + ' días. ' + (g.plazoEntrega ? 'Entrega: ' + g.plazoEntrega + '.' : ''));
    if (presupuesto.notas) L.push(presupuesto.notas);
    L.push('');
    L.push(e.nombre + ' · ' + e.telefono + ' · ' + e.web);

    return L.join('\n');
  }

  function urlWhatsapp(presupuesto, r, precios) {
    var tel = F.telefonoWhatsapp(presupuesto.cliente && presupuesto.cliente.telefono);
    return 'https://wa.me/' + tel + '?text=' + encodeURIComponent(texto(presupuesto, r, precios));
  }

    /** Mensaje corto que acompaña al PDF: el detalle ya va en el archivo. */
  function mensajeCorto(presupuesto, r, precios) {
    var e = precios.empresa || {};
    var cli = presupuesto.cliente || {};
    var nombre = String(cli.nombre || '').trim().split(/\s+/)[0];
    return 'Hola' + (nombre ? ' ' + nombre : '') + ', te paso el presupuesto ' + (presupuesto.numero || '') +
      (e.nombre ? ' de ' + e.nombre : '') + '. Total: ' + F.moneda(r.total) + '.\n' +
      'Cualquier consulta, quedo a disposición.';
  }

  function asuntoEmail(presupuesto, precios) {
    var e = precios.empresa || {};
    return 'Presupuesto ' + (presupuesto.numero || '') + (e.nombre ? ' — ' + e.nombre : '');
  }

  /** Asunto y cuerpo para el email (el PDF va aparte: mailto no puede adjuntar). */
  function urlEmail(presupuesto, r, precios) {
    var cli = presupuesto.cliente || {};
    var asunto = asuntoEmail(presupuesto, precios);
    var cuerpo = texto(presupuesto, r, precios).replace(/\*/g, '');
    return 'mailto:' + encodeURIComponent(cli.email || '') +
      '?subject=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(cuerpo);
  }

  return {
    hoja: hoja, imprimir: imprimir, texto: texto, condiciones: condiciones,
    urlWhatsapp: urlWhatsapp, urlEmail: urlEmail, mensajeCorto: mensajeCorto, asuntoEmail: asuntoEmail
  };
})();
