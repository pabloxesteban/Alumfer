# Presupuestos — Alumfer

App interna para armar presupuestos de aberturas de aluminio y entregarlos
impresos, en PDF o por WhatsApp. Sin framework, sin build step y sin servidor:
unos pocos archivos JS, un HTML y dos hojas de estilo.

Está pensada para usarse sin práctica previa: la pantalla va en tres pasos
(para quién es → qué lleva → cómo se entrega), el tipo de abertura se elige
tocando su dibujo, las medidas van en centímetros y todo lo que se usa poco
queda plegado.

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

> Cada teléfono guarda sus propios presupuestos y sus propios precios. No se
> sincronizan entre dispositivos: lo que se carga en el celular no aparece en
> la computadora. Para pasar datos de uno a otro está la copia de seguridad en
> *Anteriores*.

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
| **Anteriores** | Reabrir, repetir o borrar presupuestos guardados. Copia de seguridad. |
| **Precios** | Editar la lista y aplicar aumentos por inflación. |

Abajo de todo queda fija una barra con el total y los dos botones que más se
usan (WhatsApp y PDF), así no hay que buscarlos.

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

Arriba de la pestaña **Precios** se muestra la cotización del blue (compra y
venta), que es la referencia real para mover los precios del aluminio. Se
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

Por eso, cada tanto: **Anteriores → Guardar una copia de todo** descarga un
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
├── sw.js                 Modo sin internet (subir VERSION al cambiar archivos)
├── icono-*.png           Íconos de la app
└── js/
    ├── precios-base.js   Lista de precios de fábrica (semilla editable)
    ├── iconos.js         Dibujo de cada tipo de abertura y de la interfaz
    ├── dolar.js          Cotización del blue, con fuente de respaldo
    ├── formato.js        Moneda, fechas, teléfonos, parsing de números
    ├── calculo.js        Motor de cálculo (funciones puras, sin DOM)
    ├── almacenamiento.js localStorage, numeración e import/export
    ├── documento.js      Hoja imprimible y mensaje de WhatsApp
    └── app.js            Interfaz
```

`calculo.js` no toca el DOM: se puede probar desde Node cargando los archivos en
orden (`formato` → `precios-base` → `calculo`).

---

## Atajos

| Tecla | Acción |
|-------|--------|
| `Ctrl/Cmd + S` | Guardar |
| `Ctrl/Cmd + P` | Imprimir / PDF |

La numeración (`P-2026-0001`) se asigna al guardar y se reinicia cada año.
