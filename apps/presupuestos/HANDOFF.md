# Handoff — App de presupuestos de Alumfer

Para retomar el trabajo sin tener que reconstruir el contexto: qué hay hecho, qué
se decidió y por qué, qué falta, y con qué trampas ya chocamos.

Estado al 10 de noviembre de 2026 (versión `2026-11-10.19`); todo lo descrito está publicado y andando.
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

## 1 bis. Lo que se espera ahora (9/11)

**La prioridad de Pablo es que los precios sean los reales.** Va a hablar con
su papá para averiguar las fórmulas y los precios. Las preguntas que se le
pasaron para esa charla:

1. ¿Cómo calcula hoy un precio? ¿Por m² según el tipo de abertura (es lo que
   hace la app), o desde los costos (kilos de aluminio × precio del kilo +
   vidrio + herrajes + mano de obra) multiplicados por un coeficiente? **Si es
   lo segundo, el motor de `calculo.js` hay que cambiarlo.**
2. ¿Cuánto vale cada tipo de abertura (o su $/m²)? ¿Cobra un mínimo en las chicas?
3. ¿Cuánto más cara es cada línea respecto de la Herrero?
4. ¿Cuánto recarga cada color, pintado y anodizado?
5. Vidrios: ¿cuánto cobra y cuánto paga el m² de cada uno?
6. Mosquitero, premarco, tapajuntas, cortina, reja: ¿cómo los cobra (por m²,
   por metro, por unidad) y cuánto?
7. Colocación y flete: ¿porcentaje, por m² o monto fijo?
8. Formas especiales (inclinadas, triangulares, arcos, redondas): ¿cómo las cobra?
9. ¿Redondea los precios? ¿Cuánta seña pide? ¿Cuántos días vale el presupuesto?
   ¿Forma de pago y plazo de entrega?
10. ¿Factura con IVA o da precio final?
11. Para la ganancia: precio del kilo, peso por metro de cada línea, herrajes y
    mano de obra por abertura.
12. Para la lista de materiales: descuentos de fabricación de cada perfil por línea.

**Los precios reales se cargan desde la app (pestaña Precios), nunca en
`precios-base.js`: el repo es público.**

**Planilla para completar con el papá** (privada, en la cuenta de Pablo):
<https://claude.ai/artifact/3YUMhr9X1whec6JXeDTVWj>. Tiene esas preguntas y más
(cada abertura, cada color, cada vidrio con lo que cobra y lo que paga,
agregados, flete, condiciones, costos, descuentos de fabricación). Cada
respuesta se guarda sola en la base de la página. Desde la versión 2 es una
entrevista guiada (una pregunta por pantalla, 5 bloques: lo indispensable,
demás aberturas, líneas y colores, vidrios y agregados, costos y materiales).
Colección `respuestas`: un documento por campo, `{texto, actualizado}`, con
ids como `metodo.forma`, `ab.vent-corr-2.precio`, `ab.vent-corr-2.modo`,
`vidrio.simple-4.cobra` / `.paga`, `linea.modena` (%), `color.negro` (%),
`agregado.premarco.cobra`, `costo.peso.herrero`, `material.descuentos.<línea>`.
Colección `pendientes`: `{despues: true}` por pantalla que el papá «no sabe». **Cuando Pablo avise que está
completa, leerla con `ArtifactData` → `list` de `respuestas`** y, con eso,
ajustar el motor (pregunta `metodo.forma`) y armar los precios. Los importes se
cargan en la app (Precios) o con una copia de seguridad, nunca en el código.

## 2. Estado del repositorio

