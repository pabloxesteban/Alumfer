# Footage del sitio (capturas reales para editar el reel)

Grabaciones del sitio Alumfer en movimiento (1080x1920, 30fps, sin audio),
con su branding completo (GSAP/Lenis/SplitType + fuentes Montserrat/Inter
vendorizadas) y el hero con una obra real. Importalas en CapCut / Premiere / AE.

- `00-walkthrough.mp4` — recorrido continuo de todo el sitio (~27s). El más útil.
- `01-hero.mp4` — entrada del hero (título palabra por palabra) + stats con count-up.
- `02-nosotros.mp4` — diferenciales (fabricantes, a medida, colocación en seco).
- `03-trabajos.mp4` — galería de obras + proceso "Así trabajamos".
- `04-catalogo.mp4` — catálogo con cambio de tabs (líneas, vidrios, colores).
- `05-contacto.mp4` — FAQ + formulario de cotización + footer.

Regenerar: `node reel/capture/capture_master.mjs` (recorrido) y
`node reel/capture/capture.mjs` (clips por sección).
