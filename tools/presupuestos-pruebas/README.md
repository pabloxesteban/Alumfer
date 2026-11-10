# Pruebas de la app de presupuestos

Pruebas de punta a punta con Playwright (Chromium) contra la app servida en
`localhost:8777`. No hay build ni dependencias: usan el Playwright instalado en
el entorno de Claude Code en la nube (`/opt/node22/lib/node_modules/playwright`).

```bash
bash tools/presupuestos-pruebas/correr.sh
```

Cada script escribe `OK` / `FALLA` por chequeo y deja capturas y PDFs en la
carpeta que se le pasa como argumento (`correr.sh` usa una temporal).
El dólar se simula (`ctx.route(/dolarapi|bluelytics/, …)`), nada sale a internet.

| Script | Qué prueba |
|---|---|
| `prueba.mjs` | Recorrido completo: cliente, 3 aberturas, acordeón, cantidad, descuento, total = motor = guardado, PDF, WhatsApp y email (share simulado), reintento con `NotAllowedError`, cliente sugerido, 22 aberturas en varias páginas, Tu empresa y logo, compu sin share (wa.me + descarga). |
| `prueba2.mjs` | Migración de nombres viejos ("Float" → "Simple"), pasos, barra de abajo, tamaños de toque. |
| `prueba3.mjs` | Vidrios y espesores, formas especiales con sus medidas, recargo por forma, "¿Dónde va?", PDF agrupado. |
| `prueba4.mjs` | Catálogo (laminado, poliestireno, policarbonatos, sin "undefined"). |
| `prueba5.mjs` | Quincho de varias piezas: códigos V1/PF1…, agrupado por lugar, rejas de hierro, aplicar a todas. |
| `prueba6.mjs` | Lista de materiales (tiras de 6 m, retazos, kilos, vidrios); que no llegue al cliente. |
| `prueba7.mjs` | Guardar, Guardados, seguimiento "Para volver a llamar", copia de seguridad, resumen del mes, ganancia. |
| `prueba8.mjs` | "Otro trabajo" con precio a mano y precio a mano por abertura, también en el PDF. |
| `prueba9.mjs` | Campos obligatorios, barra de avance, estados automáticos, "¿aceptó?", 360 px. |
| `prueba10.mjs` | Rediseño .18: letra propia sin pedir nada afuera, abertura a pantalla completa, hoja del vidrio, «Deshacer» al quitar, «Guardado» fijo, un aviso por vez, total de la franja = resumen = motor, contrastes, ninguna pantalla se sale de 360 px, compu con pestañas al costado. |
| `angosto360.mjs` | Tilde del paso 3 al mandar, botones de Guardados en 360 px, sin scroll horizontal. |
| `precios-menu.mjs` | Precios como menú: abrir pantallas, editar en el renglón, detalle, atrás del celular, ‹. |
| `actualiza.mjs` | Actualización: primera instalación sin recarga, versión nueva aplicada sola al abrir, franja si llega en uso. **Cambia `VERSION` de `sw.js` en disco y la restaura al terminar.** |

Herramientas sueltas (no van en `correr.sh`):

- `carga.mjs`: mide el tiempo de apertura con 3G y CPU ×4 (`node carga.mjs`).
- `capturas-estados.mjs <carpeta>`, `capturas-pasos.mjs <carpeta>`: capturas de celular a 2×.
- `video-recorrido.mjs <carpeta>`: graba un video del recorrido (para pasarlo a mp4:
  `ffmpeg -i <carpeta>/*.webm -c:v libx264 -pix_fmt yuv420p recorrido.mp4`).

`pasos.mjs` es el ayudante: antes de tocar un elemento va al paso del
presupuesto o a la pantalla de Precios (y abre el renglón) donde está, como lo
haría la persona; si un paso no deja avanzar, completa nombre y teléfono.
Desde la .18 también sale de la abertura que se está editando (toca «‹») cuando
se toca algo de afuera, y abre o cierra la hoja del vidrio. Para escribir en la
abertura abierta usar `.item--abierto …`.
Con locators encadenados ve el primero, no el campo final: escribir el
selector entero en un solo string.
