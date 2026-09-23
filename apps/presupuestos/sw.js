/* ============================================================
   ALUMFER — Presupuestos · Service worker

   Guarda la app entera en el celular para que abra sin internet:
   en una obra sin señal tiene que funcionar igual.

   Cómo llega una versión nueva al teléfono:
     1. Al abrir la app, el navegador se fija si este archivo cambió.
     2. Si cambió, baja la versión nueva en segundo plano y queda
        esperando, sin pisar la que se está usando.
     3. La app muestra la franja "Hay una versión nueva" y, recién
        cuando se toca Actualizar, se activa y recarga.

   POR ESO: al cambiar cualquier archivo hay que subir VERSION.
   Si no, el navegador no se entera de que hay algo nuevo.
   ============================================================ */

var VERSION = '2026-09-23.1';
var CACHE = 'alumfer-presupuestos-' + VERSION;

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
  // Sin skipWaiting: la versión nueva espera a que la persona toque Actualizar.
  ev.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ARCHIVOS.map(function (a) {
        return new Request(a, { cache: 'reload' });   // que no la sirva el caché del navegador
      }));
    })
  );
});

self.addEventListener('activate', function (ev) {
  ev.waitUntil(
    caches.keys().then(function (claves) {
      return Promise.all(claves.map(function (c) {
        return c === CACHE ? null : caches.delete(c);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('message', function (ev) {
  var dato = ev.data || {};
  if (dato.tipo === 'ACTUALIZAR') self.skipWaiting();
  if (dato.tipo === 'VERSION' && ev.ports && ev.ports[0]) ev.ports[0].postMessage(VERSION);
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
      var red = fetch(ev.request).then(function (respuesta) {
        if (respuesta && respuesta.status === 200 && respuesta.type !== 'opaque') {
          var copia = respuesta.clone();
          caches.open(CACHE).then(function (cache) { cache.put(ev.request, copia); });
        }
        return respuesta;
      }).catch(function () { return guardado; });

      // Lo guardado se sirve al instante; la red queda de respaldo y, de paso,
      // refresca el caché por si alguna vez se publica sin subir VERSION.
      return guardado || red;
    })
  );
});
