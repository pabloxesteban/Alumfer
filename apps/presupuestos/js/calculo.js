/* ============================================================
   ALUMFER — Presupuestos · Motor de cálculo (funciones puras)

   Un ítem vale:
     aluminio   = precioM2(tipología) × factor(línea) × (1 + recargo color)
     vidrio     = precioM2(vidrio)                       (0 si la tipología no lleva)
     unitario   = (aluminio + vidrio) × m² facturables + adicionales
     total ítem = unitario × cantidad − descuento del ítem

   m² facturables = máx(ancho × alto, mínimo de la tipología)

   Formas especiales (inclinada, triangular, con arco, redonda): se
   cobra el rectángulo que las contiene —el vidrio sale de una plancha
   rectangular— más un recargo configurable por forma (precios.formas)
   sobre aluminio y vidrio. El recargo arranca en 0: la regla comercial
   la define Alumfer.
   ============================================================ */

window.Calculo = (function () {
  'use strict';

  function buscar(lista, id) {
    for (var i = 0; i < (lista || []).length; i++) if (lista[i].id === id) return lista[i];
    return null;
  }

  function num(v) { v = Number(v); return isFinite(v) ? v : 0; }

  var FORMAS = ['rect', 'inclinada', 'triangulo', 'arco', 'redonda'];
  var NOMBRE_FORMA = {
    inclinada: 'con un lado inclinado', triangulo: 'triangular',
    arco: 'con arco arriba', redonda: 'redonda'
  };
  function formaDe(item) { return FORMAS.indexOf(item && item.forma) > -1 ? item.forma : 'rect'; }

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
    // Mosquiteros, rejas, postigones y cortinas no llevan línea de perfil; las
    // cortinas de PVC tampoco color de aluminio: no multiplican ni recargan.
    var linea  = tip && tip.sinLinea ? null : buscar(precios.lineas, item.lineaId);
    var vidrio = buscar(precios.vidrios, item.vidrioId);
    var color  = tip && tip.sinColor ? null : buscar(precios.colores, item.colorId);

    var forma   = formaDe(item);
    var anchoMm = Math.max(0, num(item.ancho));
    var altoMm  = forma === 'redonda' ? anchoMm : Math.max(0, num(item.alto));   // redonda: alto = diámetro
    var alto2Mm = forma === 'inclinada' ? Math.max(0, num(item.alto2)) : 0;      // lado bajo
    var altoCaja = Math.max(altoMm, alto2Mm);                                     // rectángulo que la contiene
    var cantidad = Math.max(0, Math.round(num(item.cantidad))) || 0;

    var m2Real    = (anchoMm / 1000) * (altoCaja / 1000);
    var minM2     = tip && tip.minM2 != null ? num(tip.minM2) : num(g.minM2Global);
    var m2Fact    = Math.max(m2Real, minM2);
    var perimetro = 2 * (anchoMm + altoCaja) / 1000;

    var datoForma = forma !== 'rect' ? buscar(precios.formas, forma) : null;
    var recargoForma = datoForma ? num(datoForma.recargo) : 0;

    var factorLinea  = linea ? num(linea.factor) : 1;
    var recargoColor = color ? num(color.recargo) : 0;
    var sinVidrio    = !!(tip && tip.sinVidrio);

    var aluminioM2 = (tip ? num(tip.precioM2) : 0) * factorLinea * (1 + recargoColor);
    var vidrioM2   = sinVidrio ? 0 : (vidrio ? num(vidrio.precioM2) : 0);

    var importeAluminio = aluminioM2 * m2Fact * (1 + recargoForma);
    var importeVidrio   = vidrioM2 * m2Fact * (1 + recargoForma);

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
      anchoMm: anchoMm, altoMm: altoMm, alto2Mm: alto2Mm, cantidad: cantidad,
      forma: forma, recargoForma: recargoForma, lugar: String(item.lugar || '').trim(),
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

  /** Texto de una línea del presupuesto: "Ventana corrediza 2 hojas — Línea Herrero, blanco, doble vidrio". */
  function descripcionItem(item, precios) {
    var tip    = buscar(precios.tipologias, item.tipologiaId);
    var linea  = tip && tip.sinLinea ? null : buscar(precios.lineas, item.lineaId);
    var vidrio = buscar(precios.vidrios, item.vidrioId);
    var color  = tip && tip.sinColor ? null : buscar(precios.colores, item.colorId);
    var partes = [];
    var forma = formaDe(item);
    if (forma !== 'rect') partes.push('forma ' + NOMBRE_FORMA[forma]);
    if (linea) partes.push('Línea ' + linea.nombre);
    if (tip && tip.colorFijo) partes.push(tip.colorFijo);           // cortinas de PVC: solo blancas
    if (color) partes.push(color.nombre.toLowerCase());
    if (tip && !tip.sinVidrio && vidrio && vidrio.id !== 'sin') {
      // "vidrio Simple 4 mm"; los paneles ya dicen qué son ("Poliestireno Bebé", "Policarbonato alveolar 6 mm opal").
      var panel = /^(poliestireno|policarbonato)/i.test(vidrio.nombre);
      partes.push((panel ? '' : 'vidrio ') + (panel ? vidrio.nombre.charAt(0).toLowerCase() + vidrio.nombre.slice(1) : vidrio.nombre) +
                  (item.tono && /^policarb/.test(vidrio.id) ? ' ' + item.tono.toLowerCase() : ''));
    }
    (item.adicionales || []).forEach(function (aid) {
      var ad = buscar(precios.adicionales, aid);
      // Primera letra en minúscula, sin tocar siglas: "con cortina de enrollar PVC blanca".
      if (ad) partes.push('con ' + ad.nombre.charAt(0).toLowerCase() + ad.nombre.slice(1) + (ad.colorFijo ? ' ' + ad.colorFijo : ''));
    });
    return {
      titulo: tip ? tip.nombre : 'Ítem',
      detalle: partes.join(', ')
    };
  }

  /*
   * Código de cada abertura, como el "título" de los programas de cómputo
   * (V1, V2, PF1…): sirve para hablar de "la V3" en la obra, en el plano y
   * con el cliente. Se numera por tipo, en el orden de carga.
   */
  var PREFIJOS = {
    'vent-corr-2': 'V', 'vent-corr-3': 'V', 'vent-corr-4': 'V', 'vent-abrir-1': 'V', 'vent-abrir-2': 'V',
    'banderola': 'V', 'oscilo': 'V', 'pano-fijo': 'PF',
    'puerta-abrir': 'P', 'puerta-doble': 'P', 'puerta-tablero': 'P',
    'pbalcon-corr-2': 'PB', 'pbalcon-corr-3': 'PB', 'pbalcon-abrir': 'PB',
    'cerramiento': 'CE', 'baranda': 'B', 'techo-policarb': 'T', 'porton-corr': 'PO', 'porton-levad': 'PO',
    'bajo-mesada': 'BM', 'mosq-corr': 'M', 'mosq-fijo': 'M', 'postigon': 'PT', 'reja': 'R', 'reja-2': 'R',
    'cortina-pvc-cajon': 'C', 'cortina-pvc-sola': 'C'
  };
  var PREFIJO_GRUPO = { Ventanas: 'V', Puertas: 'P', Cerramientos: 'CE', Complementos: 'X' };

  function codigos(items, precios) {
    var cuenta = {};
    return (items || []).map(function (it) {
      var tip = buscar(precios.tipologias, it.tipologiaId);
      var pre = PREFIJOS[it.tipologiaId] || (tip && PREFIJO_GRUPO[tip.grupo]) || 'A';
      cuenta[pre] = (cuenta[pre] || 0) + 1;
      return pre + cuenta[pre];
    });
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
      codigos: codigos(presupuesto.items, precios),
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
    redondear: redondear,
    formaDe: formaDe,
    codigos: codigos,
    FORMAS: FORMAS
  };
})();
