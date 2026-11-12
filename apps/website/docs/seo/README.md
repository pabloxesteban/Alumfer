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
