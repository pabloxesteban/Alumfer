# Seguimiento de SEO

Exportaciones de Google Search Console (Rendimiento → Resultados de búsqueda →
Exportar CSV) y los gráficos que salen de ellas. Esta carpeta no se publica en el sitio.

## Corte del 12 nov 2026 (datos del 29 jun al 10 nov)

| Período | Clics por día | Apariciones por día | Posición promedio | CTR |
|---|---|---|---|---|
| 29 jun – 14 ago (antes de los cambios) | 2,6 | 97 | 7,9 | 2,7 % |
| 15 ago – 2 oct (títulos y texto propio en las 27 localidades) | 6,8 | 248 | 7,5 | 2,8 % |
| 3 oct – 6 nov (rediseño, páginas más completas) | 9,5 | 340 | 7,1 | 2,8 % |

- `search-console-2026-11.png`: el gráfico semana a semana.
- `seo-linea-de-tiempo-2026-11.png`: qué se cambió y cuándo.
- Para regenerar el gráfico con una exportación nueva:
  `python3 grafico-search-console.py <carpeta>/Gráfico.csv salida.png` (requiere matplotlib).

## Cambios para medir en el próximo corte

**12 nov 2026: Burzaco y Berazategui.** Son las dos búsquedas locales con muchas
apariciones y casi ningún clic ("aberturas burzaco": 628 apariciones y 6 clics;
"aberturas berazategui", "aberturas en berazategui" y "casa de aberturas en berazategui":
769 apariciones y 3 clics). Las dos estaban en el puesto 7–8.
- Burzaco: secciones "Aberturas estándar o a medida en Burzaco" y "Trabajos que conviene
  resolver en la misma visita", más una pregunta frecuente. De ~1.070 a ~1.400 palabras.
- Berazategui: secciones "Casa de aberturas en Berazategui: qué tener en cuenta" y
  "Hudson, Ranelagh y los barrios cerrados", más una pregunta frecuente. De ~1.060 a ~1.400 palabras.
- Temperley no se tocó: el 7 nov ya se le cambió el título y se le agregó texto, y
  hay que esperar a ver ese cambio antes de hacer otro.
- Preguntas frecuentes repetidas, unificadas en Berazategui, Glew, Quilmes, Rafael Calzada y Turdera.

Qué mirar a partir de mediados de diciembre: posición y CTR de esas consultas, y clics de
`/aberturas-de-aluminio-burzaco/`, `/aberturas-de-aluminio-berazategui/` y `/aberturas-de-aluminio-temperley/`.
