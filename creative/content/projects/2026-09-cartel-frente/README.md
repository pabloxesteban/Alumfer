# Cartel del frente — Alumfer (540 × 120 cm)

Actualización del cartel instalado en el frente (Av. San Martín 734, Adrogué), hecho
alrededor de 2015. Se mantiene **la misma estructura** (isologo azul y ALUMFER a la
izquierda; "Trabajos a medida" a la derecha, separados por dos trazos a 60° como los del isologo) con un lenguaje más
sobrio y elegante, acorde a aberturas de primera línea, pensado para leerse de pasada:
una sola tipografía (Montserrat) sin cursivas ni contornos, texto blanco sobre fondos
lisos, espaciado normal entre letras, y el azul como acento (isologo y filetes a los
lados de "Somos fabricantes"). Abajo, una franja de contacto a todo el ancho: los dos WhatsApp, web e Instagram. Se ponen al día los datos, con la información
del volante 10×15 (`2026-07-volante-10x15`, rama `claude/alumfer-instagram-carousel-n8sdfp`).

![Antes (arriba) y después (abajo)](export/antes-despues.jpg)

### Qué cambia respecto del cartel de 2015

| Antes | Ahora |
|---|---|
| Tel.: 4294-6725 | WhatsApp **11 6336-8643 / 11 5806-5231** |
| Facebook "Alumfer Carpintería de Aluminio" | Instagram **@alumfercarpinteria** |
| Herrero - Rotonda - Modena - A30 New | Herrero – Rotonda – **Modena 1 y 2** – A-30 New |
| Lista de trabajos | 8 trabajos principales (se suma Ventanas; salen Divisores de oficina y Frentes de placard); textos corregidos |
| Letras gruesas con contorno, cursivas, fondo con brillos | Tipografía limpia, texto blanco sobre fondos lisos, todo en vector |

## Especificaciones

| Dato | Valor |
|---|---|
| Medida final (corte) | **540 × 120 cm** (5,40 × 1,20 m, lona). En el diseño, 1 px = 3 mm |
| Sangrado | **5 cm por lado** → tamaño total **550 × 130 cm** |
| **Para la imprenta (PDF)** | `export/IMPRENTA_Alumfer_cartel_550x130cm_TAMANO_REAL.pdf` — **a tamaño real**, 100 % vectorial |
| **Para la imprenta (imagen)** | `export/IMPRENTA_Alumfer_cartel_550x130cm_TAMANO_REAL_72dpi.png` — 15591 × 3685 px = 550 × 130 cm a 72 dpi |
| Para ver / compartir | `Alumfer_cartel_5400x1200.png`, `Alumfer_cartel_10800x2400_alta.png` (sin sangrado) |
| Colores | Solo dos fondos: oscuro `#121518` (arriba) y grafito `#1e2227` (franja de contacto). Azul `#2f7fd6` (isologo) / `#3d8be0` (filetes), blanco |
| Tipografía | Montserrat (incluida en `assets/`) |

### Qué decirle a la imprenta

> "Es una lona de **540 × 120 cm** terminada. Les paso el PDF **a tamaño real con 5 cm de
> sangrado por lado** (550 × 130 cm); la línea de corte está marcada en el PDF (TrimBox).
> Es vectorial. También está la imagen a tamaño real a 72 dpi por si la prefieren."

- Un PDF común no admite páginas de más de 5,08 m; por eso el PDF usa `UserUnit = 10`
  (norma PDF 1.6/1.7): al abrirlo en Acrobat o en el RIP de la imprenta mide 550 × 130 cm reales.
  Si algún programa viejo lo mostrara a 55 × 13 cm, es el mismo archivo a escala 1:10: se imprime ×10,
  o se usa el PNG, que no tiene ese límite.
- 72 dpi a tamaño real es la resolución habitual para lona vista de lejos. Si piden más, se sube `DPI`
  en `scripts/export.mjs` (con el PDF vectorial la imprenta puede rasterizar a la resolución que quiera).
- En el sangrado solo hay fondo liso (oscuro arriba, grafito en la franja de abajo): ningún texto
  queda cerca del corte. Si para tensar la lona en el bastidor piden más de 5 cm, se cambia
  `BLEED_MM` en `scripts/export.mjs` y se vuelve a exportar.

### Legibilidad a tamaño real (altura de mayúsculas aprox.)

| Texto | Altura | Se lee desde |
|---|---|---|
| ALUMFER | ~22 cm | ~45 m |
| Franja de contacto (teléfonos, web, Instagram) | ~8 cm | ~25 m |
| TRABAJOS A MEDIDA · SOMOS FABRICANTES | ~8 cm | ~25 m |
| Líneas | ~8 cm | ~25 m |
| Lista de trabajos | ~7 cm | ~22 m |

## Contenido

- **Carpintería de aluminio · ALUMFER** (isologo redibujado en vector: `assets/isologo.svg`)
- **"Somos fabricantes"**
- Herrero – Rotonda – Modena 1 y 2 – A-30 New
- **Trabajos a medida:** ventanas y puertas, portones, postigones, mamparas para baño,
  mosquiteros, frentes de negocio, jardín de invierno, laminados y D.V.H.
  (sin divisores de oficina ni frentes de placard, para dar lugar a letra más grande)
- **Colocación en seco · sin romper paredes** (en azul, bajo la lista: instalan sobre lo existente)
- Franja de contacto: WhatsApp **11 6336-8643 / 11 5806-5231** · **www.alumfer.com.ar** · Instagram **@alumfercarpinteria**

No lleva QR: a 3 m de altura no se escanea cómodo. El QR de WhatsApp está en
`assets/qr.svg` para poner como vinilo en la vidriera o la puerta.

## Archivos

```
cartel.html              Diseño (1800x400 px CSS = 5400x1200 mm).
assets/
  isologo.svg            Isologo en vector (trazos a 60°), redibujado de solologo.png.
  qr.svg                 QR de WhatsApp (para vidriera / puerta).
  Montserrat.ttf
export/
  IMPRENTA_Alumfer_cartel_550x130cm_TAMANO_REAL.pdf        Para la imprenta (tamaño real, vectorial).
  IMPRENTA_Alumfer_cartel_550x130cm_TAMANO_REAL_72dpi.png  Lo mismo en imagen a 72 dpi.
  Alumfer_cartel_5400x1200.png               Para ver / compartir (sin sangrado).
  Alumfer_cartel_10800x2400_alta.png         Ídem, más grande.
  mockup-frente.jpg      Simulación sobre la foto del local.
  antes-despues.jpg      Cartel actual vs. actualizado.
  frente-actual-vs-nuevo.jpg  Foto entera del frente, actual vs. nuevo.
  comparacion/           Mismo frente en 3 fotos: 1 antes, 2 cartel sugerido, 3 cartel nuevo.
scripts/
  export.mjs             Regenera PNG y PDF, con y sin sangrado (npm i playwright-core pdf-lib sharp).
  gen-qr.mjs             Regenera el QR (npm i qrcode).
```

## Cómo editar y exportar

1. Editar textos/tamaños en `cartel.html` (se ve abriéndolo en el navegador).
2. `npm i playwright-core pdf-lib sharp && node scripts/export.mjs`
   (usa el Chromium de `CHROMIUM`, por defecto `/opt/pw-browsers/chromium`).
