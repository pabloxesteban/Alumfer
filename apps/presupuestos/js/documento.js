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
          '<img src="logo-alumfer.jpg" alt="Alumfer" class="hoja-logo">' +
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
          '<ul>' +
            '<li>Precios en pesos, válidos por ' + esc(validez) + ' días a partir de la fecha.</li>' +
            (r.anticipoPct > 0
              ? '<li>Anticipo del ' + F.numero(r.anticipoPct, 0) + ' % (' + esc(F.moneda(r.anticipo)) + ') para iniciar la fabricación; saldo de ' + esc(F.moneda(r.saldo)) + ' contra entrega.</li>'
              : '') +
            '<li>Plazo de entrega: ' + esc(g.plazoEntrega || '') + '</li>' +
            '<li>Las medidas definitivas se toman en obra antes de fabricar.</li>' +
            (r.colocacion > 0 ? '<li>Incluye colocación.</li>' : '<li>No incluye colocación ni trabajos de albañilería.</li>') +
            (r.aplicaIva ? '' : '<li>Precio final, IVA incluido.</li>') +
          '</ul>' +
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

  return { hoja: hoja, imprimir: imprimir, texto: texto, urlWhatsapp: urlWhatsapp };
})();
