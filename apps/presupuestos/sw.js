/* ============================================================
   ALUMFER — Presupuestos · Service worker

   Guarda la app entera en el celular para que abra sin internet:
   en una obra sin señal tiene que funcionar igual. Los datos ya
   viven en el navegador, así que no hace falta nada más.

   Al cambiar cualquier archivo hay que subir VERSION; si no, el
   celular sigue mostrando la copia vieja.
   ============================================================ */

var VERSION = 'alumfer-presupuestos-v2';

var ARCHIVOS = [
  './',
  'index.html',
  'tokens.css',
  'estilos.css',
  'impresion.css',
  'manifest.webmanifest',
  'logo-alumfer.jpg',
  'favicon.png',
  'icono-192.png',
  'icono-512.png',
  'js/formato.js',
  'js/dolar.js',
  'js/iconos.js',
  'js/precios-base.js',
  'js/calculo.js',
  'js/almacenamiento.js',
  'js/documento.js',
  'js/app.js'
];

self.addEventListener('install', function (ev) {
  ev.waitUntil(
    caches.open(VERSION)
      .then(function (cache) { return cache.addAll(ARCHIVOS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (ev) {
  ev.waitUntil(
    caches.keys().then(function (claves) {
      return Promise.all(claves.map(function (c) {
        return c === VERSION ? null : caches.delete(c);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (ev) {
  if (ev.request.method !== 'GET') return;

  var url = new URL(ev.request.url);
  var propio = url.origin === self.location.origin;
  var esTipografia = /(^|\.)(googleapis|gstatic)\.com$/.test(url.hostname);

  // La cotización del dólar tiene que salir siempre a la red: si se guardara,
  // el celular mostraría el valor de ayer creyendo que es el de hoy.
  if (!propio && !esTipografia) return;

  ev.respondWith(
    caches.match(ev.request).then(function (guardado) {
      // Lo que ya está guardado se sirve al instante y se refresca de fondo.
      var red = fetch(ev.request).then(function (respuesta) {
        if (respuesta && respuesta.status === 200 && respuesta.type !== 'opaque') {
          var copia = respuesta.clone();
          caches.open(VERSION).then(function (cache) { cache.put(ev.request, copia); });
        }
        return respuesta;
      }).catch(function () { return guardado; });

      return guardado || red;
    })
  );
});
