# Arquitectura

Documento de referencia para entender cómo está construido el sitio de Alumfer
y por qué. Pensado para que cualquier desarrollador pueda orientarse en pocos
minutos.

## Principio rector

Es un **sitio estático de una sola página** (`index.html`) cuyo único objetivo
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
   CSS en capas              JS de interacción           Conversión
   tokens → base →           main.js  (galería,          • Links wa.me (WhatsApp)
   components →              tabs, form, GA4)            • tel: (teléfono)
   animations                                            • Formulario → enviar.php
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

## Capas de CSS (orden de carga importa)

El orden de `<link>` en `index.html` define la cascada. Respetalo:

1. **`tokens.css`** — *Single source of truth* del design system. Variables CSS
   para color, tipografía, espaciado, radios y transiciones. Si vas a cambiar un
   color o un espaciado, hacelo acá, no en los componentes.
2. **`base.css`** — Reset, tipografía de elementos (`h1`–`h6`, `p`, `a`),
   contenedor (`.container`), modificadores de sección (`.section--dark/mid/...`)
   y utilidades de identidad (`.eyebrow`, `.ruled`, `.section-header`).
3. **`components.css`** — Todos los componentes visuales (navbar, hero, galería,
   tabs de catálogo, cards, formulario, footer, etc.). Es el archivo más grande
   y está organizado por bloques con encabezados de comentario.
4. **`animations.css`** — Reveal por scroll, entrada del hero y menú mobile.

### Convención de nombres: BEM

Los componentes usan **BEM** (`bloque__elemento--modificador`):
`navbar__logo-text`, `works-item__overlay`, `btn--primary`. Los estados se
manejan con clases `is-*` (`is-active`, `is-visible`, `is-open`, `is-hidden`)
que aplica el JavaScript.

## JavaScript

Un solo archivo, sin módulos, sin bundler y sin librerías externas:

- **`main.js`** — Toda la interacción funcional, dentro de un único
  `DOMContentLoaded`. Cada bloque está delimitado por un comentario:
  navbar scroll, reveal (IntersectionObserver), menú mobile, galería de
  trabajos + lightbox, tabs de catálogo (con `aria-selected`), anclas internas
  con compensación de la navbar, envío del formulario (`fetch` a `enviar.php`)
  y tracking de eventos GA4 (clicks de WhatsApp y teléfono).

Hasta octubre de 2026 existía `cinematic.js` (GSAP + ScrollTrigger + Lenis +
SplitType desde CDN: smooth scroll, título palabra por palabra, parallax y
botones magnéticos). Se sacó a propósito: eran 4 requests externos para
efectos que hacían que el sitio pareciera un template y no ayudaban a
entender el producto. Ver `docs/REDISENO-2026.md`. Las animaciones que quedan
(fade de entrada, reveal al scrollear) son CSS y respetan
`prefers-reduced-motion`.

## Formulario y emails

1. El usuario envía el `<form>` de contacto. `main.js` intercepta el `submit`,
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
3. Si el email al admin sale, responde `{ success: true }` y `main.js` redirige a
   `gracias.html`, que dispara el evento de **conversión** en GA4.

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) publica por FTP a cPanel en cada
push a `main`. El cache se controla con `.htaccess` + querystrings de versión
(`?v=N`) en los `<link>`/`<script>`: al cambiar un CSS/JS hay que **subir el
número de versión** en `index.html` (y `gracias.html`) para invalidar la caché.

## Reglas para no romper la simplicidad

- **No agregues un framework ni un bundler** salvo que haya una razón de negocio
  fuerte y medible. El sitio carga rápido justamente porque es plano.
- **Cambios de diseño global → `tokens.css`.** No hardcodees colores en componentes.
- **Estados → clases `is-*` desde JS.** No mezcles lógica de estilo en el JS más
  allá de togglear clases.
- **Animación: poca y en CSS.** Fades cortos, hovers de ~220 ms, nada que
  secuestre el scroll. Siempre detrás de `prefers-reduced-motion`.
- **Fotos de obra propias, nunca stock.** Ver `docs/REDISENO-2026.md`.
- **`tools/build-landings.mjs` está desactualizado** respecto del HTML
  publicado: no regenerar las landings sin antes sincronizarlo.
- **Al tocar CSS/JS, subí el `?v=`** correspondiente.
