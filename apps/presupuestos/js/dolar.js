/* ============================================================
   ALUMFER — Presupuestos · Cotización del dólar blue

   El precio del aluminio se mueve con el blue, no con el oficial,
   así que se consulta el paralelo. Dos fuentes públicas y gratis:
   si la primera no responde, se prueba la segunda.

   El último valor queda guardado en el teléfono: sin señal se
   muestra ese, aclarando de cuándo es.
   ============================================================ */

window.Dolar = (function () {
  'use strict';

  var CLAVE = 'alumfer.dolar.v1';
  var ESPERA = 8000;

  var FUENTES = [
    {
      nombre: 'dolarapi.com',
      url: 'https://dolarapi.com/v1/dolares/blue',
      leer: function (d) {
        return { compra: Number(d.compra), venta: Number(d.venta), actualizado: d.fechaActualizacion };
      }
    },
    {
      nombre: 'bluelytics.com.ar',
      url: 'https://api.bluelytics.com.ar/v2/latest',
      leer: function (d) {
        return { compra: Number(d.blue.value_buy), venta: Number(d.blue.value_sell), actualizado: d.last_update };
      }
    }
  ];

  function guardado() {
    try { return JSON.parse(window.localStorage.getItem(CLAVE)); } catch (e) { return null; }
  }

  function guardar(valor) {
    try { window.localStorage.setItem(CLAVE, JSON.stringify(valor)); } catch (e) {}
  }

  function traer(fuente) {
    var corte = new AbortController();
    var reloj = setTimeout(function () { corte.abort(); }, ESPERA);
    return fetch(fuente.url, { signal: corte.signal, cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error(fuente.nombre + ' respondió ' + r.status);
        return r.json();
      })
      .then(function (d) {
        var v = fuente.leer(d);
        if (!isFinite(v.venta) || v.venta <= 0) throw new Error('Respuesta sin cotización');
        v.fuente = fuente.nombre;
        v.consultado = new Date().toISOString();
        return v;
      })
      .finally(function () { clearTimeout(reloj); });
  }

  /** Consulta las fuentes en orden y guarda la primera que conteste. */
  function actualizar() {
    var intento = Promise.reject();
    FUENTES.forEach(function (f) {
      intento = intento.catch(function () { return traer(f); });
    });
    return intento.then(function (v) { guardar(v); return v; });
  }

  return { guardado: guardado, actualizar: actualizar };
})();
