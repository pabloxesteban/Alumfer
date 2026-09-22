/* ============================================================
   ALUMFER — Presupuestos · Motor de cálculo (funciones puras)

   Un ítem vale:
     aluminio   = precioM2(tipología) × factor(línea) × (1 + recargo color)
     vidrio     = precioM2(vidrio)                       (0 si la tipología no lleva)
     unitario   = (aluminio + vidrio) × m² facturables + adicionales
     total ítem = unitario × cantidad − descuento del ítem

   m² facturables = máx(ancho × alto, mínimo de la tipología)
   ============================================================ */

window.Calculo = (function () {
  'use strict';

  function buscar(lista, id) {
    for (var i = 0; i < (lista || []).length; i++) if (lista[i].id === id) return lista[i];
    return null;
  }

  function num(v) { v = Number(v); return isFinite(v) ? v : 0; }

  function redondear(valor, paso) {
    paso = num(paso);
    if (paso <= 0) return Math.round(valor);
    return Math.round(valor / paso) * paso;
  }

  /** Ítem vacío listo para editar. */
  function itemNuevo(precios) {
    var t = precios.tipologias[0] || {};
    return {
      id: 'it_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      tipologiaId: t.id || '',
      lineaId: (t.lineas && t.lineas[0]) || (precios.lineas[0] && precios.lineas[0].id) || '',
      ancho: 1500,
      alto: 1100,
      cantidad: 1,
      vidrioId: t.sinVidrio ? 'sin' : 'float4',
      colorId: (precios.colores[0] && precios.colores[0].id) || 'natural',
      adicionales: [],
      descuentoPct: 0,
      nota: ''
    };
  }

  /** Detalle completo de un ítem. Nunca lanza: los ids desconocidos valen 0. */
  function calcularItem(item, precios) {
    var g = precios.generales || {};
    var tip    = buscar(precios.tipologias, item.tipologiaId);
    var linea  = buscar(precios.lineas, item.lineaId);
    var vidrio = buscar(precios.vidrios, item.vidrioId);
    var color  = buscar(precios.colores, item.colorId);

    var anchoMm = Math.max(0, num(item.ancho));
    var altoMm  = Math.max(0, num(item.alto));
    var cantidad = Math.max(0, Math.round(num(item.cantidad))) || 0;

    var m2Real    = (anchoMm / 1000) * (altoMm / 1000);
    var minM2     = tip && tip.minM2 != null ? num(tip.minM2) : num(g.minM2Global);
    var m2Fact    = Math.max(m2Real, minM2);
    var perimetro = 2 * (anchoMm + altoMm) / 1000;

    var factorLinea  = linea ? num(linea.factor) : 1;
    var recargoColor = color ? num(color.recargo) : 0;
    var sinVidrio    = !!(tip && tip.sinVidrio);

    var aluminioM2 = (tip ? num(tip.precioM2) : 0) * factorLinea * (1 + recargoColor);
    var vidrioM2   = sinVidrio ? 0 : (vidrio ? num(vidrio.precioM2) : 0);

    var importeAluminio = aluminioM2 * m2Fact;
    var importeVidrio   = vidrioM2 * m2Fact;

    var adicionales = [];
    var importeAdicionales = 0;
    (item.adicionales || []).forEach(function (aid) {
      var ad = buscar(precios.adicionales, aid);
      if (!ad) return;
      var importe = ad.modo === 'ml' ? num(ad.precio) * perimetro
                  : ad.modo === 'unidad' ? num(ad.precio)
                  : num(ad.precio) * m2Fact;
      adicionales.push({ id: ad.id, nombre: ad.nombre, modo: ad.modo, importe: importe });
      importeAdicionales += importe;
    });

    var descuentoPct = Math.min(100, Math.max(0, num(item.descuentoPct)));
    var unitarioBruto = importeAluminio + importeVidrio + importeAdicionales;
    var unitario = redondear(unitarioBruto * (1 - descuentoPct / 100), g.redondeo);
    var total = unitario * cantidad;

    return {
      tipologia: tip, linea: linea, vidrio: vidrio, color: color,
      sinVidrio: sinVidrio,
      anchoMm: anchoMm, altoMm: altoMm, cantidad: cantidad,
      m2Real: m2Real, m2Fact: m2Fact, m2Total: m2Fact * cantidad,
      aplicaMinimo: m2Fact > m2Real + 1e-9,
      perimetro: perimetro,
      importeAluminio: importeAluminio,
      importeVidrio: importeVidrio,
      adicionales: adicionales,
      importeAdicionales: importeAdicionales,
      descuentoPct: descuentoPct,
      descuentoImporte: unitarioBruto * (descuentoPct / 100),
      unitario: unitario,
      total: total,
      descripcion: descripcionItem(item, precios)
    };
  }

  /** Texto de una línea del presupuesto: "Ventana corrediza 2 hojas — Línea Herrero, blanco, DVH 4/9/4". */
  function descripcionItem(item, precios) {
    var tip    = buscar(precios.tipologias, item.tipologiaId);
    var linea  = buscar(precios.lineas, item.lineaId);
    var vidrio = buscar(precios.vidrios, item.vidrioId);
    var color  = buscar(precios.colores, item.colorId);
    var partes = [];
    if (linea) partes.push('Línea ' + linea.nombre);
    if (color) partes.push(color.nombre.toLowerCase());
    if (tip && !tip.sinVidrio && vidrio && vidrio.id !== 'sin') partes.push('vidrio ' + vidrio.nombre);
    (item.adicionales || []).forEach(function (aid) {
      var ad = buscar(precios.adicionales, aid);
      if (ad) partes.push('con ' + ad.nombre.toLowerCase());
    });
    return {
      titulo: tip ? tip.nombre : 'Ítem',
      detalle: partes.join(', ')
    };
  }

  /** Totales del presupuesto. `ajustes` pisa lo que venga de precios.generales. */
  function calcularPresupuesto(presupuesto, precios) {
    var g = precios.generales || {};
    var a = presupuesto.ajustes || {};
    var valor = function (clave) { return a[clave] != null ? a[clave] : g[clave]; };

    var lineas = (presupuesto.items || []).map(function (it) { return calcularItem(it, precios); });

    var subtotal = 0, m2Total = 0, unidades = 0;
    lineas.forEach(function (l) { subtotal += l.total; m2Total += l.m2Total; unidades += l.cantidad; });

    var descuentoPct = Math.min(100, Math.max(0, num(valor('descuentoPct'))));
    var descuento = subtotal * (descuentoPct / 100);
    var neto = subtotal - descuento;

    var colocacionModo = valor('colocacionModo') || 'sin';
    var colocacionValor = num(valor('colocacionValor'));
    var colocacion = colocacionModo === 'porcentaje' ? neto * (colocacionValor / 100)
                   : colocacionModo === 'm2'         ? colocacionValor * m2Total
                   : colocacionModo === 'monto'      ? colocacionValor
                   : 0;

    var flete = num(valor('flete'));
    var baseImponible = neto + colocacion + flete;

    var aplicaIva = !!valor('aplicaIva');
    var ivaPct = num(valor('ivaPct'));
    var iva = aplicaIva ? baseImponible * (ivaPct / 100) : 0;

    var total = baseImponible + iva;
    var anticipoPct = num(valor('anticipoPct'));
    var anticipo = total * (anticipoPct / 100);

    return {
      lineas: lineas,
      unidades: unidades,
      m2Total: m2Total,
      subtotal: subtotal,
      descuentoPct: descuentoPct,
      descuento: descuento,
      colocacionModo: colocacionModo,
      colocacionValor: colocacionValor,
      colocacion: colocacion,
      flete: flete,
      aplicaIva: aplicaIva,
      ivaPct: ivaPct,
      iva: iva,
      total: total,
      anticipoPct: anticipoPct,
      anticipo: anticipo,
      saldo: total - anticipo,
      precioM2Promedio: m2Total > 0 ? total / m2Total : 0
    };
  }

  /** Aplica un porcentaje a toda la tabla de precios (inflación). Devuelve una copia. */
  function ajustarPrecios(precios, porcentaje, ambitos) {
    var p = JSON.parse(JSON.stringify(precios));
    var f = 1 + num(porcentaje) / 100;
    var aplicar = function (lista, campo) {
      (lista || []).forEach(function (x) { x[campo] = Math.round(num(x[campo]) * f); });
    };
    ambitos = ambitos || { tipologias: true, vidrios: true, adicionales: true };
    if (ambitos.tipologias)  aplicar(p.tipologias, 'precioM2');
    if (ambitos.vidrios)     aplicar(p.vidrios, 'precioM2');
    if (ambitos.adicionales) aplicar(p.adicionales, 'precio');
    if (ambitos.colocacion && p.generales && p.generales.colocacionModo === 'm2') {
      p.generales.colocacionValor = Math.round(num(p.generales.colocacionValor) * f);
    }
    p.actualizado = window.Formato.fechaISO();
    return p;
  }

  return {
    buscar: buscar,
    itemNuevo: itemNuevo,
    calcularItem: calcularItem,
    descripcionItem: descripcionItem,
    calcularPresupuesto: calcularPresupuesto,
    ajustarPrecios: ajustarPrecios,
    redondear: redondear
  };
})();
