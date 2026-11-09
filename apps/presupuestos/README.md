# Presupuestos — Alumfer

App interna para armar presupuestos de aberturas de aluminio y entregarlos
en PDF (por WhatsApp, email o descargado) o impresos. Sin framework, sin build step y sin servidor:
unos pocos archivos JS, un HTML y dos hojas de estilo.

Está pensada para usarse sin práctica previa, por alguien mayor que no está
acostumbrado a la tecnología: la pantalla va en tres pasos (para quién es →
qué lleva → cómo se manda), cada paso dice en una frase qué hacer, el tipo de
abertura se elige tocando su dibujo, la línea, el vidrio y el color se eligen
de una lista de botones grandes, la cantidad va con − y +, las medidas van en
centímetros y todo lo que se usa poco queda plegado. Letra grande, botones
grandes y palabras comunes (por ejemplo "vidrio Simple", no "Float").

> Para retomar el trabajo desde cero —decisiones tomadas, pendientes y trampas ya
> encontradas— está [`HANDOFF.md`](HANDOFF.md).

> **Es de uso interno.** No se publica en alumfer.com.ar: el workflow de FTP
> solo sube `apps/website/`. Se sirve aparte, por GitHub Pages (ver abajo).

---

## Desde el celular (así se usa en el día a día)

La app está publicada con **GitHub Pages**, que es gratis y no toca el hosting
del sitio:

**<https://pabloxesteban.github.io/Alumfer/apps/presupuestos/>**

Se sirve desde la rama `main`: cada cambio que llegue ahí queda publicado en un
minuto. No hay que subir nada por FTP.

### Instalarla como app

1. Abrir el link en el celular (Chrome en Android, Safari en iPhone).
2. **Android**: aparece una franja arriba con el botón *Instalar*.
   **iPhone**: tocar *Compartir* → *Agregar a inicio*.
3. Queda el ícono de Alumfer en la pantalla de inicio y abre en pantalla
   completa, sin barra del navegador.

Después de la primera vez **funciona sin internet**: la app entera queda
guardada en el teléfono, así que en una obra sin señal abre igual.

### Cómo se actualiza

Sola, pero avisando. Cada vez que se abre la app (y cada vez que se vuelve a
ella), el navegador se fija si hay una versión nueva publicada. Si la hay, la
baja en segundo plano **sin pisar la que se está usando** y aparece una franja
azul arriba: *"Hay una versión nueva de la app"* con el botón **Actualizar
ahora**. Recién al tocarlo se activa y se recarga la pantalla.

Así nunca cambia la app por debajo mientras se está cargando un presupuesto, y
lo que había a medio cargar sigue ahí después de actualizar. La versión que está
corriendo se ve al final de la pestaña *Precios*.

> **Al publicar hay que subir `VERSION` en `sw.js`.** Es lo que le avisa al
> navegador que hay algo nuevo: sin eso, los celulares que ya la tienen
> instalada siguen con la versión vieja. Lo controla el workflow
> `.github/workflows/presupuestos-version.yml`, que falla si se cambió la app
> sin tocar `VERSION`.

> Cada teléfono guarda sus propios presupuestos y sus propios precios. No se
> sincronizan entre dispositivos: lo que se carga en el celular no aparece en
> la computadora. Para pasar datos de uno a otro está la copia de seguridad en
> *Guardados*.

### Qué se ve y qué no

El repositorio es público, así que el link lo puede abrir cualquiera que lo
tenga y en el código se ven los **precios de referencia** de
`js/precios-base.js`. **Los precios reales nunca salen del teléfono**: se
cargan desde la pestaña *Precios* y quedan en el navegador, no en el código.

Por eso: **no commitear los precios reales en `precios-base.js`**. Si hiciera
falta esconder la app detrás de una clave, la forma gratis es moverla a
Cloudflare Pages con Access.

## Cómo abrirla en la computadora

```bash
cd apps/presupuestos
python3 -m http.server 8080
# después: http://localhost:8080
```

También funciona abriendo `index.html` con doble clic, pero algunos navegadores
bloquean el guardado local en `file://`. Si pasa, la app avisa arriba con una
franja amarilla y conviene usar el comando de arriba.

---

## Las tres pestañas

| Pestaña | Para qué |
|---------|----------|
| **Presupuesto** | Cargar cliente, aberturas y ajustes. Es la pantalla de trabajo. |
| **Guardados** | Buscar por nombre, número o teléfono; reabrir, repetir o borrar. Arriba: el resumen del mes y los presupuestos "para volver a llamar". Copia de seguridad. |
| **Precios** | Editar la lista y aplicar aumentos por inflación. |