- `main` incluye **todo** lo de presupuestos más trabajo del sitio hecho en otras
  sesiones (PRs #39 a #48).
- Rama de la última sesión: `claude/upbeat-clarke-hfpc4w`, igual a `main`.
- Versión publicada: **2026-11-10.19**. Historia: .1 PDF real, compartir,
  clientes, Tu empresa · .2 rediseño suave y palabras claras · .3 hojas como
  pregunta · .4 vidrio en dos pasos, formas especiales, ¿Dónde va? · .5 catálogo
  del sitio · .6 obras grandes estilo OP 2.1, rejas · .7 lista de materiales,
  cortinas blancas · .8 "tiras" · .9 Guardar, Guardados, copia, seguimiento,
  resumen del mes, ganancia · .10 solo dólar blue venta · .11 otro trabajo y
  precio a mano · .12 rediseño "app profesional" (un paso por pantalla) · .13
  obligatorios, barra de avance, estados automáticos · .14 apariencia sobria ·
  .15 minimalista y Precios como menú de Ajustes · .16 velocidad (sin Google
  Fonts, jsPDF diferido), arreglo de actualizaciones, plana + transiciones ·
  .17 apariencia tendencia 2026 (vidrio flotante, resorte, efectos) ·
  .18 **rediseño «Hormigón guiado»** (ver punto 44: reemplaza toda la apariencia anterior) ·
  .19 el PDF y la hoja impresa con la misma identidad.
- **Pruebas en el repo**: `tools/presupuestos-pruebas/` (antes vivían en el
  scratchpad y se perdían). `bash tools/presupuestos-pruebas/correr.sh` corre
  las 13 (256 chequeos). Ver su README.

**Flujo de publicación (Pablo lo autorizó explícitamente, no hay que preguntar
cada vez):** commit en la rama → `git checkout main && git merge --ff-only <rama>`
→ `git push origin main`. Pages publica en ~1 minuto.

---

## 3. Archivos

```
apps/presupuestos/
├── index.html            Las tres vistas: Presupuesto, Anteriores, Precios
├── estilos.css           Pantalla: una sola hoja, valores en :root (punto 44)
├── impresion.css         Hoja A4 del presupuesto impreso
├── tokens.css            Copia de shared/design-system/tokens.css
├── sw.js                 Offline + aviso de versión nueva  ← subir VERSION
├── manifest.webmanifest  Instalación como app
├── logo-alumfer.jpg      Membrete (NO usar solologo.png: es blanco sobre transparente)
├── icono-*.png
├── fuentes/              Inter y Newsreader (.woff2, licencia OFL): la letra viene en la app
└── js/
    ├── formato.js        Moneda, fechas, teléfonos, parseo de números es-AR
    ├── iconos.js         24 pictogramas de aberturas + íconos de interfaz
    ├── dolar.js          Blue: dolarapi.com, con bluelytics de respaldo
    ├── precios-base.js   Lista de fábrica (semilla) + datos de la empresa
    ├── calculo.js        Motor de cálculo puro, sin DOM (se puede probar en Node)
    ├── materiales.js     Lista de compras aproximada (barras de 6 m, vidrios), sin DOM
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
   sola columna, texto y botones grandes. **Desde la .12, un paso por pantalla**
   (ver 35).
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
7. **Todo se guarda solo**, con un cartel verde "Guardado ✓". **Desde la .9
   además hay un botón "Guardar presupuesto"** (Pablo lo pidió: el papá
   necesita un botón y ver dónde quedó). Hace lo mismo al instante y muestra
   "Guardado como P-…, buscalo en Guardados por «nombre» o el número". La
   pestaña "Anteriores" pasó a llamarse **"Guardados"**.
8. **Dólar blue** (no oficial; Pablo insistió: todo se maneja con el blue, que
   es más caro). Se muestra **solo el blue venta** (lo que se paga por cada
   dólar); el "compra" se sacó de la pantalla porque se confundía con el
   oficial. En Precios; el total muestra el equivalente en USD
   **solo en pantalla**: no sale en el PDF ni en el WhatsApp del cliente.
9. **El kilo de aluminio se carga a mano**: no hay API gratis y con CORS que lo
   dé, y el precio local del extruido lo pasa el proveedor.
10. **Las actualizaciones**: el service worker no hace `skipWaiting` solo. Desde
    la .16, si la versión nueva queda lista antes de que se toque la pantalla
    (lo normal: llega al abrir) la app le pide `ACTUALIZAR` y se recarga sola;
    si llega con la app en uso, aparece la franja azul y espera el toque
    (ver punto 42).
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
27. **Lista de materiales para comprar** ("Para hacer las compras", tarjeta
    punteada debajo del paso 3; `js/materiales.js`, puro y probable en Node).
    Pedido de Pablo inspirado en el cómputo y la optimización lineal de OP 2.1.
    **Es solo para Alumfer: no la usan `documento.js` ni `pdf.js`, así que
    nunca llega al cliente** (lo verifica la prueba).
    - Sin la base de perfiles de OP (códigos, descuentos de fabricación), es
      **aproximada y del lado seguro**: piezas con la medida de afuera a afuera.
      Marco (puertas sin umbral, de 3 lados; formas: lados reales, arco y
      redonda como pieza curvada), hojas (ancho / hojas × alto), premarco,
      tapajuntas y hoja de mosquitero cuando se marcan.
    - Agrupa por **línea + perfil + color** (como se compran) y acomoda en
      barras de `generales.largoBarra` (6 m) dejando `corteSierra` (5 mm) por
      corte: el más largo primero, en la primera barra donde entre. Muestra
      barras, metros usados, sobrante y retazos (desde 30 cm; los más chicos se
      cuentan como "recortes chicos"). Piezas más largas que la barra: empalme.
    - Vidrios: un paño por hoja con su medida (cm), agrupados por tipo, y m².
      Formas: el rectángulo que las contiene, marcado "corte especial".
    - Rejas de hierro y cortinas de PVC: en m² (no son barras de aluminio).
    - **Kilos**: solo si en Precios → Líneas se carga "Peso (kg por metro)"
      (`kgMetro`); se calculan sobre las barras compradas. Con el precio del
      kilo cargado arriba en Precios, muestra el costo aproximado en pesos.
    - Largo de barra, corte y peso por metro se toman **de los datos de hoy**,
      aunque el presupuesto sea viejo (no son precios).
    - La lista se puede mandar por WhatsApp sin número (WhatsApp pregunta a
      quién: el proveedor o uno mismo) o copiar.
    - **En Alumfer se dicen "tiras" de aluminio, no "barras"**: todo lo que se
      ve dice "tiras"; en el código las variables siguen como `barras`/`largoBarra`.
    - **Descuentos de fabricación por línea: pendientes.** Pablo va a consultar
      los precisos de cada línea; cuando estén, restarlos en `piezasItem()`.
28. **Cortinas de PVC: solo blancas** (`colorFijo: 'blanca'` en las tipologías
    y en el agregado): no piden color y el presupuesto dice "blanca".
29. **Copia de seguridad** (todo vive en un teléfono): botón "Guardar una
    copia ahora" en Guardados y franja marrón arriba cuando hay 3 o más
    presupuestos, pasaron 7 días desde la última copia y hubo cambios ("Más
    tarde" la pospone 2 días). La copia es el mismo `.json` de siempre, pero se
    manda con la lista para compartir (WhatsApp a Pablo, Drive, email); sin
    esa opción, se descarga. Fecha y huella de la última copia en
    `alumfer.copia.v1`. Al arrancar se pide `navigator.storage.persist()` para
    que el navegador no borre los datos solo. "Recuperar una copia" acepta
    también archivos que WhatsApp entrega sin tipo.
30. **Seguimiento: "Para volver a llamar"** (arriba en Guardados, con punto
    naranja en la pestaña): presupuestos en estado Enviado cuya fecha de envío
    (`enviadoEl`, se anota al compartir) o último seguimiento
    (`ultimoSeguimiento`) tiene `generales.diasSeguimiento` días o más (3,
    configurable en Precios → Costos y ganancia). Botones: "Preguntarle por WhatsApp"
    (mensaje armado al número del cliente; anota el seguimiento), "Aceptó",
    "No aceptó", "Más tarde" (`llamarDesde` = +2 días). Muestra la fecha de
    vencimiento y avisa si ya venció. Si el presupuesto está abierto en la
    pantalla principal, los cambios se copian a `actual` para que el guardado
    automático no los pise.
31. **Ganancia aproximada (solo para Alumfer)**: `Materiales.ganancia()` =
    total sin IVA − (kilos de las tiras a comprar × precio del kilo en pesos +
    m² de vidrio × lo que se paga el m² + lo que se compra hecho × costo/m² +
    herrajes y mano de obra por abertura). No inventa costos: los que faltan
    cuentan 0 y se listan en `faltan`. **Sin ningún costo cargado no muestra
    número** (sería igual a lo cobrado), pide cargarlos. Se ve en la tarjeta
    "Ganancia y compras" y con el detalle en la pantalla de materiales. Los
    costos son columnas nuevas en Precios (Vidrios: "Lo que pagás $/m²";
    Aberturas: "Costo $/m² (si lo comprás hecho)"; Adicionales: "Lo que te
    cuesta") y la tarjeta "Costos" (herrajes y mano de obra por abertura).
    Costos, peso por metro y precio del kilo **no** suben `revision` (no son
    precios de venta) y se toman de los datos de hoy aunque el presupuesto sea
    viejo (`preciosCompras`). Ni el PDF ni el WhatsApp del cliente la incluyen
    (lo verifica la prueba).
32. **Resumen del mes** (arriba en Guardados, "solo para vos"): cuántos
    presupuestos y por cuánto, cuántos aceptados y por cuánto, % de aceptación
    sobre los que contestaron y ganancia aproximada de los aceptados.
33. **"Otro trabajo"** (`tipologiaId: 'libre'`, grupo "Otros" al final del
    selector): lo que no está en el catálogo (reparación, vidrio suelto,
    retiro de aberturas viejas, andamio). Campos `descripcionLibre`,
    `modoLibre` ('unidad' | 'm2', con medidas si es por m²), `precioLibre`,
    `cantidad`, `costoLibre` (opcional, para la ganancia), lugar y nota.
    `Calculo.calcularLibre()`: sin línea, color, vidrio ni redondeo. Código
    **O1, O2…**; en el PDF va con su descripción y "—" en medidas si es por
    unidad. No entra en la lista de materiales, no suma herrajes ni mano de
    obra en la ganancia, y "cambiarlo en las otras aberturas" lo saltea.
34. **Precio a mano por abertura** (`item.precioManual`, en el desplegable
    "Precio a mano, descuento o nota"): si es mayor que 0 reemplaza al unitario
    calculado (que queda en `unitarioCalculado`). En la app se ve "Precio
    puesto a mano · el calculado era $ X" y el renglón dice "Precio a mano";
    **en el PDF y el WhatsApp del cliente solo sale el precio**. Actualizar el
    presupuesto a precios de hoy no lo pisa.
35. **Rediseño "app profesional" (.12)**, pedido por Pablo y basado en una
    investigación (9/11) de Apple HIG (tab bars), Android/Material 3 y M3
    Expressive (botones grandes, contención), NN/g (íconos con texto, adultos
    mayores, wizards, bottom sheets, modo claro), GOV.UK (preguntas por página,
    "Continuar") y WCAG 2.2 (24/44 px, contraste 3:1 en controles):
    - **Encabezado claro** (logo, título de la pantalla, subtítulo con número y
      cliente; botón "+ Nuevo") y **pestañas abajo** con ícono y palabra
      (`nav.barra__tabs`, fuera del header; mismas clases `.tab[data-vista]`).
    - **Un paso por pantalla**: `#pasos` (1 Cliente · 2 Aberturas · 3 Enviar,
      tocables para ir a cualquiera) y `irPaso(n)`. Las secciones llevan
      `data-paso-seccion` y se ocultan **por CSS** según
      `#vista-presupuesto[data-paso]` (no con `hidden`: la tarjeta interna ya
      lo usa). "Continuar" no deja pasar del 2 al 3 sin aberturas. Abrir uno
      guardado va al paso 2; Nuevo, al 1.
    - **Barra de abajo** encima de las pestañas, solo en Presupuesto: paso 1
      "Continuar"; paso 2 total + "Continuar"; paso 3 total + WhatsApp (una sola
      acción: en 360 px no entraban tres; PDF queda en la pantalla).
    - Las dos barras se ocultan **con el teclado abierto**, detectado por
      `visualViewport` (no por foco: en Android, al cerrar el teclado el campo
      sigue enfocado y "Continuar" quedaba oculto).
    - Estilo: capa "APARIENCIA 2026" al final de `estilos.css`. Fondo claro,
      tarjetas blancas con **borde** (al sol las sombras se pierden), un acento
      azul `#1557a5` (~7:1), texto secundario oscuro, contornos de controles
      ≥ 3:1, **Inter** (se probó Atkinson Hyperlegible Next, pero tacha el cero
      y se confundía con el "Ø" de diámetro), controles ≥ 44 px y principales
      56–58 px, avisos que duran 3,8 s (6 s los errores).
