# Presupuestos — Alumfer

App interna para armar presupuestos de aberturas de aluminio y entregarlos
impresos, en PDF o por WhatsApp. Sin framework, sin build step y sin servidor:
unos pocos archivos JS, un HTML y dos hojas de estilo.

Está pensada para usarse sin práctica previa: la pantalla va en tres pasos
(para quién es → qué lleva → cómo se entrega), el tipo de abertura se elige
tocando su dibujo, las medidas van en centímetros y todo lo que se usa poco
queda plegado.

> **Es de uso interno.** Muestra precios de costo y márgenes, así que **no se
> publica en alumfer.com.ar**: el workflow de deploy solo sube `apps/website/`.

---

## Cómo abrirla

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

## Precios: importante

Los valores que vienen de fábrica en `js/precios-base.js` son **de referencia**,
no los de Alumfer. Antes de usar la app en serio hay que recorrer la pestaña
**Precios** y poner los propios.

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
└── js/
    ├── precios-base.js   Lista de precios de fábrica (semilla editable)
    ├── iconos.js         Dibujo de cada tipo de abertura y de la interfaz
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
