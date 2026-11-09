# Handoff — App de presupuestos de Alumfer

Para retomar el trabajo sin tener que reconstruir el contexto: qué hay hecho, qué
se decidió y por qué, qué falta, y con qué trampas ya chocamos.

Estado al 9 de noviembre de 2026 (segunda sesión del día); todo lo descrito está publicado y andando.
**Si trabajás sobre la app, actualizá este archivo antes de cerrar.**

---

## 1. Qué es

App interna para presupuestar aberturas de aluminio, en `apps/presupuestos/` del
monorepo `pabloxesteban/Alumfer`. **La usa el papá de Pablo, desde el celular, en
obra.** No está familiarizado con la tecnología: esa es la restricción de diseño
que manda sobre todo lo demás.

**Link:** <https://pabloxesteban.github.io/Alumfer/apps/presupuestos/>
(GitHub Pages, sirve lo que haya en `main`. No usa el hosting del sitio.)

Se instala en la pantalla de inicio (PWA), funciona sin internet, y cada teléfono
guarda sus propios datos en `localStorage` — no hay servidor ni sincronización.

---

## 2. Estado del repositorio

- `main` incluye **todo** lo de presupuestos más trabajo del sitio hecho en otras
  sesiones (PRs #39 a #48).
- Rama de la última sesión: `claude/intelligent-maxwell-d43hn3`, igual a `main`.
- Versión publicada: **2026-11-09.3** (.1: PDF real, compartir, clientes, Tu empresa · .2: rediseño suave y palabras claras · .3: hojas como pregunta y una abertura abierta a la vez · .4: vidrio en dos pasos, formas especiales y ¿Dónde va? · .5: catálogo completo del sitio · .6: obras grandes al estilo OP 2.1, rejas de hierro).

**Flujo de publicación (Pablo lo autorizó explícitamente, no hay que preguntar
cada vez):** commit en la rama → `git checkout main && git merge --ff-only <rama>`
→ `git push origin main`. Pages publica en ~1 minuto.

---

## 3. Archivos

```
apps/presupuestos/
├── index.html            Las tres vistas: Presupuesto, Anteriores, Precios
├── estilos.css           Pantalla (todo grande; fichas apiladas en celular)
├── impresion.css         Hoja A4 del presupuesto impreso
├── tokens.css            Copia de shared/design-system/tokens.css
├── sw.js                 Offline + aviso de versión nueva  ← subir VERSION
├── manifest.webmanifest  Instalación como app
├── logo-alumfer.jpg      Membrete (NO usar solologo.png: es blanco sobre transparente)
├── icono-*.png
└── js/
    ├── formato.js        Moneda, fechas, teléfonos, parseo de números es-AR
    ├── iconos.js         24 pictogramas de aberturas + íconos de interfaz
    ├── dolar.js          Blue: dolarapi.com, con bluelytics de respaldo
    ├── precios-base.js   Lista de fábrica (semilla) + datos de la empresa
    ├── calculo.js        Motor de cálculo puro, sin DOM (se puede probar en Node)
    ├── almacenamiento.js localStorage, numeración anual, export/import
    ├── documento.js      Hoja imprimible, condiciones, textos de WhatsApp y email
    ├── pdf.js            PDF A4 real (jsPDF), con dibujos, varias páginas
    ├── vendor/jspdf.umd.min.js   jsPDF 4.2.1 (MIT), copiado tal cual: sin CDN
    └── app.js            Interfaz
```

Documentación completa en `apps/presupuestos/README.md`.

---

## 4. Decisiones tomadas (no deshacer sin preguntar)

1. **Sin framework ni build step**, igual que el sitio. Scripts clásicos, sin
   módulos ES, para que también funcione abriendo el archivo con doble clic.
2. **Interfaz en tres pasos** (para quién es → qué lleva → cómo se entrega), una
   sola columna, texto y botones grandes.
3. **El tipo de abertura se elige por dibujo**, no por lista desplegable.
4. **Medidas en centímetros** en pantalla; se guardan en milímetros y se imprimen
   en metros (1,50 × 1,10 m).
5. **Cálculo:** `($/m² tipología × factor línea × (1 + recargo color) + $/m²
   vidrio) × m² facturables + adicionales`, con mínimo facturable por tipología y
   redondeo configurable del ítem.
6. **Cada presupuesto guarda una copia de la lista de precios** con la que se
   calculó: reabrir uno viejo muestra lo que se le pasó al cliente. El selector de
   tipos, en cambio, ofrece el catálogo de hoy, y si se elige una tipología que la
   copia no tiene, se copia con su precio actual.
7. **Todo se guarda solo**, sin botón de guardar, con un cartel verde "Guardado ✓".
8. **Dólar blue** (no oficial) en Precios; el total muestra el equivalente en USD
   **solo en pantalla**: no sale en el PDF ni en el WhatsApp del cliente.
9. **El kilo de aluminio se carga a mano**: no hay API gratis y con CORS que lo
   dé, y el precio local del extruido lo pasa el proveedor.
10. **Las actualizaciones se avisan**: el service worker no hace `skipWaiting`;
    aparece una franja azul "Hay una versión nueva" y recién al tocarla se recarga.
11. **El PDF se arma en el teléfono con jsPDF** (archivo dentro de `js/vendor/`,
    sin CDN para que ande sin señal). Texto vectorial con Helvetica estándar:
    solo admite caracteres WinAnsi, por eso `PDF.limpiar()`. Los dibujos de
    aberturas se pasan de SVG a PNG con un canvas.
12. **Compartir:** `wa.me` solo lleva texto, no adjunta. "Enviar por WhatsApp"
    abre la lista para compartir del teléfono (`navigator.share` con el PDF) y
    la persona elige WhatsApp y el contacto. Donde no hay `share` con archivos
    (computadora, Firefox), abre `wa.me` con el resumen y descarga el PDF.
    "Mandar solo el mensaje…" (plegado) va directo al número del cliente: sirve
    si no está agendado. En iPhone, "Descargar PDF" también usa la lista para
    compartir ("Guardar en Archivos"), porque la descarga directa en la app
    instalada abre un visor del que cuesta volver.
13. **Si el navegador bloquea `share`** porque armar el PDF tardó y se perdió el
    toque (`NotAllowedError`), aparece la ventanita "El PDF está listo" con un
    botón: el segundo toque comparte al instante. El PDF se cachea mientras el
    presupuesto no cambie.
14. **Compartir marca el presupuesto como "Enviado"** (solo si estaba en
    preparación). Consecuencia: al reabrir la app arranca uno nuevo; el enviado
    está en Anteriores.
15. **Clientes sin lista aparte:** salen de los presupuestos guardados
    (`Almacenamiento.clientes()`, mismo nombre + teléfono = misma persona). Al
    escribir el nombre aparecen hasta 4 coincidencias; tocar una completa todos
    los datos. Se excluye el presupuesto abierto (se autoguarda mientras se tipea).
16. **Tu empresa** (pestaña Precios): datos y logo vigentes se usan en todos los
    PDF, también en presupuestos viejos; precios y condiciones siguen siendo los
    guardados con cada presupuesto. El logo va en su propia clave
    (`alumfer.logo.v1`), achicado a 600 px, para no copiarse en cada presupuesto;
    entra en la copia de seguridad. Editar la empresa no marca precios como viejos.
    "Volver a los valores originales" de precios conserva los datos de la empresa.
17. **Pablo pidió una interfaz menos "cuadrada", sin palabras en inglés ni
    técnicas** (el papá tiene más de 60 y no está familiarizado con la tecnología):
    - Nombres: "Float" → "Simple" (sale "vidrio Simple 4 mm"), "DVH 4/9/4" →
      "Doble vidrio (DVH)", "Laminado 3+3 (seguridad)" → "De seguridad 3+3",
      "Bronce (anolok)" → "Bronce", ayudas en palabras comunes. "A30 New" se dejó:
      es el nombre comercial de la línea.
    - `Almacenamiento.actualizarNombres()` renombra lo ya guardado en el teléfono
      y en las copias de precios de los presupuestos, **solo si el nombre sigue
      siendo el de fábrica** (si lo cambiaron a mano, se respeta). No toca precios.
    - Línea, vidrio y color ya no son `<select>` (cortaban el texto en el celular):
      son botones grandes con lo elegido + "Cambiar", que abren una lista de
      opciones grandes con "Elegida" marcada. Los colores llevan muestra.
    - Cantidad con botones − y + (no baja de 1); "cm" adentro del campo de medida.
    - Textos: una frase de guía bajo cada paso, "Agregar una / otra abertura",
      "Cambiar tipo", "Otra igual", "Quitar", "Es chica: se cobra el mínimo de
      X m²", paso 3 "Mandar el presupuesto" oculto hasta que haya aberturas.
    - Estilo: letra base 18 px y `--text-sm` ≈ 16 px, tarjetas con sombra suave y
      esquinas de 20 px, controles de 14 px, agregados con tilde grande,
      desplegables con flecha. En celular las pestañas llevan el ícono arriba del
      nombre. `scroll-padding` para que el teclado no deje un campo tapado por
      las barras fijas. Los tokens del sistema de diseño no se tocaron: los
      valores propios están en `:root` de `estilos.css`.
18. **Hojas como pregunta, no como tipo distinto.** `FAMILIAS` en `app.js` agrupa
    tipologías que son el mismo modelo: ventana corrediza (2/3/4 hojas), de
    abrir (1/2), puerta de abrir (1/2), puerta balcón corrediza (2/3),
    mosquitero (corredizo/fijo), portón (corredizo/levadizo). El selector
    muestra cada modelo una vez (17 dibujos en vez de 24) con "2, 3 o 4 hojas"
    abajo, y la ficha pregunta "¿Cuántas hojas?" con botones con dibujo. La
    primera variante es la de por defecto. **Los precios siguen siendo por
    tipología exacta**: el motor y la lista no cambiaron; el PDF dice el nombre
    completo ("Ventana corrediza 3 hojas"). Una tipología nueva agregada en
    Precios aparece sola, sin familia. Si se agregan variantes con ids nuevos,
    sumarlas a `FAMILIAS`.
19. **Una sola abertura abierta a la vez** (`itemAbierto`, no se guarda). Las
    demás se ven como un renglón (dibujo, nombre, medidas, "N iguales",
    detalle, precio, "Cambiar") que se toca para abrirla. La abierta termina
    con un botón grande "Listo". Al agregar o duplicar, queda abierta la nueva;
    al abrir un presupuesto, todas resumidas. `refrescarCalculos()` saltea las
    resumidas. Ancho y alto llevan flechas ↔ ↕.
20. **Vidrio en dos pasos** (`VIDRIOS_FAMILIAS` en `app.js`): tipo con dibujo
    (Simple, Esmerilado, Espejado, De seguridad, Doble vidrio, Policarbonato) y,
    si tiene variantes, "¿Qué espesor?" (3/4/5/6 mm, 3+3/4+4, Común/De
    seguridad). Al tocar Simple se elige 4 mm. Un vidrio agregado a mano en
    Precios aparece como un tipo más. Un vidrio de fábrica renombrado sigue
    dentro de su tipo (el PDF usa su nombre real). Línea y color siguen con la
    lista de opciones.
21. **Formas especiales** (`item.forma`: rect, inclinada, triangulo, arco,
    redonda; `item.alto2` = lado bajo de la inclinada). Solo en
    `TIPOS_CON_FORMA` (paño fijo, banderola, ventana de abrir 1 hoja,
    cerramiento, mosquitero fijo, reja). Las medidas que se piden cambian según
    la forma; redonda = solo diámetro. **Cobro (pendiente de validar con el
    papá):** el rectángulo que la contiene + `precios.formas[].recargo` sobre
    aluminio y vidrio, que arranca en 0 % (Precios → Formas especiales). Así no
    se inventó ninguna regla: con 0 % cuesta lo mismo que hoy. El PDF dibuja la
    forma y escribe "1,50 × 1,10 / 0,80 m" o "Ø 0,80 m" (`Formato.medidasItem`).
22. **¿Dónde va?** (`item.lugar`, opcional): botones Cocina, Baño, Dormitorio,
    Living, Quincho, Frente, más los lugares ya usados y un campo para escribir
    otro. El PDF agrupa por lugar, en el orden en que aparecen, con título y
    subtotal; la hoja impresa y el WhatsApp ponen el lugar delante. Así se
    presupuesta un quincho: cada pieza (corrediza, paño fijo triangular del
    frontis…) como una abertura marcada "Quincho".
23. Solo la abertura recién agregada se anima (`itemQueEntra`): si la animación
    estuviera en `.item`, cada toque (espesor, forma) redibujaría la ficha y
    parpadearía.
24. **Catálogo = lo que Alumfer ofrece en el sitio** (`apps/website/index.html`,
    `aberturas.js`, páginas de producto). Pablo pidió que esté todo y que no
    haya nada que no sea aluminio y vidrio:
    - Líneas: Herrero, Rotonda 640, Módena 1, **Módena 2** (nueva), A30 New.
    - Colores (16, de `aberturas.js` + marrón de postigones): Pintado (blanco
      —el estándar, va primero—, negro, bronce colonial, gris, marrón, símil
      madera, microtexturado, azul, verde, rojo, amarillo) y Anodizado
      (natural, oro, negro, champagne, peltre). La lista se muestra agrupada.
    - Vidrios: Simple 3–6 mm, Esmerilado, Espejado, **Laminado** 3+3 / 4+4 (antes
      "De seguridad"), DVH 4/9/4, 4/12/6 y con laminado, **Poliestireno
      Fantasía** (15 diseños, se eligen viendo la textura: `texturas/*.webp`,
      copiadas del sitio), **Policarbonato alveolar** 4/6/8/10 mm y
      **compacto**. El policarbonato pregunta además el color de la placa
      (Transparente / Opal / Bronce, `item.tono`), que no cambia el precio.
    - Agregados: "Premarco de aluminio" (cubre el marco viejo de chapa; antes
      decía "de chapa"). **Se quitaron** refuerzo de hierro, cierrapuertas
      hidráulico y zócalo inyectado. La reja es **una sola casilla "Reja"** que
      al marcarla pregunta el tipo (`familia: 'reja'` en adicionales).
    - Tipos nuevos en Complementos: **Cortina de enrollar PVC** con o sin cajón
      (para presupuestar cortinas solas) y **Reja de aluminio** tipo 1 / tipo 2.
      `sinLinea` (mosquiteros, postigón, rejas, cortinas) no pide línea ni
      aplica su factor; `sinColor` (cortinas PVC) no pide color ni recarga.
    - **Rejas: de hierro redondo y cuadrado** (lo único de hierro que hace
      Alumfer; el sitio ya lo decía bien). `sinLinea` y `sinColor`: no llevan
      línea ni color de aluminio. Los botones toman el nombre de la lista
      (`etiquetasDe` / `distintivos`): "Redondo" / "Cuadrado".
    - Todos los precios nuevos son de referencia, como el resto.
25. **Migración del catálogo** (`Almacenamiento.actualizarCatalogo`, una vez por
    `catalogo` de `precios-base.js`, hoy 2): en la lista guardada del teléfono
    quita lo que se dejó de hacer, suma lo nuevo con precio de referencia (al
    final de su grupo) y agrega Módena 2 donde estaba Módena 1. Lo ya guardado
    conserva sus precios; lo que el usuario borre después no vuelve. Los
    presupuestos viejos solo reciben los renombres (`actualizarNombres`), nunca
    altas ni bajas, para que sus totales no cambien. **Si se vuelve a cambiar
    el catálogo, subir `catalogo`.**
26. **Obras con muchas aberturas, basado en OP 2.1** (el software de cómputo de
    Aluar/Megevand Soft que Pablo tomó como referencia; manual público:
    megevandsoft.com/documentos/ManualUsuarioOP2.1.pdf). Se tomó lo que sirve
    a alguien no técnico, sin su complejidad (acoples, cortes, optimización):
    - **Código por abertura** como el "Título" de OP: `Calculo.codigos()` →
      V (ventanas), PF (paño fijo), P (puertas), PB (puerta balcón), CE, B, T,
      PO, BM, M (mosquitero), PT (postigón), R (reja), C (cortina). Se numera
      por tipo en el orden de carga y no se guarda (se recalcula). Sale en la
      ficha, los renglones, el PDF (columna "Ítem"), la hoja impresa y el WhatsApp.
    - **Ubicación** (ya estaba como ¿Dónde va?) ahora también agrupa la
      **pantalla**: título por lugar con cantidad y subtotal (`nodosAgrupados`),
      igual que el PDF.
    - **"Aplicar a todos los productos"** de OP: en la lista de línea y de color,
      la casilla "Cambiarlo también en las otras N aberturas"; en el vidrio, el
      botón "Poner este vidrio en las otras N". Solo a las que llevan ese dato
      (`aplicables`): una reja no recibe color, una cortina no recibe vidrio,
      una línea no se pone donde la tipología no la admite.
    - **Medidas "de afuera a afuera" del marco**, como dice OP, aclarado bajo las
      medidas. Cada tipo arranca con su medida típica (`MEDIDA_INICIAL`, las del
      diseñador del sitio: puerta 90 × 205, etc.) o con la de otra abertura igual
      ya cargada en la obra.
    - No se copió el "grupo de productos" acoplado (PF1a, PF1b…, precio global):
      necesita perfiles de acople y su precio. Si hiciera falta, el lugar ya
      agrupa y suma.
27. Los efectos `:hover` de lo que se toca van dentro de `@media (hover: hover)`:
    en pantallas táctiles el hover queda pegado después del toque.

---

## 5. Reglas duras

- **Subir `VERSION` en `sw.js` en cada cambio de la app.** Si no, los celulares
  instalados no se enteran. Lo controla
  `.github/workflows/presupuestos-version.yml`, que falla si se cambió algún
  archivo sin tocar `VERSION`.
- **Los precios de `precios-base.js` son de referencia, inventados.** Los reales
  se cargan desde la app y viven en el navegador. **Nunca commitear precios
  reales**: el repositorio es público.
- Responder siempre en castellano rioplatense.

---

## 6. Pendientes

0. **Probar en los teléfonos reales** (Android del papá y un iPhone): compartir
   el PDF a WhatsApp y a Gmail, y "Descargar PDF" en iPhone. En la sesión se
   probó en Chromium con `navigator.share` simulado; la lista para compartir de
   verdad no se puede abrir en un navegador de prueba.
1. **Colores de las cortinas de PVC**: el sitio dice "blanco y distintos
   colores", sin lista. Hoy la cortina no pide color.
1. **Validar con el papá cómo cobra las formas especiales** (¿rectángulo que
   la contiene + recargo?, ¿cuánto por arco/curvado?) y cargar los recargos en
   Precios → Formas especiales.
1. **Cargar los precios reales.** Es lo único que falta para que la app sirva de
   verdad. Hasta que Pablo entre a Precios y ponga los suyos, los totales no
   significan nada.
2. Simplificar la pestaña Precios si el papá también la va a tocar (hoy son
   tablas; en celular se ven como fichas, pero siguen siendo tablas).
3. Recalcular los $/m² a partir del kilo de aluminio + los kilos por m² de cada
   tipología, en vez de aplicar un porcentaje a ojo. Necesita que el papá pase los
   kilos por metro de cada línea.
4. Cotizador público simplificado en el sitio, con el mismo motor de cálculo.
5. Sincronizar presupuestos entre dispositivos (hoy cada teléfono es
   independiente; requiere backend).
6. Sacar la línea del total en dólares, si molesta.
7. Clave de acceso: el repositorio es público y el link lo abre cualquiera que lo
   tenga. Los precios reales no están en el código, pero si hiciera falta
   esconderla, la opción gratis es Cloudflare Pages con Access.

---

## 7. Cómo probar

No hay suite automatizada en el repo. Se probó con Playwright ad hoc (scripts en
el scratchpad, se pierden con la sesión). Lo que se verificó el 9/11:
cliente → 3 aberturas → medidas y cantidad → descuento → total de pantalla =
motor = guardado → PDF descargado → compartir por WhatsApp y email (share
simulado con `addInitScript`) → reintento con `NotAllowedError` → sugerencia de
cliente en un presupuesto nuevo → presupuesto de 22 aberturas en 3 páginas →
logo propio → computadora sin share (abre `wa.me` + descarga) → hoja impresa.
Prueba de un quincho de varias piezas (12 chequeos): códigos, lista agrupada
con subtotales, color y vidrio aplicados a todas sin tocar la reja, rejas
redondo/cuadrado, aclaración de medidas. Prueba del catálogo (26 chequeos).
Prueba de vidrios, formas y lugares (21 chequeos): tipos y espesores, precio
que cambia con el espesor, formas con sus medidas, recargo 0 % = rectángulo,
diámetro, lugares en los renglones, PDF agrupado con subtotales.
Y después del rediseño (22 chequeos, incluidas las hojas y el acordeón): renombre de nombres guardados viejos
respetando los puestos a mano, paso 3 vacío, − y +, lista de vidrios sin
"Float", cambio de vidrio recalcula, muestras de color, agregado tildado,
mínimo explicado, PDF con "vidrio Simple".

- Para mirar el PDF: `pdftotext -layout x.pdf -` y `pdftoppm -r 80 -png x.pdf p`
  (están instalados en el entorno).

```bash
cd apps/presupuestos && python3 -m http.server 8777
# Playwright: /opt/node22/lib/node_modules/playwright
#   import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
```

- El proxy del entorno rompe el TLS del navegador de prueba contra HTTPS externo.
  Para probar **lo que está publicado**, bajar los archivos con `curl` a una
  carpeta y servirlos localmente.
- Mockear el dólar con `ctx.route(/dolarapi|bluelytics/, ...)`.
- `calculo.js` se puede probar desde Node cargando, en orden: `formato` →
  `precios-base` → `calculo`, con un `global.window = {}`.

---

## 8. Trampas ya encontradas (no repetirlas)

- `[hidden]` pierde contra `display: grid` → hay una regla
  `[hidden] { display: none !important; }`.
- Un `td` con `colspan` **no** puede ser `display: flex`: deja de ocupar la fila.
  El flex va en un `div` adentro.
- `solologo.png` es el logo blanco sobre transparente: invisible sobre papel.
- `window.print()` en Chromium headless bloquea el render: para capturar la hoja,
  inyectar el HTML y usar `emulateMedia({ media: 'print' })`.
- Con dos `<details>` en el paso 3, `details:last-of-type` ya no apunta a
  "Observaciones y ajustes": buscar el `summary` por texto.
- `.item__resumen-texto b` pinta de oscuro cualquier `<b>` del renglón: el
  código (`.codigo`) necesita su color con más prioridad.
- `.espesor` (botón redondo) pisa a `.espesor--textura` si tienen la misma
  especificidad: las fichas con foto usan `.espesores .espesor--textura`.
- Una IIFE metida en una concatenación de strings tiene que devolver `''`, si
  no aparece "undefined" en la pantalla.
- GitHub a veces marca como fallidos el chequeo de `VERSION` (con 0 trabajos)
  o el despliegue de Pages sin que haya error en el código: pasó con la .2, y
  Pages siguió sirviendo la .1. Se resuelve con el push siguiente. Siempre
  verificar con `curl .../sw.js | grep VERSION` que lo publicado es lo nuevo.
- Con el acordeón, en las pruebas solo la última abertura agregada está
  abierta: tocar `.item__resumen` antes de llenar campos de otra.
- Playwright no tiene en cuenta las barras fijas al llevar un elemento a la
  vista: hacer `scrollIntoView({ block: 'center' })` antes de tocar.
- Los precios guardados reemplazan la lista entera de fábrica: si un teléfono
  tiene 3 vidrios guardados, solo existen esos 3 (no se mezclan con los de fábrica).
- jsPDF con Helvetica estándar no dibuja `−` (U+2212), espacios finos ni
  emojis: pasar todo por `PDF.limpiar()`.
- El deploy FTP del sitio (`deploy.yml`) corre en **cada** push a `main`, aunque
  solo cambie la app. Estuvo fallando con `530 Login authentication failed`
  porque el hosting estaba suspendido; hoy alumfer.com.ar responde 200, así que
  parece resuelto.