36. Los efectos `:hover` de lo que se toca van dentro de `@media (hover: hover)`:
    en pantallas táctiles el hover queda pegado después del toque.
37. **Campos obligatorios (.13)**, pedido de Pablo "que no se olvide ningún
    detalle". No se puede pasar de paso (ni con "Continuar" ni tocando el
    indicador, `irPasoPedido`) ni guardar/mandar (`listoParaEntregar`) si falta:
    - Paso 1: **nombre** y **teléfono** (al menos 8 números: hace falta para
      WhatsApp). Llevan la etiqueta "obligatorio". Localidad, dirección, email
      y fecha **no** son obligatorios (si se quieren, es agregar una línea en
      `erroresCliente()`).
    - Paso 2: al menos una abertura y, en cada una, **ancho y alto ≥ 10 cm**
      (alto 2 en las inclinadas; las redondas solo diámetro). En "Otro
      trabajo": **descripción y precio** (y medidas si se cobra por m²).
    Cómo se avisa: borde rojo + mensaje con "!" debajo del campo, aviso rojo
    arriba de la barra, la app lleva al paso y abre la abertura que falta y
    pone el foco ahí. El error se borra apenas se escribe. Las aberturas
    nuevas arrancan con medida típica, así que el bloqueo aparece si las
    borra o pone algo absurdo.
