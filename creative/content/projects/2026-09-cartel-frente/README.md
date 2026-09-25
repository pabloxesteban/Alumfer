# Cartel del frente — Alumfer (540 × 120 cm)

Actualización del cartel instalado en el frente (Av. San Martín 734, Adrogué), hecho
alrededor de 2015. Se mantiene **la misma estructura** (isologo azul y ALUMFER a la
izquierda; "Trabajos a medida" a la derecha, separados por dos trazos a 60° como los del isologo) con un lenguaje más
sobrio y elegante, acorde a aberturas de primera línea, pensado para leerse de pasada:
una sola tipografía (Montserrat, cursiva solo en la frase de colocación) sin contornos, texto blanco sobre fondos
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
| **Medida total** | **5400 × 1200 mm (540 × 120 cm)** — el archivo mide exactamente eso, sin sangrado extra |
| **Para la imprenta (PDF)** | `export/IMPRENTA_Alumfer_cartel_540x120cm_TAMANO_REAL.pdf` — tamaño real, 100 % vectorial, tipografías incrustadas |
| Para la imprenta (imagen) | `export/IMPRENTA_Alumfer_cartel_540x120cm_TAMANO_REAL_72dpi.png` — 15307 × 3402 px = 540 × 120 cm a 72 dpi |
| Ficha técnica | `export/Alumfer_cartel_FICHA_TECNICA.pdf` |
| Para ver / compartir | `Alumfer_cartel_5400x1200.png`, `Alumfer_cartel_10800x2400_alta.png` |
| Texto | Todo el texto en blanco puro `#FFFFFF`, salvo "Colocación en seco" (azul del isologo con contorno blanco) y la "/" entre teléfonos (gris separador) |
| Volumen | Degradé vertical sutil en el fondo de la marca, filo fino (sombra + luz) en el borde del panel metálico y filo de luz sobre la franja de contacto (sin sombras en los textos). Todo vectorial |
| Colores | Oscuro `#121518` (marca), **metalizado** gris cepillado en la columna de Trabajos a medida (franjas vectoriales), grafito `#1e2227` (franja de contacto). Azul `#2f7fd6` (isologo), blanco |
| Tipografía | Montserrat (marca, lista, líneas) + **Barlow Condensed** para lo que resalta (SOMOS FABRICANTES, TRABAJOS A MEDIDA, frase de colocación, teléfonos, web e Instagram). Todas en `assets/`, licencia OFL |

### Qué decirle a la imprenta

> "Es una lona de **540 × 120 cm (medida total)**. El PDF está **a tamaño real** y es **vectorial**
> (tipografías incrustadas): se puede ampliar o reducir sin perder calidad."

- Un PDF común no admite páginas de más de 5,08 m; por eso el PDF usa `UserUnit = 10`
  (norma PDF 1.6/1.7): al abrirlo en Acrobat o en el RIP de la imprenta mide 540 × 120 cm reales.
  Si algún programa viejo lo mostrara a 54 × 12 cm, es el mismo archivo a escala 1:10: se imprime al 1000 %,
  o se usa el PNG.
- Si la imprenta pide sangrado, se cambia `BLEED_MM` en `scripts/export.mjs` (los fondos se extienden solos).

### Legibilidad a tamaño real (altura de mayúsculas aprox.)

| Texto | Altura | Se lee desde |
|---|---|---|
| ALUMFER (+ isologo, mismo alto) | ~26 cm | ~50 m |
| WhatsApp 11 6336-8643 / 11 5806-5231 | ~14 cm | ~45 m |
| TRABAJOS A MEDIDA · SOMOS FABRICANTES | ~13 cm | ~40 m |
| Líneas | ~7 cm | ~22 m |
| Web, Instagram | ~9 cm | ~30 m |
| Lista de trabajos, frase de colocación | ~6 cm | ~20 m (vereda de enfrente) |

## Contenido

- **Carpintería de aluminio · ALUMFER** (isologo redibujado en vector: `assets/isologo.svg`)
- **"Somos fabricantes"**
- Herrero – Rotonda – Modena 1 y 2 – A-30 New
- **COLOCACIÓN EN SECO – SIN ROMPER NI ENSUCIAR** (Barlow Condensed en mayúsculas, bajo Trabajos a medida; "Colocación en seco" con el mismo azul del isologo `#2F7FD6` y un contorno blanco fino)
- **Trabajos a medida:** ventanas y puertas, portones, postigones, mamparas para baño,
  mosquiteros, frentes de negocio, jardín de invierno, laminados y D.V.H.
  (sin divisores de oficina ni frentes de placard, para dar lugar a letra más grande)
- Franja de contacto: WhatsApp **11 6336-8643 / 11 5806-5231** · **www.alumfer.com.ar** · Instagram **@alumfercarpinteria**

No lleva QR: a 3 m de altura no se escanea cómodo. El QR de WhatsApp está en
`assets/qr.svg` para poner como vinilo en la vidriera o la puerta.

## Archivos

```
cartel.html              Diseño (1800x400 px CSS = 5400x1200 mm).
assets/
  isologo.svg            Isologo en vector (trazos a 60°), redibujado de solologo.png.
  qr.svg                 QR de WhatsApp (para vidriera / puerta).
  Montserrat.ttf, Montserrat-Italic.ttf, BarlowCondensed-SemiBold.ttf, BarlowCondensed-Bold.ttf
export/
  IMPRENTA_Alumfer_cartel_540x120cm_TAMANO_REAL.pdf        Para la imprenta (tamaño real, vectorial).
  IMPRENTA_Alumfer_cartel_540x120cm_TAMANO_REAL_72dpi.png  Lo mismo en imagen a 72 dpi.
  Alumfer_cartel_FICHA_TECNICA.pdf           Ficha A4 con medidas, sangrado y archivo (para el email).
  Alumfer_cartel_5400x1200.png               Para ver / compartir (sin sangrado).
  Alumfer_cartel_10800x2400_alta.png         Ídem, más grande.
  mockup-frente.jpg      Simulación sobre la foto del local.
  antes-despues.jpg      Cartel actual vs. actualizado.
  frente-actual-vs-nuevo.jpg  Foto entera del frente, actual vs. nuevo.
  comparacion/           Mismo frente en 3 fotos: 1 antes, 2 cartel sugerido, 3 cartel nuevo
                         (y comparacion-3-en-1.jpg con las tres juntas).
scripts/
  export.mjs             Regenera PNG y PDF, con y sin sangrado (npm i playwright-core pdf-lib sharp).
  gen-qr.mjs             Regenera el QR (npm i qrcode).
  ficha.mjs              Regenera la ficha técnica desde ficha-tecnica.html.
```

## Cómo editar y exportar

1. Editar textos/tamaños en `cartel.html` (se ve abriéndolo en el navegador).
2. `npm i playwright-core pdf-lib sharp && node scripts/export.mjs`
   (usa el Chromium de `CHROMIUM`, por defecto `/opt/pw-browsers/chromium`).
