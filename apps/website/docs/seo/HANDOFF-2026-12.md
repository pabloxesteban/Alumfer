# Handoff SEO: qué medir a mediados de diciembre 2026

Escrito el 17 nov 2026. Sirve para que quien revise Search Console en diciembre
(una persona o Claude) sepa qué se cambió, qué números hay hoy y contra qué comparar.

## Qué se cambió y cuándo

| Fecha | Cambio | Páginas |
|---|---|---|
| 7 nov 2026 | Título nuevo y más texto propio | `/aberturas-de-aluminio-temperley/` |
| 12 nov 2026 | Secciones nuevas, de ~1.070 a ~1.400 palabras, y una pregunta frecuente más | `/aberturas-de-aluminio-burzaco/`, `/aberturas-de-aluminio-berazategui/` |
| 12 nov 2026 | Preguntas frecuentes repetidas unificadas | Berazategui, Glew, Quilmes, Rafael Calzada, Turdera |
| 17 nov 2026 | En los datos estructurados, el nombre del negocio pasa de "Alumfer Carpintería de Aluminio" a **"Alumfer"**. El nombre largo queda como `alternateName`; el `sameAs` ya existía. | Las 37 páginas con `LocalBusiness` (pabloxesteban/Alumfer#54) |

**Hasta la revisión de diciembre no se tocan esas páginas**, para no mezclar efectos.

## Datos de hoy (línea de base)

Fuente: la exportación en `search-console-2026-11-12/` (búsqueda web, 29 jun – 10 nov 2026).

### Sitio completo, 28 días antes de los cambios (10 oct – 6 nov)

| Clics | Clics por día | Impresiones | Impresiones por día | CTR | Posición* |
|---|---|---|---|---|---|
| 276 | 9,9 | 9.886 | 353 | 2,79 % | 7,1 |

\* Posición promedio ponderada por impresiones, calculada desde `Gráfico.csv`.
Search Console la calcula parecido; puede diferir en décimas.

Referencia semanal (de lunes a domingo, hasta el 14 nov): las últimas semanas dieron
94, 83 y 104 clics. La del 9 nov tiene 6 días y ya era la mejor.

### Búsquedas a seguir (acumulado 29 jun – 10 nov)

| Búsqueda | Clics | Impresiones | CTR | Posición |
|---|---|---|---|---|
| alumfer | 31 | 138 | 22,5 % | 3,35 |
| aberturas temperley | 13 | 666 | 1,95 % | 8,21 |
| aberturas burzaco | 6 | 628 | 0,96 % | 8,11 |
| aberturas berazategui | 2 | 492 | 0,41 % | 7,56 |
| aberturas en berazategui | 1 | 173 | 0,58 % | 8,45 |
| casa de aberturas en berazategui | 0 | 104 | 0 % | 7,24 |

### Páginas a seguir (acumulado 29 jun – 10 nov)

| Página | Clics | Impresiones | CTR | Posición |
|---|---|---|---|---|
| `/` (home) | 81 | 1.660 | 4,88 % | 6,86 |
| `/aberturas-de-aluminio-berazategui/` | 36 | 2.275 | 1,58 % | 7,46 |
| `/aberturas-de-aluminio-temperley/` | 29 | 1.299 | 2,23 % | 8,10 |
| `/aberturas-de-aluminio-burzaco/` | 24 | 1.651 | 1,45 % | 7,65 |

**Ojo:** estas dos tablas son promedios de 4 meses y medio, cuando el sitio
recién arrancaba. No se pueden comparar directo con un mes de diciembre. Usarlas
solo como referencia y hacer la comparación como se explica abajo.

## Cómo comparar en diciembre

En Search Console: Rendimiento → Resultados de búsqueda → Fecha → **Comparar** →
Personalizado, con dos períodos de 28 días:

- **Antes:** 10 oct – 6 nov 2026, el último día antes del primer cambio (Temperley, 7 nov).
- **Después:** 18 nov – 15 dic 2026, desde el día siguiente al cambio de nombre. Si se revisa
  más tarde, correr el período pero mantener 28 días.

Exportar el CSV de esa comparación y guardarlo en `search-console-2026-12-XX/`.
Así cada búsqueda y cada página tiene sus dos columnas lado a lado.

### Qué mirar y qué sería una buena señal

1. **"alumfer":** la posición debería acercarse a 1. Si sigue cerca de 3, buscar "alumfer"
   en Google y ver qué aparece arriba (otra empresa, un directorio, una red social).
2. **Burzaco, Berazategui y Temperley:** primero la posición (pasar de ~8 a 5 o mejor),
   después el CTR. Con la misma posición, el CTR casi no se mueve.
3. **Sitio completo:** clics por día contra 9,9. Diciembre puede tener otra
   estacionalidad (fiestas), así que mirar también las impresiones: si crecen ellas y no
   los clics, el problema es la posición y no la cantidad de búsquedas.
4. **Control:** compará con dos o tres localidades que no se tocaron (por ejemplo Lomas de
   Zamora o Monte Grande). Si todas subieron igual, el cambio no fue por lo que se hizo.

## Pendiente fuera del sitio (no afecta la medición)

- Perfil de Google Business: el nombre debería ser "Alumfer" o empezar así.
- Reseñas que mencionen el barrio, fotos de obras subidas cada semana.
- Juntar fotos y descripciones de obras en Burzaco, Temperley y Florencio Varela para
  el próximo cambio de contenido (después de la revisión).
- Enlaces desde proveedores, arquitectos y constructoras de la zona.