38. **Barra de avance (.13)** debajo del indicador de pasos (`#avance-pres`,
    `pintarAvance()`): 6 hitos — nombre, teléfono, una abertura, todas
    completas, guardado (tiene número), enviado (estado ≠ borrador). Dice
    "Vas 67 % · Falta: …" con lo próximo que falta; al 100 % se pone verde:
    "¡Listo! Presupuesto enviado.". Se repinta en `renderTotales`.
39. **Estados automáticos (.13)**: el papá no se iba a acordar de cambiarlos.
    El selector `#pre-estado` sigue en el HTML (lo usa el código y la copia)
    pero está oculto. Mandar por WhatsApp/email/PDF lo marca Enviado (ya era
    así, con `enviadoEl`). En Guardados se muestra `estadoVisible(p)`: "Sin
    enviar", "Enviado hoy / ayer / hace N días", "Venció sin respuesta"
    (pasó `validezDias`), "Aceptó", "No aceptó". Al abrir uno Enviado aparece
    arriba **"¿María aceptó este presupuesto?"** con Sí, aceptó / No aceptó /
    Todavía no sé (esto último lo esconde hasta la próxima vez que se abra).
    Sigue además "Para volver a llamar" (punto 30).
40. **Apariencia sobria (.14)**, Pablo: "medio loco, muchos colores y formas".
    Capa "APARIENCIA SOBRIA" al final de `estilos.css` (pisa a la de 2026):
    - Una sola letra, **Inter** (se sacó Montserrat también de Google Fonts).
    - Neutros + un acento azul. Verde solo para WhatsApp y lo completo; rojo
      solo para errores y borrar. **Sin amarillo ni bordes punteados**: las
      tarjetas "Solo para vos" son blancas con una etiqueta gris chica.
    - Una sola forma: rectángulo redondeado (16 px tarjetas, 12 px el resto;
      chips de estado 6 px). Nada de píldoras ni círculos en las opciones.
    - Opciones para tocar (tipos, hojas, formas, vidrios, espesores, lugares,
      agregados, línea/color, − y +): fichas **grises sin borde**; la elegida,
      azul claro con borde azul. Los campos para escribir sí tienen borde.
    - Un solo botón lleno por pantalla (Continuar o WhatsApp); "Descargar
      PDF", "Guardar", email y "Ver el detalle" son blancos con borde fino.
    - Indicador de pasos plano: círculo con número; azul el paso actual,
      verde con tilde el que está **completo** (`is-hecho` se calcula en
      `pintarAvance()` con lo que está hecho, no con "pasos anteriores": el 3
      se tilda al mandarlo). Barra de avance de 8 px.
    - Pregunta "¿aceptó?" en azul claro, "Sí, aceptó" azul.
    - El error de ancho/alto va **debajo de la fila** `.item__medidas` (adentro
      del campo dejaba la columna angosta).
    - Guardados: los tres botones de cada fila en una grilla de 3 (en 360 px
      "Borrar" se salía de la pantalla).
41. **Minimalista + Precios como "Ajustes" (.15)**, Pablo: "más minimalista,
    como app de tendencia" y "simplificá Precios" (medía 46.000 px de alto en
    el celular: cada fila de precios era una ficha con 5 campos). Capa
    "MINIMALISTA" al final de `estilos.css`:
    - Fondo `#eef0f3`, tarjetas blancas **sin borde** (sombra mínima, radio
      20), encabezado del mismo color que el fondo que muestra una línea
      solo al bajar (`.barra.con-linea`, listener de scroll).
    - Pasos 1·2·3 como **control segmentado** (bloque gris, el actual blanco).
    - Textos de ayuda acortados a una línea.
    - **Precios**: `#vista-precios[data-sub]`. Con `data-sub=""` se ve el
      dólar compacto y el menú `#menu-precios` (grupos "Lo que cobrás",
      "Solo para vos", "El presupuesto"; renglones `[data-abrir]` con ícono,
      dato a la derecha y flecha). Cada pantalla es una
      `section.ajuste[data-ajuste]`, mostrada por CSS. `abrirAjuste(id)` hace
      `history.pushState` para que **el atrás del celular** vuelva al menú
      (`popstate`); en el encabezado aparecen "‹" (`#btn-atras`) y el título
      de la pantalla, y se ocultan el logo y "+ Nuevo". Tocar la pestaña
      Precios siempre vuelve al menú. Los conteos del menú los pinta
      `pintarMenuPrecios()`.
    - `tablaEditable` ya no es una tabla: renglones `.fila-precio`
      (`[data-indice]`) con el nombre (botón que abre el detalle) y la
      columna `principal: true` editable ahí mismo (`prefijo`/`sufijo`:
      "$ … /m²", "× 1,00", "… %"). Los precios en pesos son `type=text` con
      punto de miles (`data-numero`, se reformatea al salir). El resto de los
      campos y "Borrar" van en `.fila-precio__detalle`. Lo nuevo que se
      agrega aparece abierto con el cursor en el nombre.
    - Las pruebas: `pasos.mjs` también abre la pantalla de Precios y el
      renglón donde está el elemento; los selectores pasaron de
      `tr:has(...)` a `.fila-precio:has(...)` y tienen que ir en un solo
      string (si se encadenan locators, el ayudante ve la fila y no el campo).
