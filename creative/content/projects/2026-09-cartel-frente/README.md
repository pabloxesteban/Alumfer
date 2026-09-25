# Cartel del frente — Alumfer (5400 × 1200)

Actualización del cartel instalado en el frente (Av. San Martín 734, Adrogué), hecho
alrededor de 2015. Se mantiene **la misma estructura** (isologo azul y ALUMFER a la
izquierda; "Trabajos a medida" a la derecha, separados por dos trazos a 60° como los del isologo) con un lenguaje más
sobrio y elegante, acorde a aberturas de primera línea, pensado para leerse de pasada:
una sola tipografía (Montserrat) sin cursivas ni contornos, texto blanco sobre fondos
lisos, espaciado normal entre letras, y el azul como acento (isologo y filetes a los
lados de "Somos fabricantes"). Abajo, una franja de contacto a todo el ancho: WhatsApp, teléfono fijo, web e Instagram. Se ponen al día los datos, con la información
del volante 10×15 (`2026-07-volante-10x15`, rama `claude/alumfer-instagram-carousel-n8sdfp`).

![Antes (arriba) y después (abajo)](export/antes-despues.jpg)

### Qué cambia respecto del cartel de 2015

| Antes | Ahora |
|---|---|
| Tel.: 4294-6725 | WhatsApp **11 6336-8643** + Tel. **4294-6725** |
| Facebook "Alumfer Carpintería de Aluminio" | Instagram **@alumfercarpinteria** |
| Herrero - Rotonda - Modena - A30 New | Herrero – Rotonda – **Modena 1 y 2** – A-30 New |
| Lista de trabajos | 8 trabajos principales (se suma Ventanas; salen Divisores de oficina y Frentes de placard); textos corregidos |
| Letras gruesas con contorno, cursivas, fondo con brillos | Tipografía limpia, texto blanco sobre fondos lisos, todo en vector |

## Especificaciones

| Dato | Valor |
|---|---|
| Medida final (corte) | **5,40 × 1,20 m** (proporción 4,5 : 1). En el diseño, 1 px = 3 mm |
| Sangrado | **5 cm por lado** → tamaño total **5,50 × 1,30 m** |
| **Para la imprenta** | `export/IMPRENTA_Alumfer_cartel_con_sangrado_escala_1-10.pdf` (550 × 130 mm → **ampliar ×10**) |
| PNG con sangrado | `export/IMPRENTA_Alumfer_cartel_con_sangrado_5500x1300.png` (1 px = 1 cm a tamaño real) |
| Sin sangrado (para ver) | `Alumfer_cartel_vectorial_escala_1-10.pdf`, `Alumfer_cartel_5400x1200.png`, `Alumfer_cartel_10800x2400_alta.png` |
| Colores | Solo dos fondos: oscuro `#121518` (arriba) y grafito `#1e2227` (franja de contacto). Azul `#2f7fd6` (isologo) / `#3d8be0` (filetes), blanco |
| Tipografía | Montserrat (incluida en `assets/`) |

### Qué decirle a la imprenta

> "Es un cartel de **5,40 × 1,20 m** terminado. El PDF está a **escala 1:10**, hay que
> ampliarlo ×10. Tiene **5 cm de sangrado por lado** (tamaño total 5,50 × 1,30 m);
> la línea de corte está marcada en el PDF (TrimBox). Es 100 % vectorial."

- Los PDF no admiten páginas de más de 5 m, por eso va a escala (así se trabaja en gigantografía).
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
- Franja de contacto: WhatsApp **11 6336-8643** · Tel. **4294-6725** · **www.alumfer.com.ar** · Instagram **@alumfercarpinteria**

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
  IMPRENTA_Alumfer_cartel_con_sangrado_escala_1-10.pdf   Para la imprenta (ampliar x10).
  IMPRENTA_Alumfer_cartel_con_sangrado_5500x1300.png     Lo mismo en imagen.
  Alumfer_cartel_vectorial_escala_1-10.pdf   Sin sangrado.
  Alumfer_cartel_5400x1200.png               Sin sangrado.
  Alumfer_cartel_10800x2400_alta.png         Sin sangrado, alta.
  mockup-frente.jpg      Simulación sobre la foto del local.
  antes-despues.jpg      Cartel actual vs. actualizado.
  frente-actual-vs-nuevo.jpg  Foto entera del frente, actual vs. nuevo.
scripts/
  export.mjs             Regenera PNG y PDF, con y sin sangrado (npm i playwright-core pdf-lib sharp).
  gen-qr.mjs             Regenera el QR (npm i qrcode).
```

## Cómo editar y exportar

1. Editar textos/tamaños en `cartel.html` (se ve abriéndolo en el navegador).
2. `npm i playwright-core pdf-lib sharp && node scripts/export.mjs`
   (usa el Chromium de `CHROMIUM`, por defecto `/opt/pw-browsers/chromium`).
