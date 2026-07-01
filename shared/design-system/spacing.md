# Sistema de Espaciado — Alumfer

> Sistema de espaciado con lógica y ejemplos de aplicación.

---

## La Lógica del Espaciado de Alumfer

El espaciado de la marca Alumfer sigue la misma filosofía que su identidad: **precisión con respiro**. El espacio en blanco (o en negro, dado el fondo Carbon) no es ausencia de diseño — es parte activa del diseño.

El artesano premium no llena todos los espacios. Deja respirar al trabajo.

**Principio central:** Cuanto más importante es el elemento, más espacio tiene alrededor.

---

## Escala de Espaciado

Basada en múltiplos de 8px (el grid base de diseño digital):

| Token | Valor | Uso |
|---|---|---|
| `--space-1` | 4px | Separación mínima entre elementos muy relacionados (icono + texto label) |
| `--space-2` | 8px | Espacio estándar entre elementos relacionados |
| `--space-3` | 16px | Separación entre grupos de elementos |
| `--space-4` | 24px | Separación entre secciones menores |
| `--space-5` | 32px | Separación entre secciones principales |
| `--space-6` | 48px | Espacio generoso para contenido de alto peso visual |
| `--space-7` | 64px | Márgenes de pantalla y separaciones mayores |
| `--space-8` | 96px | Secciones de gran importancia visual |
| `--space-9` | 128px | Hero sections, elementos centrados de máximo peso |

---

## Aplicación por Contexto

### Reels de Instagram (1080 × 1920px)

**Zona segura:** El algoritmo de Instagram cubre:
- Arriba: 180px (UI de seguidor + botones)
- Abajo: 260px (descripción + botones de interacción)
- Izquierda: 0px
- Derecha: 120px (botones de like, comentario, compartir)

**Márgenes para texto:**
- Margen lateral del texto: 48px desde el borde de la pantalla (mínimo)
- Margen inferior del texto principal: 280px desde abajo (para no quedar tapado por UI)
- Margen superior del texto: 200px desde arriba (para no quedar tapado por el handle)

**Separación entre elementos de texto:**
- Entre título y subtítulo: 16px (`--space-3`)
- Entre bloque de texto y logo: 32px (`--space-5`)
- Entre líneas de texto (line height): 1.3-1.5× el tamaño de la fuente

---

### Carruseles de Instagram (1080 × 1350px)

**Márgenes laterales:** 72px a cada lado (mínimo) para dejar respiro visual.

**Separación entre elementos por slide:**
- Padding general de slide: 72px lateral, 80px superior e inferior
- Entre imagen y texto: 32px (`--space-5`)
- Entre título y cuerpo: 16px (`--space-3`)
- Entre ítem de lista: 12px

**Zona segura lateral en carrusel:** Dejar los últimos 40px a la derecha libres de contenido esencial para que no quede tapado al pasar al siguiente slide.

---

### Documentos de Presupuesto

**Márgenes de página:** 32-40mm en todos los lados.

**Espacio entre secciones:** 16pt de separación entre cada sección del presupuesto.

**Espacio entre ítems:** 8pt entre cada línea de ítem del presupuesto.

**Padding de tablas:** 8px vertical, 12px horizontal en cada celda.

---

## El Espacio Negativo como Elemento de Premium

El diseño premium usa más espacio de lo "necesario". La tentación es llenar todos los espacios disponibles con información. La realidad es que el espacio en blanco (o negro) es una señal de confianza y calidad.

**Señales de "espacio insuficiente" en el diseño de Alumfer:**
- Texto demasiado cerca de los bordes del frame
- Dos elementos diferentes tocándose sin separación entre ellos
- Un slide de carrusel que tiene 6 o más elementos distintos
- Texto muy pequeño para entrar toda la información en el espacio disponible

**Regla de crowding:** Si hay que reducir el tamaño de la tipografía para que "entre todo", hay demasiada información. Reducir el contenido, no el espacio.

---

## Grids Recomendados

### Para reels y stories (1080 × 1920):

Grid de 12 columnas × 8 filas.
Cada columna: 72px de ancho con gutters de 24px.

Texto y elementos: alineados a la grilla.
El plano fotográfico: siempre sangra al borde completo de la pantalla (no se recorta artificialmente).

### Para carruseles (1080 × 1350):

Grid de 12 columnas × 6 filas.
Cada columna: 72px con gutters de 24px.

Los elementos de texto siempre respetan el margen de 72px lateral.
Las imágenes pueden sangrar hasta el borde cuando son el elemento dominante.