42. **Velocidad, plana y transiciones (.16)**. Pablo: "tarda muchísimo en
    cargar" y "más plana, con transiciones smooth". Medido con 3G y CPU ×4
    (`carga.mjs`): al abrir ya instalada, primer dibujo de 1,3 s a 0,15 s;
    primera visita, de 6,2 s a 2,2 s.
    - **Sin Google Fonts**: la hoja de estilos de Google bloqueaba el dibujo en
      CADA apertura (es una respuesta "opaca" que el service worker no guarda)
      y en obra con mala señal podía colgar la app. Ahora la letra es la del
      sistema (`system-ui`: Roboto en Android, San Francisco en iPhone). Esto
      reemplaza la elección de Inter del punto 35.
    - **jsPDF se carga después** (`PDF.precargar()` a los 3 s de abrir, y
      `PDF.generar()` lo pide si todavía no llegó). Sigue en la lista del
      service worker, así anda sin señal.
    - La **primera instalación ya no recarga** la pantalla (`controllerchange`
      solo recarga si antes había otro service worker).
    - **Bug de actualizaciones (hasta la .15)**: al abrir, el navegador empieza
      a bajar la versión nueva antes de que la app escuche `updatefound`; esa
      descarga quedaba sin vigilar y ni se aplicaba ni aparecía la franja
      hasta otra apertura con suerte. Ahora se vigila también
      `registro.installing` y se llama `registro.update()` al arrancar.
      Prueba `actualiza.mjs` (5 chequeos, cambia `VERSION` en disco y la
      restaura): primera instalación sin recarga, versión nueva aplicada sola
      al abrir, franja si llega en uso sin perder lo escrito.
    - **Plana** (capa "PLANA + TRANSICIONES" al final de `estilos.css`): sin
      sombras; campos y botones secundarios con relleno gris, sin borde (el
      borde aparece al escribir —azul— o con error —rojo—); peligro en rojo
      tonal; listas de Guardados con separadores en vez de cajas.
    - **Transiciones**: las pestañas aparecen con un fundido; los pasos y las
      pantallas de Precios se deslizan según la dirección
      (`data-dir="adelante|atras"` que ponen `irPaso` y `abrirAjuste`; las
      animaciones arrancan solas porque las secciones pasan de `display:none`
      a verse). Lo que se despliega (detalle de un precio, desplegables,
      errores, "¿aceptó?") baja suave; los avisos salen con `aviso--sale`;
      botones y opciones se achican apenas al tocarlos. Con
      `prefers-reduced-motion` se apaga todo. **No animar las aberturas**: la
      lista se vuelve a dibujar con cada toque y parpadearía.
43. **Tendencia 2026 (.17)**. Pablo: la plana "sigue sin gustarme", buscar
    tendencias 2026/27 con efectos. Referencias: Liquid Glass de iOS 26 y
    Material 3 Expressive. Capa "TENDENCIA 2026" al final de `estilos.css`
    (la plana de la .16 quedó como base: campos y botones secundarios tonales):
    - **Barra de pestañas flotante de vidrio** (despegada de los bordes, blur,
      radio 30) con una **cápsula que se desliza** a la pestaña activa
      (`.barra__tabs::before`, `--tab-i` lo pone `mostrarVista`). La barra del
      total + acción también flota, encima. Vidrio al 86 % de opacidad: con
      menos se leía el texto de atrás y confundía. Sin `backdrop-filter`, casi
      opaco. En pantallas anchas no pasan de 640 px.
    - **Pasos con bloque blanco que se desliza** (`.pasos::before`,
      `--paso-i` lo pone `irPaso`).
    - **Movimiento con resorte**: `--resorte` es una curva `linear()` con ~8 %
      de rebote (con `cubic-bezier` de respaldo); botones y opciones se achican
      al tocar y vuelven rebotando.
    - **Título grande** (1,75 rem, 800) que se achica al bajar, con el
      encabezado que pasa a vidrio (`.barra.con-linea`).
    - Tarjetas radio 24 con sombra suave en capas; botón principal y de
      WhatsApp con degradé y relieve; dólar como tarjeta destacada azul.
    - Barra de avance en degradé con un brillo que la recorre mientras falta
      algo; verde al completar.
    - Ventanas como **hojas que suben desde abajo** con manija y fondo
      desenfocado; avisos como píldora oscura de vidrio que entra rebotando.
    - Tarjetas que entran **escalonadas** (40 ms entre una y otra).
    - El total de abajo **late** cuando cambia (clase `late`; no se anima el
      número porque las pruebas leen el texto enseguida).
    - **Vibración** de 8 ms (`navigator.vibrate`) al tocar botones principales,
      pestañas, pasos y opciones (solo Android; iPhone no vibra desde la web).
    - Se mantiene el mínimo de 56 px del botón principal (lo chequea prueba9).

