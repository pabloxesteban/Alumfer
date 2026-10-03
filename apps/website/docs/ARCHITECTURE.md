# Arquitectura

Documento de referencia para entender cómo está construido el sitio de Alumfer
y por qué. Pensado para que cualquier desarrollador pueda orientarse en pocos
minutos.

## Principio rector

Es un **sitio estático** (home + páginas de producto, zona y guías) cuyo único objetivo
de negocio es **convertir visitas en consultas** (WhatsApp, teléfono o
formulario). Todo lo demás —diseño, animación, performance, SEO— está al
servicio de eso. No hay framework, no hay build step y no hay base de datos: la
simplicidad es deliberada y debe preservarse.

## Mapa del sistema

```
                      ┌──────────────────────────────┐
   Visitante  ───────▶│         index.html           │
                      │  (hero, galería, catálogo,    │
                      │   FAQ, testimonios, contacto) │
                      └──────────────┬───────────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          ▼                          ▼                          ▼
   CSS                       JS de interacción           Conversión
   site.css (todas) +        site.js  (galería,          • Links wa.me (WhatsApp)
   pages.css (internas)      líneas, form, GA4)          • tel: (teléfono)
                                                         • Formulario → enviar.php
                                                              │
                                                              ▼
                                                  enviar.php + email-template.php
                                                  • Email al admin (la consulta)
                                                  • Email de confirmación al cliente
                                                              │
                                                              ▼
                                                        gracias.html
                                                  (dispara evento GA4 "conversion")
```

## CSS y JavaScript (sistema visual 2026)

Tres archivos, sin framework ni build:

1. **`site.css`** — Todo el sistema visual: fuentes (`fonts/`, Archivo + IBM
   Plex Mono, alojadas en el sitio), tokens de color/tipo/espaciado en `:root`,
   navegación, hero, galería, líneas, configurador, footer, dock mobile y
   lightbox. La usan **todas** las páginas.
2. **`pages.css`** — Lo propio de las páginas internas (productos, zonas,
   guías, gracias): hero de página, fichas numeradas, proceso, FAQ, reseñas,
   zonas cercanas y formulario. Estila las clases que ya tenía el contenido
   (`section`, `feature`, `faq-item`, `process-step`…), así que el texto de
   cada página no se tocó.
3. **`site.js`** — Una sola IIFE. Cada bloque se activa sólo si su sección
   existe: navegación y menú mobile, revelado al scrollear, tira de obras,
   proceso por pasos, galería con filtros + lightbox, selector de líneas,
   configurador de vidrio y color, dock mobile que se esconde sobre el
   formulario, envío de cualquier `form[action$="enviar.php"]` y medición GA4.

4. **Diseñador (`/disena-tu-abertura/`)** — `aberturas.js` dibuja cada
   abertura a escala en SVG (12 tipologías, mismos nombres que la app de
   presupuestos), con cotas, color, vidrio, mosquitero y persona de 1,70 m de
   referencia. `disena.js` maneja el editor, la lista (guardada en el
   navegador con `localStorage`), el envío por WhatsApp, la descarga del
   boceto en PNG y el formulario a `enviar.php` (Tipo = "Boceto desde el
   diseñador web"). Estilos en `disena.css`. No muestra precios.

Paleta: papel claro cálido, azul marino para secciones oscuras, azul de marca
(`#1B6CC8`) en botones, banda de proceso y acentos. Motivo gráfico: grilla y
cotas de plano. Las fotos de obra se presentan como copias impresas numeradas.

Mobile (la mayoría de las visitas) tiene diseño propio: dock flotante
Llamar/WhatsApp, menú a pantalla completa, carruseles deslizables y el
configurador con la ventana fija arriba mientras se eligen opciones.

## Formulario y emails

1. El usuario envía el `<form>` de contacto. `site.js` intercepta el `submit`,
   hace `fetch` POST a `enviar.php` y espera JSON `{ success: true }`.
2. `enviar.php`:
   - Rechaza todo lo que no sea POST.
   - Tiene un **honeypot** (`botcheck`): si viene completo, simula éxito sin enviar.
   - Sanea y valida los campos (`Nombre`, `Teléfono`, `Tipo`, `Consulta` obligatorios).
   - Arma dos emails HTML con los helpers de `email-template.php`:
     uno al administrador (con los datos + botón "Responder por WhatsApp") y, si
     el cliente dejó email, una confirmación de marca.
   - Envía con `mail()` codificando el cuerpo en base64 (evita rechazos de Exim
     por líneas largas).
3. Si el email al admin sale, responde `{ success: true }` y `site.js` redirige a
   `gracias.html`, que dispara el evento de **conversión** en GA4.

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) publica por FTP a cPanel en cada
push a `main`. El cache se controla con `.htaccess` + querystrings de versión
(`?v=N`) en los `<link>`/`<script>`: al cambiar un CSS/JS hay que **subir el
número de versión** en todas las páginas que lo cargan para invalidar la caché.

## Reglas para no romper la simplicidad

- **No agregues un framework ni un bundler** salvo que haya una razón de negocio
  fuerte y medible. El sitio carga rápido justamente porque es plano.
- **Cambios de diseño global → variables `:root` de `site.css`.** No hardcodees colores en componentes.
- **Estados → clases `is-*` desde JS.** No mezcles lógica de estilo en el JS más
  allá de togglear clases.
- **Animación: poca y en CSS.** Fades cortos, hovers de ~220 ms, nada que
  secuestre el scroll. Siempre detrás de `prefers-reduced-motion`.
- **Fotos de obra propias, nunca stock.** Ver `docs/REDISENO-2026.md`.
- **`tools/build-landings.mjs` está desactualizado** respecto del HTML
  publicado: no regenerar las landings sin antes sincronizarlo.
- **Al tocar CSS/JS, subí el `?v=`** correspondiente.