Abajo de todo queda fija una barra con el total y los dos botones que más se
usan (WhatsApp y PDF), así no hay que buscarlos.

## Cargar una abertura

1. **Tipo:** se elige por dibujo. Los modelos que vienen en varias hojas
   (corrediza, de abrir, puerta, puerta balcón) aparecen una vez y en la ficha
   se pregunta **¿Cuántas hojas?**.
2. **Forma** (paño fijo, banderola, ventana de abrir de 1 hoja, cerramiento,
   mosquitero fijo, reja): recta, inclinada, triangular, con arco o redonda.
   Las medidas que se piden cambian con la forma. Se cobra el rectángulo que
   la contiene más el recargo de *Precios → Formas especiales* (0 % de entrada).
3. **Medidas** en centímetros y **cantidad** con − y +.
4. **Vidrio:** primero el tipo (Simple, Esmerilado, Espejado, Laminado,
   Doble vidrio, Poliestireno, Policarbonato alveolar o compacto) y después,
   si hace falta, el espesor, el diseño (el poliestireno se elige viendo la
   textura) o el color de la placa (policarbonato: transparente, opal, bronce).
5. **Línea** (Herrero, Rotonda 640, Módena 1, Módena 2, A30 New) y **color**
   (pintados y anodizados), **¿Dónde va?** (opcional) y agregados (mosquitero,
   premarco de aluminio, cortina, reja —pregunta el tipo—, etc.). Mosquiteros,
   rejas, postigones y cortinas no piden línea; las cortinas de PVC tampoco color.
6. **Listo:** la abertura queda resumida en un renglón; se toca para cambiarla.

**Lo que no está en el catálogo:** al final del selector está **Otro trabajo**
(una reparación, un vidrio suelto, retirar las aberturas viejas…): se escribe
qué es y se le pone el precio, por unidad o por m². Sale en el presupuesto con
su código (O1, O2…).

**Cobrar otro precio:** en cada abertura, *Precio a mano, descuento o nota →
Precio a mano* reemplaza el precio calculado. La app recuerda cuál era el
calculado (solo se ve en la app); al cliente le llega solo el precio.

**Un quincho u obra grande:** cada pieza (corredizas, paños fijos, el
triángulo del frontis) se carga como una abertura y se marca *¿Dónde va? →
Quincho*. En la pantalla y en el PDF salen juntas bajo el título QUINCHO con su
subtotal. Cada abertura tiene un código (V1, PF1, P1, PB1, R1…) para hablar de
"la V3" con el cliente y en la obra. Al elegir línea o color está la casilla
*Cambiarlo también en las otras aberturas*, y en el vidrio el botón *Poner este
vidrio en las otras*: un cambio de color en toda la obra es un solo toque.
Cada tipo arranca con su medida típica (puerta 90 × 205) o con la de otra igual
ya cargada. Las medidas son de afuera a afuera del marco.

## Guardar y no perder nada

El botón **Guardar presupuesto** (paso 3) lo guarda y dice con qué número y
cómo encontrarlo en **Guardados**. Igual la app guarda sola cada cambio.

Todo vive en el teléfono: si se rompe, se pierde. Por eso, cada 7 días (si
hubo cambios) aparece arriba una franja **"Guardá una copia"**: el botón manda
un archivo por WhatsApp, Drive o email. Para recuperarlo: *Guardados → Recuperar
una copia*.

## Para volver a llamar

Los presupuestos enviados que pasaron 3 días sin respuesta (se cambia en
*Precios → Costos*) aparecen arriba en Guardados, y la pestaña muestra un punto
naranja. **Preguntarle por WhatsApp** abre el chat del cliente con un mensaje
listo; también están **Aceptó**, **No aceptó** y **Más tarde**.

## Ganancia (solo para Alumfer)

La tarjeta **Ganancia y compras** muestra cuánto deja el presupuesto: lo que se
cobra sin IVA menos aluminio, vidrios, lo que se compra hecho, herrajes y mano
de obra. Los costos se cargan en *Precios* (kilo de aluminio, peso por metro de
cada línea, lo que se paga el m² de cada vidrio, herrajes y mano de obra por
abertura). Lo que falta cargar se avisa. **No sale ni en el PDF ni en el
WhatsApp del cliente.** En Guardados hay un resumen del mes con lo
presupuestado, lo aceptado y la ganancia.