44. **«Hormigón guiado» (.18): rediseño completo, con proceso de aprobación.**
    Pablo pidió un rediseño de nivel profesional (auditoría → investigación →
    tres conceptos → aprobación → implementación). La propuesta, con las
    capturas de la auditoría, la investigación, los tres conceptos (Hormigón,
    Plano, Bosque) y el sistema de diseño está en
    <https://claude.ai/artifact/PoQvxXaoCz5kDwXAwz6MRa> (privada, de Pablo).
    **Lo que Pablo dijo y aprobó (no deshacer sin preguntar):** colores y
    letra de Hormigón; de Bosque, la estructura (bloques bien separados y el
    total arriba), pero en el azul de Alumfer; «menos información, cortes
    claros, que la app lo vaya guiando, botones claros pero nada exagerado».
    Aprobó además: letra propia, ficha corta con el vidrio en una hoja, sacar
    vidrio flotante/rebote/brillo y la barra «Vas 83 %», y editar la abertura
    en pantalla propia. **Esto reemplaza las decisiones de apariencia de los
    puntos 35 y 40 a 43** (lo de comportamiento de esos puntos sigue).
    - **`estilos.css` se reescribió entero** (una sola hoja, ~560 líneas, sin
      capas apiladas). Los valores están en `:root`: papel `#F3F1EC`, tarjetas
      blancas, tinta `#1B1D1F`, un solo acento `#174A8C` (el azul del logo);
      verde solo WhatsApp y guardado/completo; cobre para lo que falta; rojo
      para errores y quitar. Radios 10 (controles) y 16 (tarjetas). Toque 48 px
      mínimo, 56 el principal. Movimiento 120/200/260 ms, sin rebote.
    - **Letra propia**: Inter (todo) y Newsreader (títulos y la pregunta de
      cada tarjeta), en `fuentes/*.woff2` (106 KB, licencia OFL), con
      `font-display: swap`, en la lista del service worker. No es Google
      Fonts: se sirve desde la app, así que no vuelve el problema del punto 42.
      El cero de las dos es liso (no se confunde con «Ø»).
    - **Cada bloque es una tarjeta con una sola pregunta** («¿Para quién es?»,
      «¿Qué medidas tiene?», «¿Cómo se lo mandás?»).
    - **Encabezado**: en Presupuesto es una **franja azul** con número ·
      cliente, «Guardado 18:52» (`#estado-guardado`, `pintarGuardado()`:
      «Guardando…» mientras espera el guardado automático) y, con aberturas, el
      **Total** (`#barra-total-valor` se mudó acá). En Guardados y Precios, el
      encabezado es papel con el título en serif.
    - **Barra de abajo**: sólida, pegada a las pestañas (también sólidas). Una
      línea «Falta: …» (`#avance-texto`; la barra de % se sacó, queda
      `aria-valuenow`) y un solo botón «Continuar». En el paso 2 sin aberturas
      no hay barra: el único botón es «Agregar una abertura» (principal). En
      el paso 3 tampoco: WhatsApp está una sola vez, en la pantalla.
    - **Renglón de abertura corto**: dibujo, código, nombre, medida (+ «N
      iguales», «forma triangular», «Precio a mano», «Falta completar») y
      precio. El vidrio, la línea y el color ya **no** van en el renglón.
    - **Editar una abertura es una pantalla propia** (`editando()`,
      `sincronizarEdicion()`, `cerrarItem()`): `#vista-presupuesto[data-editando]`
      y `body.editando-item` esconden pasos, lista y pestañas por CSS; arriba
      «‹» + el nombre (`#btn-atras`, el mismo de Precios), abajo fijo
      `.item__pie` con el precio y «Listo». El **atrás del celular** vuelve a
      la lista (`history.pushState({ item })`; `volviendoSolo` evita la
      carrera con `history.back()`). La ficha va en `<section class="bloque">`.
    - **Vidrio**: renglón «Vidrio · Simple 4 mm · Cambiar» (`renglonVidrio`,
      `[data-abrir-vidrio]`) que abre una hoja (`hojaVidrio`,
      `[data-hoja-vidrio]`, estado `vidrioAbierto`) con los mismos dibujos y
      espesores de siempre. La hoja vive **dentro** de la abertura (así el
      manejador de clics de la lista sigue sirviendo) y se cierra con «Listo»,
      tocando afuera o Escape. La pantalla de una ventana pasó de 3.100 px a
      menos de 2.200.
    - **Quitar una abertura no pregunta**: la quita y el aviso trae
      «Deshacer» (8 s). `avisar(texto, tipo, accion)` muestra **un aviso por
      vez**, siempre arriba de la barra de abajo.
    - **Paso 3**: primero «¿Cómo se lo mandás?» (WhatsApp, PDF y email),
      después «Lo que le llega a {nombre}» (`#tarjeta-resumen`: totales,
      ajustes plegados y «Guardar presupuesto»).
    - **Guardados**: primero «Para volver a llamar», después la lista (el
      renglón entero abre; «Repetir» y «Borrar» son texto), el mes y la copia.
    - **Compu (≥ 1024 px)**: pestañas al costado y, en el paso 2, el resumen
      de plata fijo a la derecha. Tablet: una columna centrada.
    - **PDF y hoja impresa (.19)**, con la misma identidad: sin encabezado
      negro ni barra azul ni recuadro gris. Rótulos chicos en mayúsculas
      (`rotulo()`), «Fecha» y «Válido hasta» arriba junto al número, la raya
      azul de 0,9 mm debajo del título, del cliente **solo los datos que
      existen** (antes salían guiones), tabla con rayas finas y los números a
      la derecha (`xCol()`), el código en azul, y el **TOTAL** como la cifra
      más grande (18 pt) con anticipo y saldo debajo. Sigue en Helvetica: no
      se incrustó Inter para no sumar ~300 KB (si Pablo lo pide, se evalúa).
      Mismos textos que antes («Subtotal», «TOTAL», «Condiciones»…).

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

