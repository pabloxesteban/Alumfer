# Volante Alumfer — 10 × 15 cm (blanco y negro)

Volante impreso para reparto en mano (público del conurbano bonaerense).
Diseño en blanco y negro / escala de grises, foto de una abertura de aluminio
(ventana) como protagonista y todos los datos de contacto + QR de WhatsApp.

Todo el material es **auto-contenido y editable**: HTML + fuentes + imagen + QR.

## Especificaciones de impresión

| Dato | Valor |
|---|---|
| Tamaño final (corte / TrimBox) | **100 × 150 mm** (10 × 15 cm) |
| Con sangrado (BleedBox) | **106 × 156 mm** (3 mm por lado) |
| Resolución | 300 DPI (y versión a ~762 DPI) |
| Color | Escala de grises (blanco y negro) |
| Caras | 1 (frente) |

> Al mandar a la imprenta: pedir que impriman **respetando el sangrado**
> (no "ajustar a página").

## Contenido / datos

- **Marca:** ALUMFER — Carpintería de aluminio
- **Hook:** SOMOS FABRICANTES
- **Líneas:** Modena 1, Modena 2, A-30 New, Herrero, Ekonal, Rotonda
- **WhatsApp / tel:** 11 6336-8643
- **QR:** abre WhatsApp con el mensaje *"Hola Alumfer, quisiera pedir un presupuesto de..."*
- **Instagram:** @alumfercarpinteria
- **Web:** www.alumfer.com.ar
- **Email:** alumfercarpinteria@gmail.com
- **Dirección:** Av. San Martín 734, Adrogué

## Archivos

```
volante.html          Diseño para pantalla/preview (1000x1500 px, con borde).
volante-print.html    Misma pieza con 3 mm de sangrado y sin borde (1060x1560 px)
                      -> es la que se rasteriza para armar el PDF de imprenta.
assets/
  hero.png            Imagen final (ventana de aluminio), en gris, ya ajustada.
  hero-original.png   Imagen original tal cual salio de GPT Image (por si se re-edita).
  logo-white.png      Isologo en blanco (para el hero oscuro).
  logo-black.png      Isologo en negro (por si se necesita sobre fondo claro).
  qr.png              QR de WhatsApp.
  Montserrat.ttf      Fuente de titulos/lockup.
  Inter.ttf           Fuente de textos.
export/
  Alumfer_volante_10x15_sangrado.pdf   PDF listo (imagen a ~762 DPI).
  Alumfer_volante_10x15_300dpi.pdf     PDF listo a 300 DPI exactos.
  preview.png                          Vista del arte aprobado.
scripts/
  gen-qr.mjs          Regenera el QR (si cambia el numero o el mensaje).
  build-pdf.mjs       Arma los dos PDF a partir del PNG con sangrado.
```

## Tipografías (para la imprenta, si preguntan)

- **ALUMFER / titulos:** Montserrat (600 el lockup, 800/900 en hooks y labels).
- **Textos:** Inter.
- Ambas van incluidas en `assets/`.

## Cómo editar y volver a exportar

1. **Editar textos/tamaños:** abrir `volante.html` (preview) y/o `volante-print.html`.
   Mantener ambas en sync (`volante-print.html` = igual pero con 3 mm de sangrado
   por lado y sin borde). Se ven abriendo el HTML en un navegador.

2. **Cambiar el QR** (nuevo número o mensaje): editar las constantes en
   `scripts/gen-qr.mjs` y correr `node scripts/gen-qr.mjs` (necesita `npm i qrcode`).

3. **Regenerar la imagen** (hero): se generó con GPT Image (`gpt-image-1`, 1536×1024)
   con este prompt (resumen): *"foto en blanco y negro, tonos grises cálidos, de una
   ventana moderna de aluminio vista desde adentro, marco fino oscuro nítido, luz de
   mañana entrando, planta en el alféizar, jardín al fondo, cálida y hogareña"*.
   Después se pasó a gris y se subió un poco el brillo. Requiere `OPENAI_API_KEY`.

4. **Re-rasterizar el arte con sangrado** (necesita un Chromium headless y `sharp`):

   ```bash
   # render a 3x (0.1 mm/px -> 106x156 mm = 1060x1560 px, x3 = 3180x4680)
   chromium --headless=new --no-sandbox --hide-scrollbars \
     --force-color-profile=srgb --force-device-scale-factor=3 \
     --default-background-color=FFFFFFFF \
     --screenshot=bleed_raw.png --window-size=1060,1660 \
     "file://$PWD/volante-print.html"
   # recortar exacto a 3180x4680
   node -e "require('sharp')('bleed_raw.png').extract({left:0,top:0,width:3180,height:4680}).toFile('bleed.png')"
   ```

5. **Armar los PDF:**

   ```bash
   npm i pdf-lib sharp
   node scripts/build-pdf.mjs bleed.png
   ```

   Genera los dos PDF en `export/`.

## Notas

- Diseño y export hechos por código (HTML + Chromium + sharp + pdf-lib), sin
  herramienta de diseño, para que quede 100 % versionable y reproducible.
- Si en el futuro se quiere doble faz, agregar un `volante-dorso.html` y exportar
  una segunda página con el mismo criterio de sangrado.