## Para hacer las compras (solo para Alumfer)

Debajo del paso 3 está la tarjeta **Para hacer las compras → Ver los
materiales**. Con las aberturas del presupuesto calcula, **aproximado**:

- Cuántas **tiras de aluminio de 6 m** comprar por línea, perfil y color
  (marco, hojas, premarco, tapajuntas, mosquitero), cuánto se usa, cuánto sobra
  y qué retazos quedan. Las piezas curvas (arcos, redondas) se avisan aparte.
- Los **vidrios**: cada paño con su medida, agrupados por tipo, y los m².
- Rejas de hierro y cortinas de PVC en **m²**.
- Los **kilos** de aluminio y su costo, si se carga el peso por metro de cada
  línea en *Precios → Líneas* (el precio del kilo ya está arriba en Precios).

Cada pieza se cuenta con la medida de afuera a afuera, sin los descuentos de
fabricación de cada línea: sobra un poco y nunca falta. El largo de la tira y
lo que se pierde en cada corte se cambian en *Precios → Valores por defecto*.

**Esto nunca le llega al cliente**: no sale en el PDF ni en el WhatsApp del
presupuesto. La lista se puede mandar por WhatsApp (al proveedor o a uno mismo)
o copiar.

## Entregar el presupuesto

| Botón | En el celular | En la computadora |
|-------|---------------|-------------------|
| **Enviar por WhatsApp** | Abre la lista para compartir con el PDF adjunto: se elige WhatsApp y el contacto. | Abre WhatsApp con el resumen y descarga el PDF para adjuntarlo. |
| **Descargar PDF** | Lo descarga (en iPhone: lista para compartir → *Guardar en Archivos*). | Lo descarga. |
| **Enviar por email** | Lista para compartir con el PDF: se elige Gmail o Mail. | Abre el correo con el resumen y descarga el PDF. |
| *Otras formas* (plegado) | Mensaje de WhatsApp directo al número del cliente (sin PDF), imprimir, copiar el resumen. | Igual. |

Un link de WhatsApp no puede adjuntar archivos: por eso el PDF viaja por la
lista para compartir del teléfono. Al compartir, el presupuesto pasa solo a
*Enviado al cliente*.

El PDF se arma en el teléfono (jsPDF, en `js/vendor/`), funciona sin internet y
trae logo, datos de la empresa, dibujo de cada abertura, medidas, cantidades,
precios, totales, condiciones, forma de pago, plazo y observaciones. Si son
muchas aberturas sigue en otra página con el encabezado de la tabla repetido.

## Clientes

No hay que cargarlos aparte: cada cliente queda guardado con su presupuesto.
Al escribir el nombre (o parte del teléfono o la localidad) en un presupuesto
nuevo aparecen los que coinciden; tocando uno se completan todos sus datos.

## Tu empresa

Al final de *Precios*: nombre, frase, teléfono, email, dirección, web y logo.
Es lo que sale arriba del PDF. El logo se puede cambiar por una foto o imagen
del teléfono y volver al de Alumfer cuando se quiera.

---

## Cómo se calcula

```
aluminio   = $/m² de la tipología × factor de la línea × (1 + recargo del color)
vidrio     = $/m² del vidrio
unitario   = (aluminio + vidrio) × m² facturables + adicionales − descuento del ítem
total ítem = unitario × cantidad
```

- **Las medidas se cargan en centímetros** (150 × 110). Adentro se guardan en
  milímetros y en el presupuesto impreso salen en metros (1,50 × 1,10 m).
- **m² facturables** = ancho × alto, con un piso por tipología (una banderola de
  50 × 40 cm se cobra como 0,36 m²). En la app aparece el cartel *mínimo facturable*.
- **El color recarga solo el aluminio**, no el vidrio.
- **Los adicionales** se cobran por m² (mosquitero, cortina), por metro lineal de
  perímetro (premarco, contramarco) o por unidad (cierre multipunto).
- **Cada ítem se redondea** al múltiplo configurado en *Precios → Valores por
  defecto* (por defecto, $1.000).

Al total se le aplican, en este orden: descuento general, colocación
(porcentaje, $/m² o monto fijo), flete y, si se discrimina, IVA.

---

## El dólar blue