**Lo que sigue (10/11), en orden de importancia:**

1. **Ver cómo le cae la .18 («Hormigón guiado», punto 44) a Pablo y a su
   papá.** Esta vez hubo propuesta dibujada y aprobada antes de implementar.
   Si algo no cierra, pedir qué pantalla y qué cosa (con captura) y ajustar
   sobre el sistema de `:root`, sin sumar capas.
2. **Probar en el Android real del papá**: el atrás del celular dentro de una
   abertura, la hoja del vidrio, compartir el PDF por WhatsApp y Gmail. En un
   iPhone: "Descargar PDF".
3. **Cargar los precios reales.** Lo único que falta para que la app sirva de
   verdad. Se cargan desde la app (Precios), **nunca en `precios-base.js`**
   (repo público). La planilla para completar con el papá está en
   <https://claude.ai/artifact/3YUMhr9X1whec6JXeDTVWj> (ver 1 bis); cuando
   Pablo avise que está completa, leerla con `ArtifactData` y, según
   `metodo.forma`, ajustar el motor de `calculo.js`.
4. **Formas especiales**: validar con el papá cómo las cobra y cargar los
   recargos (Precios → Formas especiales).
5. **Lista de materiales precisa**: peso por metro de cada línea y descuentos
   de fabricación por perfil.
6. **Firebase** (en pausa, ver abajo): sincronizar entre teléfonos y no perder
   nada. Necesita `firebaseConfig` y los dos emails.
7. Presupuesto aceptado → **hoja de taller** (como el parte de producción de
   OP): códigos, medidas, línea, color, vidrio, materiales, seña y saldo.
8. Más adelante: cotizador público en el sitio con el mismo motor; clave de
   acceso (Cloudflare Pages + Access) si hiciera falta esconder el link.

Descartado por Pablo: fotos de la obra por abertura (9/11).
Hecho y sacado de esta lista: botón Guardar, copia de seguridad, seguimiento,
resumen del mes, ganancia, simplificar Precios (.15), estados automáticos (.13).

### Base de datos en la nube: **Firebase elegido, en pausa** (9/11)

Pablo eligió Firebase y después lo dejó para más adelante: primero quiere
los precios y fórmulas reales. Ya se le pasó la guía de la consola (crear
proyecto "Alumfer Presupuestos" sin Analytics ni Gemini y **sin pasar a
Blaze**; app web sin Hosting; Authentication → Google + dominio autorizado
`pabloxesteban.github.io`; Firestore Standard en `southamerica-east1`, **modo
producción**). Para retomar hace falta que mande el `firebaseConfig` y los dos
emails de Google con acceso; ahí se le pasan las reglas (solo esos emails) y
se implementa el login, la sincronización y la subida de lo existente.

#### Opciones evaluadas

Hoy todo vive en `localStorage` de un teléfono. Pablo preguntó por una forma
económica de guardarlo en una base de datos. Volumen: cada presupuesto pesa
~25 KB (incluye la copia de precios); mil por año son ~25 MB.

Recomendado: **Firebase Firestore, plan gratis (Spark)**: 1 GiB y 50.000
lecturas / 20.000 escrituras por día según las guías de 2026 (verificar en
firebase.google.com/pricing); no se pausa por falta de uso; trae modo sin
conexión y sincroniza solo al volver la señal (clave en obra); login "Entrar
con Google" una vez por teléfono y reglas que solo dejan entrar a los emails
de Pablo y su papá. La configuración de Firebase no es secreta (la seguridad
son las reglas), así que puede ir en el repo público. El SDK se copiaría en
`js/vendor/` como jsPDF, para que ande sin internet y sin build step.
`localStorage` quedaría como copia local. Necesita que Pablo cree el proyecto
en la consola de Firebase con su cuenta de Google y pase la configuración.

Descartadas: Supabase gratis (500 MB, pero se pausa tras 7 días sin uso y no
sincroniza sin conexión); Cloudflare D1 (5 GB gratis, pero requiere escribir
y mantener un Worker y armar el login aparte); Google Sheets con Apps Script
(lento, frágil, seguridad floja).

## 7. Cómo probar

**Desde el 10/11 las pruebas están en el repo**: `tools/presupuestos-pruebas/`
(Playwright, sin dependencias nuevas). Correr todas antes de publicar:

```bash
bash tools/presupuestos-pruebas/correr.sh
```

