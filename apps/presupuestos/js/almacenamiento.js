/* ============================================================
   ALUMFER — Presupuestos · Persistencia en el navegador

   Todo vive en localStorage (no hay servidor). Si el navegador lo
   bloquea —por ejemplo abriendo el archivo con file:// en modo
   privado— se cae a memoria y `disponible` queda en false, para que
   la app pueda avisar que lo guardado se pierde al cerrar.
   ============================================================ */

window.Almacenamiento = (function () {
  'use strict';

  var K_PRESUPUESTOS = 'alumfer.presupuestos.v1';
  var K_PRECIOS      = 'alumfer.precios.v1';
  var K_CONTADOR     = 'alumfer.contador.v1';
  var K_LOGO         = 'alumfer.logo.v1';   // aparte: si fuera en precios, se copiaría en cada presupuesto

  var memoria = {};
  var disponible = (function () {
    try {
      var k = '__alumfer_test__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  })();

  function leer(clave, porDefecto) {
    try {
      var crudo = disponible ? window.localStorage.getItem(clave) : memoria[clave];
      if (crudo == null) return porDefecto;
      return JSON.parse(crudo);
    } catch (e) {
      console.warn('No se pudo leer', clave, e);
      return porDefecto;
    }
  }

  function escribir(clave, valor) {
    var crudo = JSON.stringify(valor);
    try {
      if (disponible) window.localStorage.setItem(clave, crudo);
      else memoria[clave] = crudo;
      return true;
    } catch (e) {
      console.warn('No se pudo guardar', clave, e);
      memoria[clave] = crudo;
      return false;
    }
  }

  /* ── Precios ─────────────────────────────────────────────── */

  /*
   * Nombres de fábrica que se cambiaron por palabras más claras o más
   * exactas. Los precios guardados en el teléfono tienen los nombres viejos:
   * se renombran solo si siguen siendo uno de los de fábrica (si alguien les
   * puso otro nombre a mano, se respeta). Nunca toca un precio.
   *   lista → id → [nombres viejos, nombre nuevo, ayudas viejas, ayuda nueva]
   */
  var RENOMBRES = {
    lineas: {
      herrero: [[], '', ['la más económica'], 'la más elegida, robusta'],
      rotonda: [['Rotonda'], 'Rotonda 640', ['económica reforzada'], 'para ventanas y puertas grandes'],
      modena:  [['Módena'], 'Módena 1', ['premium, la que más aísla'], 'buena relación calidad-precio'],
      a30:     [[], '', ['intermedia, acepta DVH', 'intermedia, acepta doble vidrio'], 'perfil de 30 mm, de diseño']
    },
    vidrios: {
      float3: [['Float 3 mm'], 'Simple 3 mm'],
      float4: [['Float 4 mm'], 'Simple 4 mm'],
      float5: [['Float 5 mm'], 'Simple 5 mm', ['para paños grandes'], 'para ventanas grandes'],
      float6: [['Float 6 mm'], 'Simple 6 mm', ['para paños muy grandes'], 'para ventanas muy grandes'],
      esmerilado: [['Esmerilado / satinado 4 mm'], 'Esmerilado 4 mm', ['no se ve a través (baños)'], 'no se ve a través, para baños'],
      espejado: [['Reflectivo espejado 5 mm'], 'Espejado 5 mm', ['espeja de afuera, da sombra'], 'de afuera no se ve adentro, da sombra'],
      lam33: [['Laminado 3+3 (seguridad)', 'De seguridad 3+3'], 'Laminado 3+3',
              ['no se astilla, antirrobo', 'si se rompe no se cae, antirrobo'], 'de seguridad: si se rompe no se cae'],
      lam44: [['Laminado 4+4 (seguridad)', 'De seguridad 4+4'], 'Laminado 4+4',
              ['seguridad reforzada', 'más resistente todavía'], 'de seguridad, más resistente'],
      dvh494: [['DVH 4/9/4', 'Doble vidrio (DVH)'], 'Doble vidrio (DVH) 4/9/4', ['doble vidrio: frío y ruido'], 'aísla del frío y del ruido'],
      'dvh-lam': [['DVH con laminado 3+3', 'Doble vidrio de seguridad'], 'Doble vidrio (DVH) con laminado',
                  ['doble vidrio + seguridad'], 'aísla y además es de seguridad'],
      'policarb-alv': [[], '', ['para techos, liviano'], 'el más usado en techos'],
      'policarb-comp': [[], '', ['para techos, resistente'], 'macizo, muy resistente a golpes']
    },
    colores: {
      natural: [['Aluminio natural'], 'Anodizado natural'],
      bronce: [['Bronce (anolok)', 'Bronce'], 'Bronce colonial'],
      gris: [['Gris / grafito'], 'Gris']
    },
    adicionales: {
      premarco: [['Premarco de chapa'], 'Premarco de aluminio'],
      'reja-adic': [['Reja de seguridad', 'Reja de aluminio tipo 1'], 'Reja de hierro redondo'],
      'reja-adic-2': [['Reja de aluminio tipo 2'], 'Reja de hierro cuadrado']
    },
    tipologias: {
      reja: [['Reja de seguridad', 'Reja de aluminio tipo 1'], 'Reja de hierro redondo'],
      'reja-2': [['Reja de aluminio tipo 2'], 'Reja de hierro cuadrado']
    }
  };

  /** Solo nombres: se aplica a la lista vigente y a la copia de cada presupuesto. */
  function actualizarNombres(precios) {
    if (!precios) return precios;
    Object.keys(RENOMBRES).forEach(function (lista) {
      (precios[lista] || []).forEach(function (x) {
        var r = RENOMBRES[lista][x.id];
        if (!r) return;
        if (r[1] && r[0].indexOf(x.nombre) > -1) x.nombre = r[1];
        if (r[2] && r[2].indexOf(x.ayuda) > -1) x.ayuda = r[3];
      });
    });
    return precios;
  }

  /* Productos de fábrica que se dejaron de ofrecer (Alumfer trabaja aluminio y vidrio; de hierro, solo rejas). */
  var QUITADOS = { adicionales: ['refuerzo', 'cierrapuertas', 'zocalo'] };
  /* Datos de cada producto que no son precio y vienen de fábrica: se completan siempre. */
  var MARCAS = ['grupo', 'sinLinea', 'sinColor', 'sinVidrio', 'familia'];

  /**
   * Pone al día la lista guardada con el catálogo de fábrica, una sola vez por
   * versión de catálogo: quita lo que ya no se hace y suma lo nuevo (líneas,
   * vidrios, colores, tipos, agregados) con sus precios de referencia. Lo que
   * ya estaba guardado conserva sus precios.
   */
  function actualizarCatalogo(p, base) {
    ['lineas', 'tipologias', 'vidrios', 'colores', 'adicionales', 'formas'].forEach(function (k) {
      var deFabrica = {};
      base[k].forEach(function (x) { deFabrica[x.id] = x; });
      p[k].forEach(function (x) {
        var b = deFabrica[x.id];
        if (b) MARCAS.forEach(function (m) { if (b[m] != null && x[m] == null) x[m] = b[m]; });
      });
      if ((p.catalogo || 1) >= base.catalogo) return;
      if (QUITADOS[k]) p[k] = p[k].filter(function (x) { return QUITADOS[k].indexOf(x.id) === -1; });
      var ids = p[k].map(function (x) { return x.id; });
      base[k].forEach(function (x) {
        if (ids.indexOf(x.id) > -1) return;
        var copia = JSON.parse(JSON.stringify(x));
        // Al final de su grupo, para que el selector no lo muestre suelto.
        var ultimo = -1;
        p[k].forEach(function (y, i) { if (copia.grupo && y.grupo === copia.grupo) ultimo = i; });
        if (ultimo > -1) p[k].splice(ultimo + 1, 0, copia); else p[k].push(copia);
      });
      if (k === 'tipologias') {
        p[k].forEach(function (t) {
          if (t.lineas && t.lineas.indexOf('modena') > -1 && t.lineas.indexOf('modena2') === -1) t.lineas.push('modena2');
        });
      }
    });
    p.catalogo = base.catalogo;
    return p;
  }

  /** Precios guardados, completados con los de fábrica si falta algo. */
  function cargarPrecios() {
    var base = JSON.parse(JSON.stringify(window.PRECIOS_BASE));
    var guardado = leer(K_PRECIOS, null);
    if (!guardado) return base;
    var p = Object.assign({}, base, guardado);
    p.catalogo = guardado.catalogo || 1;   // el de fábrica no cuenta: importa hasta dónde llegó este teléfono
    p.generales = Object.assign({}, base.generales, guardado.generales || {});
    p.empresa   = Object.assign({}, base.empresa, guardado.empresa || {});
    p.aluminio  = Object.assign({}, base.aluminio, guardado.aluminio || {});
    if (!Array.isArray(p.aluminio.historial)) p.aluminio.historial = [];
    ['lineas', 'tipologias', 'vidrios', 'colores', 'adicionales', 'formas'].forEach(function (k) {
      if (!Array.isArray(p[k]) || !p[k].length) p[k] = base[k];
    });
    return actualizarNombres(actualizarCatalogo(p, base));
  }

  function guardarPrecios(precios) { return escribir(K_PRECIOS, precios); }
  function restaurarPrecios() {
    try { disponible ? window.localStorage.removeItem(K_PRECIOS) : delete memoria[K_PRECIOS]; } catch (e) {}
    return cargarPrecios();
  }

  /* ── Presupuestos ────────────────────────────────────────── */

  function listar() {
    var lista = leer(K_PRESUPUESTOS, []);
    if (!Array.isArray(lista)) return [];
    return lista.sort(function (a, b) { return String(b.modificado || '').localeCompare(String(a.modificado || '')); });
  }

  function obtener(id) {
    var lista = listar();
    for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i];
    return null;
  }

  function guardar(presupuesto) {
    var lista = listar();
    presupuesto.modificado = new Date().toISOString();
    var i = lista.findIndex(function (p) { return p.id === presupuesto.id; });
    if (i > -1) lista[i] = presupuesto; else lista.unshift(presupuesto);
    escribir(K_PRESUPUESTOS, lista);
    return presupuesto;
  }

  function borrar(id) {
    escribir(K_PRESUPUESTOS, listar().filter(function (p) { return p.id !== id; }));
  }

  /** P-2026-0007 — el contador se reinicia cada año. */
  function siguienteNumero() {
    var anio = new Date().getFullYear();
    var c = leer(K_CONTADOR, { anio: anio, n: 0 });
    if (c.anio !== anio) c = { anio: anio, n: 0 };
    c.n += 1;
    escribir(K_CONTADOR, c);
    return 'P-' + anio + '-' + String(c.n).padStart(4, '0');
  }

  /* ── Clientes ────────────────────────────────────────────── */

  function clave(t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Clientes de presupuestos anteriores, sin repetir (mismo nombre y
   * teléfono = misma persona), con los datos más recientes primero.
   * No hay una lista aparte que mantener: se cargan una vez, en el
   * presupuesto, y quedan disponibles para el próximo.
   */
  function clientes(excluirId) {
    var vistos = {}, lista = [];
    listar().forEach(function (p) {
      var c = p.cliente || {};
      if (!c.nombre || p.id === excluirId) return;
      var k = clave(c.nombre) + '|' + String(c.telefono || '').replace(/\D/g, '');
      if (vistos[k]) { vistos[k].presupuestos++; return; }
      vistos[k] = Object.assign({}, c, { presupuestos: 1, ultimo: p.fecha });
      lista.push(vistos[k]);
    });
    return lista;
  }

  /**
   * Clientes cuyo nombre, teléfono o localidad contiene lo buscado.
   * `excluirId`: el presupuesto abierto, que se autoguarda mientras se
   * tipea y si no aparecería como cliente con el nombre a medio escribir.
   */
  function buscarClientes(texto, excluirId) {
    var q = clave(texto);
    if (q.length < 2) return [];
    var digitos = q.replace(/\D/g, '');
    return clientes(excluirId).filter(function (c) {
      return clave(c.nombre).indexOf(q) > -1 || clave(c.localidad).indexOf(q) > -1 ||
             (digitos.length >= 3 && String(c.telefono || '').replace(/\D/g, '').indexOf(digitos) > -1);
    });
  }

  /* ── Logo propio ─────────────────────────────────────────── */

  function cargarLogo() { return leer(K_LOGO, ''); }
  function guardarLogo(dataUrl) {
    if (!dataUrl) {
      try { disponible ? window.localStorage.removeItem(K_LOGO) : delete memoria[K_LOGO]; } catch (e) {}
      return true;
    }
    return escribir(K_LOGO, dataUrl);
  }

  /* ── Copia de seguridad ──────────────────────────────────── */

  function exportarTodo() {
    return {
      app: 'alumfer-presupuestos',
      version: 1,
      exportado: new Date().toISOString(),
      precios: cargarPrecios(),
      presupuestos: listar(),
      contador: leer(K_CONTADOR, null),
      logo: cargarLogo()
    };
  }

  function importarTodo(datos) {
    if (!datos || datos.app !== 'alumfer-presupuestos') throw new Error('El archivo no es una copia de Alumfer Presupuestos.');
    if (datos.precios) escribir(K_PRECIOS, datos.precios);
    if (Array.isArray(datos.presupuestos)) escribir(K_PRESUPUESTOS, datos.presupuestos);
    if (datos.contador) escribir(K_CONTADOR, datos.contador);
    if ('logo' in datos) guardarLogo(datos.logo);
    return true;
  }

  return {
    disponible: disponible,
    cargarPrecios: cargarPrecios, guardarPrecios: guardarPrecios, restaurarPrecios: restaurarPrecios,
    listar: listar, obtener: obtener, guardar: guardar, borrar: borrar,
    siguienteNumero: siguienteNumero, actualizarNombres: actualizarNombres,
    clientes: clientes, buscarClientes: buscarClientes,
    cargarLogo: cargarLogo, guardarLogo: guardarLogo,
    exportarTodo: exportarTodo, importarTodo: importarTodo
  };
})();
