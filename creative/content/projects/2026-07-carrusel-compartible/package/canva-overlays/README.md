# Overlays para Canva — vos ponés las fotos

8 capas de texto **transparentes** (1080×1080) para poner **encima de tus fotos de obra**.
Cada overlay ya trae el texto diseñado, el degradado de legibilidad y el acento azul en su lugar.
Vos solo agregás la imagen atrás. El copy NO se toca.

```
overlay-1.svg  Hook — "La ventana barata no existe."   (foto opcional; funciona sobre fondo oscuro)
overlay-2.svg  "Existen dos." + cuotas
overlay-3.svg  Cuota 1 · el invierno (gas)
overlay-4.svg  Cuota 2 · el ruido (living)
overlay-5.svg  Cuota 3 · la humedad (abertura)
overlay-6.svg  Cuota final — "dos veces."
overlay-7.svg  El giro — "carísima" + fabricación propia
overlay-8.svg  CTA — WhatsApp + Alumfer
```

## Paso a paso en Canva
1. Creá un diseño **1080×1080** con 8 páginas (una por slide).
2. En cada página, subí y ubicá **tu foto de obra** como fondo (que cubra toda la página).
   - Sugerencia de foto por slide → ver `../assets.json`.
3. **Uploads** → subí los `overlay-N.svg` → arrastrá el que corresponde **encima** de la foto.
4. Escalá el overlay al 100% para que cubra los 1080×1080. Listo: el degradado hace que el texto se lea sobre cualquier foto.
5. El texto queda **editable** (podés cambiar la tipografía a **Montserrat 800** si está en tu kit de marca).
6. Descargá como **PNG/JPG** en orden 1→8.

## Qué foto va en cada slide (resumen de `assets.json`)
- **1** — opcional (fondo oscuro o detalle sutil de aluminio).
- **2** — split o una ventana Alumfer con luz.
- **3** — detalle de marco + sellado (paleta fría).
- **4** — ventana dando a una calle **real de GBA**.
- **5** — condensación en vidrio / moho junto al marco (el "antes" honesto).
- **6** — la misma abertura (foto sobria; el texto manda).
- **7** — taller Adrogué: corte a 45°, medición, manos.
- **8** — obra terminada con luz natural.

## Reglas de marca al elegir/editar fotos
- Solo **obra propia**, nunca stock.
- Color grade Alumfer: saturación −10/−15%, temperatura fría, sombras con detalle (ver `shared/design-system/colors.md`). **Nada de Orange & Teal.**
- El overlay ya respeta el acento único azul: no agregues más elementos azules.

> ¿Preferís no usar fotos? En `../slides/` están las 8 versiones 100% gráficas (line-art), ya terminadas. Estos overlays son para la versión **fotográfica**, que armás vos con tus imágenes.
