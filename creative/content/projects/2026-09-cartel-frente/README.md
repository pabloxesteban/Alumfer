# Cartel del frente — Alumfer (5400 × 1200)

Cartel para el frente del local (Av. San Martín 734, Adrogué). Reemplaza al cartel
viejo y a la propuesta con TikTok y dos teléfonos. Usa la misma información que el
volante 10×15 (`2026-07-volante-10x15`, en la rama `claude/alumfer-instagram-carousel-n8sdfp`).

![Simulación en el frente](export/mockup-frente.jpg)

## Especificaciones

| Dato | Valor |
|---|---|
| Medida | **5400 × 1200** (proporción 4,5 : 1) |
| Archivo principal | `export/Alumfer_cartel_5400x1200.png` (5400 × 1200 px, RGB) |
| Vectorial | `export/Alumfer_cartel_vectorial.pdf` (texto e isologo en vector, sin imágenes) |
| Colores | Carbon `#1A1C1E`, Azul Alumfer `#1B6CC8`, Concrete `#B0A99A`, blanco |
| Tipografías | Montserrat (títulos) · Inter (incluidas en `assets/`) |

> Si la medida es en mm (5,40 × 1,20 m): pasarle a la imprenta el **PDF vectorial**,
> que se escala a cualquier tamaño sin perder calidad. El PNG equivale a ~25 DPI
> a tamaño real, que alcanza para lona vista de lejos, pero el PDF es mejor.
> Si piden sangrado, agregarlo con el mismo fondo oscuro (el diseño deja aire en los bordes).

## Contenido

- **ALUMFER** — Carpintería de aluminio (isologo redibujado en vector: `assets/isologo.svg`)
- **SOMOS FABRICANTES** — Trabajos a medida · Colocación en obra
- **Presupuesto sin cargo** — WhatsApp **11 6336-8643**
- @alumfercarpinteria · www.alumfer.com.ar
- Franja: **Nuestras líneas** Modena 1 · Modena 2 · A-30 New · Herrero · Ekonal · Rotonda

No lleva QR: en un cartel a 3 m de altura no se escanea cómodo. Para eso está
`assets/qr.svg` (WhatsApp con mensaje precargado), para poner como vinilo en la vidriera.

## Archivos

```
cartel.html              Diseño (1800x400 px CSS; se exporta a 3x).
assets/
  isologo.svg            Isologo en vector (trazos a 60°), redibujado de solologo.png.
  qr.svg                 QR de WhatsApp (para vidriera / puerta).
  Montserrat.ttf, Inter.ttf
export/
  Alumfer_cartel_5400x1200.png
  Alumfer_cartel_vectorial.pdf
  mockup-frente.jpg      Simulación sobre la foto del local.
scripts/
  export.mjs             Regenera el PNG y el PDF (npm i playwright-core).
  gen-qr.mjs             Regenera el QR (npm i qrcode).
```

## Cómo editar y exportar

1. Editar textos/tamaños en `cartel.html` (se ve abriéndolo en el navegador).
2. `npm i playwright-core && node scripts/export.mjs`
   (usa el Chromium de `CHROMIUM`, por defecto `/opt/pw-browsers/chromium`).
