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
                                                         • Formulario → WA o mail
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

4. **Diseñá tu proyecto (`/disena-tu-abertura/`)** — la única herramienta
   para clientes: `proyecto.js` + `proyecto.css`, a pantalla completa (sin el
   menú del sitio). Vista **3D** del lugar hecha con CSS (cada cara es un
   elemento con `matrix3d`, sin librerías): pared principal, paredes de los
   costados (opcionales, con su largo), techo de policarbonato apoyado en la
   pared principal (con columnas en el frente) y piso. Las aberturas son los
   dibujos realistas de `aberturas.js`, así que se ven igual que en el PDF.
   Se gira arrastrando el fondo, se acerca con la rueda o pellizcando, se
   toca una abertura para editarla y se la arrastra sobre su pared (el punto
   de la pantalla se lleva al plano de la pared resolviendo la proyección).
   Una pared vista de atrás se vuelve transparente para no tapar.
   Interfaz: el 3D a pantalla completa, una barra abajo que cambia según lo
   elegido (nada, abertura, pared o techo) y una hoja con un solo control
   (abajo en el celular, a la derecha en la compu). "+ Pared" y "+ Techo"
   flotan anclados al 3D; tocar una pared la elige y "+ Abertura" la pone
   donde se tocó; una abertura se puede arrastrar a otra pared. Arriba:
   deshacer, empezar de nuevo, WhatsApp y "Enviar"; arriba a la izquierda,
   3D / Plano (las láminas A4 tal cual salen en el PDF).
   El modelo es el mismo del plano (`alumfer-plano-v1`): cada pared es una
   lámina de fachada con `lado` (`principal`, `izquierda`, `derecha`) y el
   techo es una lámina de techo rectangular contra la pared principal. La
   lista del diseñador anterior (`alumfer-boceto-v1`) se pasa sola a la
   pared principal la primera vez. `?nuevo=techo` abre con techo.
   No muestra precios.

5. **Probar en una foto** (desde una abertura del proyecto) — `pared.js` +
   `pared.css`. El cliente saca o elige una foto; se procesa sólo en su
   navegador (no se sube a ningún servidor). La abertura se pone encima con
   una homografía de 4 puntos: `matrix3d` para la vista en vivo y homografía
   inversa por píxel en `<canvas>` para el JPG final, que lleva la marca
   "vista ilustrativa". Gestos: arrastrar, pellizcar (escala + giro),
   esquinas que **agrandan o achican en escala desde la esquina opuesta**
   (la abertura nunca se deforma), rueda/Shift+rueda, flechas y +/−; el
   botón atrás del celular cierra el editor. "Usar en mi proyecto" pasa el
   tipo, color y vidrio a la abertura elegida (evento `pared:agregar`).