Si se agrega algo, sumar una prueba ahí (y al `README.md` de esa carpeta).
Lo que cubren, en la historia de las versiones:
cliente → 3 aberturas → medidas y cantidad → descuento → total de pantalla =
motor = guardado → PDF descargado → compartir por WhatsApp y email (share
simulado con `addInitScript`) → reintento con `NotAllowedError` → sugerencia de
cliente en un presupuesto nuevo → presupuesto de 22 aberturas en 3 páginas →
logo propio → computadora sin share (abre `wa.me` + descarga) → hoja impresa.
**`prueba10.mjs` (.18 y .19, 33 chequeos)**: letra propia sin pedir nada afuera,
abertura a pantalla completa con sus preguntas, hoja del vidrio, «Deshacer»,
«Guardado» fijo, un aviso por vez, total de la franja = resumen = motor,
contrastes de la paleta, ninguna pantalla se sale de 360 px, y la compu.
**Desde la .12 las pruebas usan `pasos.mjs`**: antes de tocar o leer un
elemento, toca el paso donde está (como la persona). Prueba del recorrido por
pasos (19 chequeos): Continuar, bloqueo sin aberturas, indicador, barra según
el paso, tamaños de toque, nada cortado ni scroll horizontal en 360 px.
**Desde la .13, `pasos.mjs` completa solo nombre y teléfono** si un paso no
deja avanzar (para que las pruebas viejas sigan andando); las aberturas
"Otro trabajo" sin precio bloquean el PDF, por eso los bucles de 22 aberturas
excluyen `[data-tipo="libre"]`. Prueba de obligatorios, barra de avance y
estados (36 chequeos, incluido 360 px). Prueba del menú de Precios
(10 chequeos: menú corto, abrir, editar precio en el renglón, detalle,
atrás del celular, ‹, pestaña vuelve al menú, agregar con foco). Desde la .14 el mensaje de
medida se busca con `.campo__error:not([hidden])` dentro de la abertura.
Prueba de otro trabajo y precio a mano (17 chequeos), incluido el PDF.
Prueba de guardado, seguimiento, copia, mes y ganancia (22 chequeos), incluido
que la ganancia no llegue al cliente.
Prueba de la lista de materiales (17 chequeos): barras, retazos, curvado,
vidrios, m², kilos con peso por metro, barra de 6,5 m, y que **ni el PDF ni el
WhatsApp del cliente** tengan nada de materiales.
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
- En Playwright, una ficha recién agregada o un campo con foco escondían la
  barra de abajo cuando se ocultaba por foco: ahora se oculta por el tamaño
  de `visualViewport`.
- `.item__resumen-texto b` pinta de oscuro cualquier `<b>` del renglón: el
  código (`.codigo`) necesita su color con más prioridad.
- Al abrir la app, el service worker nuevo puede estar instalándose ANTES de
  que `register().then` agregue el listener de `updatefound`: hay que mirar
  también `registro.installing` (ver punto 42).
- Una hoja de estilos de otro dominio sin CORS (Google Fonts) es "opaca": el
  service worker no la guarda y bloquea el dibujo en cada apertura.
- `.item .codigo` (base) tiene `color: #fff !important`: para pisarlo hay que
  repetir el mismo selector, si no el "V1" queda blanco sobre gris.
- `.espesor` (botón redondo) pisa a `.espesor--textura` si tienen la misma
  especificidad: las fichas con foto usan `.espesores .espesor--textura`.
- Una IIFE metida en una concatenación de strings tiene que devolver `''`, si
  no aparece "undefined" en la pantalla.
- GitHub a veces marca como fallidos el chequeo de `VERSION` (con 0 trabajos)
  o el despliegue de Pages sin que haya error en el código: pasó con la .2, y
  Pages siguió sirviendo la .1. Volvió a pasar con la .14 (10/11). Se resuelve
  con el push siguiente (desde esta sesión no se puede re-ejecutar: la API
  devuelve 403); si no hay nada que publicar, un cambio en un `.md` alcanza. Siempre
  verificar con `curl .../sw.js | grep VERSION` que lo publicado es lo nuevo.
- Con el acordeón, en las pruebas solo la última abertura agregada está
  abierta: tocar `.item__resumen` antes de llenar campos de otra.
- Playwright no tiene en cuenta las barras fijas al llevar un elemento a la
  vista: hacer `scrollIntoView({ block: 'center' })` antes de tocar.
- Los precios guardados reemplazan la lista entera de fábrica: si un teléfono
  tiene 3 vidrios guardados, solo existen esos 3 (no se mezclan con los de fábrica).
- jsPDF con Helvetica estándar no dibuja `−` (U+2212), espacios finos ni
  emojis: pasar todo por `PDF.limpiar()`.
- jsPDF mide mal el espacio duro (U+00A0) de «$ 1.000»: lo alineado a la
  derecha quedaba corrido ~1 mm. `texto()` lo cambia por un espacio común
  cuando alinea a la derecha.
- **En 360 px, si algo empuja el ancho** (pasó con los tres pasos), el celular
  agranda la pantalla de trabajo y las barras fijas quedan corridas y tapan
  las pestañas. `prueba10.mjs` recorre todas las pantallas a 360 px y falla si
  alguna se sale.
- Un elemento `position: fixed` (el pie de la abertura, la hoja del vidrio)
  deja de ser fijo si algún antecesor tiene `transform`: por eso los pasos
  entran con fundido (opacidad), no deslizándose.
- `history.back()` no es instantáneo: si se abre otra abertura antes de que
  vuelva, el `popstate` la cerraba. Ver `volviendoSolo` en `sincronizarEdicion`.
- En las pruebas, lo que está fuera de la abertura abierta no se puede tocar:
  `pasos.mjs` sale solo (toca «‹») y abre la hoja del vidrio si hace falta.
  Para escribir en la abertura usar `.item--abierto …`, no `.item >> nth=1`.
- El deploy FTP del sitio (`deploy.yml`) corre en **cada** push a `main`, aunque
  solo cambie la app. Estuvo fallando con `530 Login authentication failed`
  porque el hosting estaba suspendido; hoy alumfer.com.ar responde 200, así que
  parece resuelto.
