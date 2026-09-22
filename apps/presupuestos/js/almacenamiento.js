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

  /** Precios guardados, completados con los de fábrica si falta algo. */
  function cargarPrecios() {
    var base = JSON.parse(JSON.stringify(window.PRECIOS_BASE));
    var guardado = leer(K_PRECIOS, null);
    if (!guardado) return base;
    var p = Object.assign({}, base, guardado);
    p.generales = Object.assign({}, base.generales, guardado.generales || {});
    p.empresa   = Object.assign({}, base.empresa, guardado.empresa || {});
    ['lineas', 'tipologias', 'vidrios', 'colores', 'adicionales'].forEach(function (k) {
      if (!Array.isArray(p[k]) || !p[k].length) p[k] = base[k];
    });
    return p;
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

  /* ── Copia de seguridad ──────────────────────────────────── */

  function exportarTodo() {
    return {
      app: 'alumfer-presupuestos',
      version: 1,
      exportado: new Date().toISOString(),
      precios: cargarPrecios(),
      presupuestos: listar(),
      contador: leer(K_CONTADOR, null)
    };
  }

  function importarTodo(datos) {
    if (!datos || datos.app !== 'alumfer-presupuestos') throw new Error('El archivo no es una copia de Alumfer Presupuestos.');
    if (datos.precios) escribir(K_PRECIOS, datos.precios);
    if (Array.isArray(datos.presupuestos)) escribir(K_PRESUPUESTOS, datos.presupuestos);
    if (datos.contador) escribir(K_CONTADOR, datos.contador);
    return true;
  }

  return {
    disponible: disponible,
    cargarPrecios: cargarPrecios, guardarPrecios: guardarPrecios, restaurarPrecios: restaurarPrecios,
    listar: listar, obtener: obtener, guardar: guardar, borrar: borrar,
    siguienteNumero: siguienteNumero,
    exportarTodo: exportarTodo, importarTodo: importarTodo
  };
})();