6. **Motor del plano y editor CAD (`plano.js`)** — `plano.js` es el motor
   de la herramienta: láminas técnicas, PDF, link y envío. Con `#cad` en la
   página (`/plano/`, `plano.css`) además arma el editor CAD completo, que
   queda **sólo para el taller**: `/plano/` redirige a `/disena-tu-abertura/`
   salvo con el código de taller guardado en ese navegador o `?taller` en la
   URL (`noindex`, fuera del sitemap). Sin `#cad` expone el motor como
   `window.PlanoMotor` para `proyecto.js`. Editor tipo CAD con láminas:
   - *Fachada*: pared con aberturas (mismas tipologías de `aberturas.js`),
     cotas automáticas en cadena (horizontal y de niveles), nivel ±0,00 NPT,
     marcas V1/P1 (iguales = misma marca) y planilla de carpinterías.
   - *Techo*: planta poligonal (rectángulo, en L o vértices libres), lado
     contra la pared, columnas, pendiente calculada con las dos alturas,
     superficie, línea y **corte A-A**.
   Un solo motor genera primitivas en cm (líneas, polígonos, textos con
   alto en mm de papel) y tres salidas: pantalla (espacio modelo con grilla,
   pinzamientos, imán de 5 cm, ORTO, REFENT, línea de comandos), **lámina
   A4** con rótulo y escala normalizada elegida sola (1:20 … 1:500) para
   PDF (impresión) y PNG, y **DXF R12** por capas `ALF-*` en Windows-1252.
   El plano se guarda en `localStorage` (`alumfer-plano-v1`) y viaja entero
   comprimido en el link (`/disena-tu-abertura/#p=…`), que es lo que se manda por
   WhatsApp o por `enviar.php` (Tipo "Plano desde el sitio web").
   `?nuevo=techo|fachada` abre directo; `&boceto=1` trae la lista del
   diseñador. No muestra precios.
   Dos niveles sobre el mismo plano (`alumfer-plano-nivel`): **Simple**
   (por defecto: lienzo claro, panel paso a paso con −/+, formas de techo
   paramétricas rectángulo/L, "Repartir parejo", sin comandos ni vértices) y
   **Avanzado** (la interfaz CAD completa). Cambiar de nivel no toca el plano.
   **Vista realista** (sólo en pantalla, `alumfer-plano-vista`): las
   aberturas se dibujan con `Aberturas.dibujar` en modo `foto` (color,
   vidrio, mosquitero; en caché por medida), sobre la pared con su color
   (`paredColor`) y cielo o interior detrás del vidrio según la vista; el
   techo muestra el policarbonato y los perfiles en el color elegido. La
   hoja (PDF/PNG) y el DXF siguen siendo técnicos.
   **Catálogo completo** (`aberturas.js`): 23 tipologías con los mismos ids
   y nombres de la app de presupuestos (ventanas, puertas, cerramientos,
   baranda, portones, bajo mesada, mosquiteros, postigón, reja), líneas
   (`LINEAS`), límites por tipo (`limites`) y accesorios por abertura
   (mosquitero, reja, postigón). `Aberturas.real(item, { t })` dibuja la
   versión realista con la apertura en `t` (0 cerrada → 1 abierta): la usan
   la vista realista y la simulación "Ver cómo abren" del plano, y
   "Probalo en tu pared" (que ahora deforma la textura con homografía
   inversa por píxel, sin costuras).
   **Protección**: los clientes no descargan nada desde la página. El PDF
   (cada lámina en versión técnica y en versión ilustrativa en color) lo
   arma el navegador (`pdfPlano`: JPEG por hoja dentro de un PDF propio,
   sin librerías) y `enviar.php` lo manda adjunto al email del cliente y a
   Alumfer (sólo PDF, ≤ 8 MB, máximo 6 planos por hora por IP). Por
   WhatsApp se envía el resumen con el link del plano. La pantalla y las
   hojas llevan marca de agua; la hoja, además, nombre, teléfono y fecha de
   quien la pidió.
   El DXF y las hojas sin marca son sólo para el taller: `?taller` en la URL
   o el comando `TALLER` piden el código, que se valida contra su SHA-256
   (`HUELLA_TALLER` en `plano.js`; el código no está en el repositorio).
   Para cambiarlo: calcular el SHA-256 del nuevo código en mayúsculas y
   reemplazar la constante en `plano.js` y en la redirección de
   `plano/index.html`. Una captura de pantalla no se puede impedir
   desde una página web; por eso la marca de agua está también en pantalla.

Paleta: papel claro cálido, azul marino para secciones oscuras, azul de marca
(`#1B6CC8`) en botones, banda de proceso y acentos. Motivo gráfico: grilla y
cotas de plano. Las fotos de obra se presentan como copias impresas numeradas.

Mobile (la mayoría de las visitas) tiene diseño propio: dock flotante
Llamar/WhatsApp, menú a pantalla completa, carruseles deslizables y el
configurador con la ventana fija arriba mientras se eligen opciones.

## Formulario (WhatsApp o email)

El formulario tiene dos botones y el cliente elige el canal. `site.js`
intercepta el `submit` y mira qué botón se usó (`data-channel`):

- **WhatsApp:** arma un mensaje con los campos completados y abre
  `https://wa.me/5491163368643?text=…` en otra pestaña (si el navegador la
  bloquea, en la misma). No manda email, para no duplicar la consulta.
- **Email:** hace `fetch` POST a `enviar.php`, que:
  - Rechaza todo lo que no sea POST.
  - Sanea y valida los campos (`Nombre`, `Teléfono`, `Email` válido y `Consulta` obligatorios;
    `Tipo` pasa a "Otros" si no viene).
  - Arma dos emails HTML con `email-template.php`: uno al administrador y la
    confirmación de marca al cliente (`em_cliente`, con N° de consulta).
  - Si es un plano desde `/plano/` (campo `Plano`), adjunta el PDF a los dos
    emails (sólo PDF, tamaño acotado, máximo 6 por hora por IP).
  - Envía con `mail()` codificando el cuerpo en base64.

En los dos casos hay un **honeypot** (`botcheck`) y la página termina en
`gracias.html`, que dispara el evento de **conversión** en GA4 (el plano se
queda en su página y muestra el aviso de enviado).

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