Arriba de la pestaña **Precios** se muestra la cotización del **dólar blue**:
un solo número, el que se paga por cada dólar (la "venta" de la casa de
cambio, el más caro). Es el que usa la app para todas las cuentas; **el dólar
oficial no se usa nunca**. Se
consulta a [dolarapi.com](https://dolarapi.com) y, si no responde, a
[bluelytics.com.ar](https://bluelytics.com.ar). Las dos son gratis y no
necesitan clave.

El último valor queda guardado en el teléfono: sin señal se muestra ese,
aclarando de cuándo es y marcándolo en naranja si ya pasaron más de 12 horas.
El service worker **no** cachea esta consulta, justamente para que no se
muestre el valor de ayer como si fuera el de hoy.

En el total del presupuesto aparece también el equivalente en dólares, en letra
chica. **Eso es solo para la pantalla**: no sale ni en el PDF ni en el WhatsApp
que recibe el cliente.

## El kilo de aluminio

Debajo del dólar hay un cuadro con el **precio del kilo de aluminio**. Ese dato
no lo publica ninguna API —lo pasa el proveedor—, así que se carga a mano, en
dólares o en pesos, y la app muestra las dos monedas convirtiendo con el blue
del día.

- Guarda **una entrada por día** en un historial corto (12 valores) y muestra
  cuánto subió o bajó respecto de la vez anterior, comparando en dólares para
  que la inflación no ensucie la comparación.
- Si el dato tiene más de 30 días lo marca en naranja, como recordatorio de
  pedir la lista actualizada.
- Se guarda solo, igual que los precios, y entra en la copia de seguridad.

## Precios: importante

Los valores que vienen de fábrica en `js/precios-base.js` son **de referencia**,
no los de Alumfer. Antes de usar la app en serio hay que recorrer la pestaña
**Precios** y poner los propios.

**No hay botón de guardar: los precios se guardan solos** a medida que se
escriben. Cada cambio muestra un cartelito verde *Guardado ✓* al lado de la
fecha de actualización. Lo mismo pasa con el presupuesto que se está armando.

Para un aumento general: *Precios → Aumentar todos los precios*, poner el
porcentaje, elegir qué tablas alcanza y aplicar.

**Los presupuestos guardan una copia de la lista con la que se calcularon.** Si
en octubre aumentás todo un 15 % y reabrís un presupuesto de septiembre, los
números siguen siendo los que le pasaste al cliente. Cuando la lista vigente
cambió, el panel de total ofrece un botón **Actualizar** para recalcularlo a
precios de hoy.

---

## Dónde viven los datos

En el `localStorage` del navegador de esta máquina. No hay servidor ni nube:
si borrás los datos del navegador o cambiás de computadora, se pierden.

Por eso, cada tanto: **Guardados → Guardar una copia ahora** descarga un
`.json` con todos los presupuestos y la lista de precios. **Recuperar una copia**
lo vuelve a cargar.

---

## Archivos

```
apps/presupuestos/
├── index.html            Estructura de la app
├── estilos.css           Estilos de pantalla
├── impresion.css         Hoja A4 del presupuesto impreso
├── tokens.css            Copia de shared/design-system/tokens.css
├── logo-alumfer.jpg      Membrete
├── manifest.webmanifest  Para instalarla como app en el celular
├── sw.js                 Modo sin internet y aviso de versión nueva
│                         (subir VERSION al publicar cualquier cambio)
├── icono-*.png           Íconos de la app
└── js/
    ├── precios-base.js   Lista de precios de fábrica (semilla editable)
    ├── iconos.js         Dibujo de cada tipo de abertura y de la interfaz
    ├── dolar.js          Cotización del blue, con fuente de respaldo
    ├── formato.js        Moneda, fechas, teléfonos, parsing de números
    ├── calculo.js        Motor de cálculo (funciones puras, sin DOM)
    ├── materiales.js     Lista de compras aproximada (sin DOM)
    ├── almacenamiento.js localStorage, numeración e import/export
    ├── documento.js      Hoja imprimible, condiciones, mensajes de WhatsApp y email
    ├── pdf.js            PDF del presupuesto (A4, varias páginas)
    ├── vendor/           jsPDF 4.2.1 (licencia MIT), sin CDN
    └── app.js            Interfaz
```

`calculo.js` no toca el DOM: se puede probar desde Node cargando los archivos en
orden (`formato` → `precios-base` → `calculo`).

---

## Atajos

| Tecla | Acción |
|-------|--------|
| `Ctrl/Cmd + S` | Guardar |
| `Ctrl/Cmd + P` | Imprimir |

La numeración (`P-2026-0001`) se asigna al guardar y se reinicia cada año.
