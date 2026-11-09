/* ============================================================
   ALUMFER — Presupuestos · Materiales para comprar (aproximado)

   Lista de compras para uso interno: NUNCA sale en el PDF ni en el
   WhatsApp del cliente. Inspirado en el cómputo y la optimización
   lineal de los programas de carpintería (OP 2.1), pero sin su base
   de perfiles: no tiene los códigos ni los descuentos de fabricación
   de cada línea.

   Por eso es una estimación DEL LADO SEGURO:
   - Cada pieza se toma con la medida de afuera a afuera (sin restar
     los descuentos de la línea): sobra un poco, nunca falta.
   - Las piezas se agrupan por línea + perfil + color, que es como
     se compran las barras, y se acomodan en barras de 6 m (largo
     configurable) dejando el corte de la sierra en cada pieza.
   - Vidrios: un paño por hoja, con la medida de la hoja.
   - Cortinas de PVC y rejas de hierro van en m² (no son barras de
     aluminio).

   Funciones puras, sin DOM: se puede probar en Node cargando
   formato → precios-base → calculo → materiales.
   ============================================================ */

window.Materiales = (function () {
  'use strict';

  var C = window.Calculo;

  /* Cómo está armada cada tipología: sistema (para nombrar el perfil) y hojas. */
  var ESTRUCTURA = {
    'vent-corr-2': ['corrediza', 2], 'vent-corr-3': ['corrediza', 3], 'vent-corr-4': ['corrediza', 4],
    'vent-abrir-1': ['abrir', 1], 'vent-abrir-2': ['abrir', 2], 'banderola': ['abrir', 1], 'oscilo': ['abrir', 1],
    'pano-fijo': ['fijo', 0], 'puerta-abrir': ['puerta', 1], 'puerta-doble': ['puerta', 2], 'puerta-tablero': ['puerta', 1],
    'pbalcon-corr-2': ['corrediza', 2], 'pbalcon-corr-3': ['corrediza', 3], 'pbalcon-abrir': ['abrir', 2],
    'cerramiento': ['corrediza', 4], 'baranda': ['fijo', 0], 'techo-policarb': ['estructura', 0],
    'porton-corr': ['puerta', 1], 'porton-levad': ['puerta', 1], 'bajo-mesada': ['abrir', 2],
    'mosq-corr': ['mosquitero', 1], 'mosq-fijo': ['mosquitero', 1], 'postigon': ['abrir', 2]
  };
  var NOMBRE_SISTEMA = {
    corrediza: 'corrediza', abrir: 'de abrir', puerta: 'de puerta', fijo: 'de paño fijo',
    estructura: 'de estructura', mosquitero: 'de mosquitero'
  };
  var EN_M2 = /^(reja|cortina-pvc)/;   // rejas de hierro y cortinas de PVC: se compran por m²

  function num(v) { v = Number(v); return isFinite(v) ? v : 0; }
  function r10(mm) { return Math.round(mm); }

  /** Lados del marco según la forma: [{largo, curva}] en mm. */
  function ladosMarco(l, sistema) {
    var a = l.anchoMm, h = l.altoMm, h2 = l.alto2Mm || 0;
    switch (l.forma) {
      case 'inclinada':
        return [{ largo: a }, { largo: h }, { largo: h2 }, { largo: Math.hypot(a, h - h2) }];
      case 'triangulo':
        var lado = Math.hypot(a / 2, h);
        return [{ largo: a }, { largo: lado }, { largo: lado }];
      case 'arco':
        var radio = a / 2, recto = Math.max(0, h - radio);
        return [{ largo: a }, { largo: recto }, { largo: recto }, { largo: Math.PI * radio, curva: true }];
      case 'redonda':
        return [{ largo: Math.PI * a, curva: true }];
    }
    // Puertas: marco de tres lados (sin umbral).
    return sistema === 'puerta'
      ? [{ largo: a }, { largo: h }, { largo: h }]
      : [{ largo: a }, { largo: a }, { largo: h }, { largo: h }];
  }

  /**
   * Piezas de UNA abertura (ya multiplicadas por su cantidad).
   * Devuelve { perfiles: [{clave, perfil, linea, color, largo, curva}], vidrios: [...], m2: [...] }
   */
  function piezasItem(item, l, precios) {
    var tip = l.tipologia;
    var out = { perfiles: [], vidrios: [], m2: [] };
    var cant = l.cantidad;
    if (!cant || !l.anchoMm || !l.altoMm) return out;

    var titulo = l.descripcion.titulo;
    if (EN_M2.test(item.tipologiaId)) {
      out.m2.push({ nombre: titulo + (tip && tip.colorFijo ? ' ' + tip.colorFijo : ''), m2: l.m2Real * cant, unidades: cant });
      return out;
    }

    var est = ESTRUCTURA[item.tipologiaId] || ['fijo', 0];
    var sistema = est[0], hojas = est[1];
    var linea = l.linea ? l.linea.nombre : (tip && tip.sinLinea ? '' : 'Sin línea');
    var color = l.color ? l.color.nombre : '';

    function perfil(nombre, largo, curva) {
      for (var k = 0; k < cant; k++) {
        out.perfiles.push({
          clave: [linea, nombre, color].join('|'), perfil: nombre, linea: linea, color: color,
          largo: r10(largo), curva: !!curva
        });
      }
    }

    // Marco
    ladosMarco(l, sistema).forEach(function (lado) {
      perfil('Marco ' + NOMBRE_SISTEMA[sistema] + (lado.curva ? ' (curvado)' : ''), lado.largo, lado.curva);
    });

    // Hojas: cada una con su ancho (ancho / hojas) y el alto entero.
    var anchoHoja = hojas ? l.anchoMm / hojas : 0;
    for (var hj = 0; hj < hojas; hj++) {
      ['ancho', 'ancho', 'alto', 'alto'].forEach(function (lado) {
        perfil('Hoja ' + NOMBRE_SISTEMA[sistema], lado === 'ancho' ? anchoHoja : l.altoMm);
      });
    }

    // Agregados que son perfiles de aluminio, alrededor de la abertura.
    var perimetro = [l.anchoMm, l.anchoMm, Math.max(l.altoMm, l.alto2Mm || 0), Math.max(l.altoMm, l.alto2Mm || 0)];
    (item.adicionales || []).forEach(function (id) {
      if (id === 'premarco') perimetro.forEach(function (x) { perfil('Premarco', x); });
      if (id === 'contramarco') perimetro.forEach(function (x) { perfil('Tapajuntas', x); });
      if (id === 'mosquitero') ['ancho', 'ancho', 'alto', 'alto'].forEach(function (lado) {
        perfil('Hoja de mosquitero', lado === 'ancho' ? (hojas > 1 ? anchoHoja : l.anchoMm) : l.altoMm);
      });
      if (id === 'cortina-pvc' || id === 'cortina-alu') {
        var ad = C.buscar(precios.adicionales, id);
        out.m2.push({ nombre: ad ? ad.nombre + (ad.colorFijo ? ' ' + ad.colorFijo : '') : id, m2: l.m2Real * cant, unidades: cant });
      }
      if (id === 'reja-adic' || id === 'reja-adic-2') {
        var rj = C.buscar(precios.adicionales, id);
        out.m2.push({ nombre: rj ? rj.nombre : 'Reja', m2: l.m2Real * cant, unidades: cant });
      }
    });

    // Vidrio (o placa): un paño por hoja; el paño fijo y las formas, uno solo.
    if (!l.sinVidrio && l.vidrio && l.vidrio.id !== 'sin' && sistema !== 'mosquitero') {
      var panos = hojas || 1;
      var ancho = hojas ? anchoHoja : l.anchoMm;
      var especial = l.forma && l.forma !== 'rect';
      out.vidrios.push({
        vidrio: l.vidrio.nombre + (item.tono && /^policarb/.test(l.vidrio.id) ? ' ' + item.tono.toLowerCase() : ''),
        ancho: r10(ancho), alto: r10(Math.max(l.altoMm, l.alto2Mm || 0)),
        cantidad: panos * cant, especial: especial ? l.forma : '',
        m2: (ancho / 1000) * (Math.max(l.altoMm, l.alto2Mm || 0) / 1000) * panos * cant
      });
    }
    return out;
  }

  /**
   * Acomoda las piezas en barras (el más largo primero, en la primera barra
   * donde entre). Cada pieza gasta además el corte de la sierra.
   * Las piezas más largas que una barra se cortan en tramos (llevan empalme).
   */
  function enBarras(largos, largoBarra, corte) {
    var piezas = [], empalmes = 0;
    largos.forEach(function (L) {
      while (L > largoBarra) { piezas.push(largoBarra); L -= largoBarra; empalmes++; }
      if (L > 0) piezas.push(L);
    });
    piezas.sort(function (a, b) { return b - a; });
    var barras = [];   // cada una: { usado, piezas: [] }
    piezas.forEach(function (L) {
      // Entra si cabe en lo que queda; después del corte se pierde la sierra
      // (la última pieza puede terminar justo en la punta de la barra).
      for (var i = 0; i < barras.length; i++) {
        if (barras[i].usado + L <= largoBarra) {
          barras[i].usado = Math.min(largoBarra, barras[i].usado + L + corte);
          barras[i].piezas.push(L);
          return;
        }
      }
      barras.push({ usado: Math.min(largoBarra, L + corte), piezas: [L] });
    });
    var usado = 0;
    barras.forEach(function (b) { usado += b.piezas.reduce(function (s, x) { return s + x; }, 0); });
    return {
      barras: barras.length,
      usadoMm: usado,
      sobranteMm: barras.length * largoBarra - usado,
      // Lo que queda de cada barra (sin contar lo que se fue en cortes), de mayor a menor.
      retazos: barras.map(function (b) { return Math.max(0, largoBarra - b.usado); })
        .filter(function (x) { return x >= 50; }).sort(function (a, b) { return b - a; }),
      empalmes: empalmes,
      cortes: piezas.length
    };
  }

  /**
   * Lista de compras de un presupuesto.
   * @returns { perfiles: [...grupos], vidrios: [...], m2: [...], totales }
   */
  function calcular(presupuesto, precios) {
    var g = precios.generales || {};
    var largoBarra = num(g.largoBarra) || 6000;
    var corte = g.corteSierra != null ? num(g.corteSierra) : 5;
    var r = C.calcularPresupuesto(presupuesto, precios);

    var porClave = {}, grupos = [], vidrios = {}, listaVidrios = [], m2 = {}, listaM2 = [];
    (presupuesto.items || []).forEach(function (item, i) {
      var p = piezasItem(item, r.lineas[i], precios);
      p.perfiles.forEach(function (x) {
        if (!porClave[x.clave]) {
          porClave[x.clave] = { perfil: x.perfil, linea: x.linea, color: x.color, largos: [], curvas: 0 };
          grupos.push(porClave[x.clave]);
        }
        porClave[x.clave].largos.push(x.largo);
        if (x.curva) porClave[x.clave].curvas++;
      });
      p.vidrios.forEach(function (v) {
        if (!vidrios[v.vidrio]) { vidrios[v.vidrio] = { vidrio: v.vidrio, panos: [], m2: 0, cantidad: 0 }; listaVidrios.push(vidrios[v.vidrio]); }
        var grupo = vidrios[v.vidrio];
        var igual = grupo.panos.filter(function (q) { return q.ancho === v.ancho && q.alto === v.alto && q.especial === v.especial; })[0];
        if (igual) igual.cantidad += v.cantidad;
        else grupo.panos.push({ ancho: v.ancho, alto: v.alto, cantidad: v.cantidad, especial: v.especial });
        grupo.m2 += v.m2;
        grupo.cantidad += v.cantidad;
      });
      p.m2.forEach(function (x) {
        if (!m2[x.nombre]) { m2[x.nombre] = { nombre: x.nombre, m2: 0, unidades: 0 }; listaM2.push(m2[x.nombre]); }
        m2[x.nombre].m2 += x.m2;
        m2[x.nombre].unidades += x.unidades;
      });
    });

    var lineasKg = {};
    (precios.lineas || []).forEach(function (l) { lineasKg[l.nombre] = num(l.kgMetro); });

    var totales = { barras: 0, metrosComprados: 0, metrosUsados: 0, metrosSobran: 0, kg: 0, kgCompleto: true, m2Vidrio: 0 };
    grupos.forEach(function (gr) {
      var res = enBarras(gr.largos, largoBarra, corte);
      Object.assign(gr, res);
      gr.piezas = gr.largos.length;
      totales.barras += res.barras;
      totales.metrosComprados += res.barras * largoBarra / 1000;
      totales.metrosUsados += res.usadoMm / 1000;
      totales.metrosSobran += res.sobranteMm / 1000;
      // Kilos: solo si la línea tiene cargado su peso por metro (Precios → Líneas).
      var kgM = lineasKg[gr.linea] || 0;
      gr.kg = kgM ? res.barras * largoBarra / 1000 * kgM : 0;
      if (!kgM) totales.kgCompleto = false;
      totales.kg += gr.kg;
    });
    listaVidrios.forEach(function (v) {
      v.panos.sort(function (a, b) { return b.ancho * b.alto - a.ancho * a.alto; });
      totales.m2Vidrio += v.m2;
    });
    grupos.sort(function (a, b) {
      return (a.linea + a.color + a.perfil).localeCompare(b.linea + b.color + b.perfil, 'es');
    });

    return { perfiles: grupos, vidrios: listaVidrios, m2: listaM2, totales: totales, largoBarra: largoBarra, corte: corte };
  }

  return { calcular: calcular, enBarras: enBarras, piezasItem: piezasItem };
})();
