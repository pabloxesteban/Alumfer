# Sistema Tipográfico — Alumfer

> Escala tipográfica completa, pesos, y usos por contexto.

---

## Las dos familias tipográficas

### Montserrat — Títulos y Datos de Alto Impacto

**Uso:** Encabezados, datos numéricos de impacto, CTAs principales, texto en pantalla de reels (información clave).

**Peso principal:** 600 (SemiBold)
**Pesos adicionales:** 700 (Bold) solo para números o datos únicos de énfasis extremo.

**Por qué Montserrat:**
Montserrat tiene la geometría limpia de la tipografía industrial contemporánea. Sus formas son directas, sin serif, con una estructura que comunica precisión. Es la tipografía que usan los estudios de arquitectura premium de América Latina. Refuerza el territorio "industrial elegante."

**Lo que nunca:**
- Montserrat 300 o 400 para títulos — pierde el peso
- Montserrat en itálica — no está en el sistema
- Montserrat para cuerpo de texto largo — fatigante en bloques

---

### Inter — Cuerpo y Textos Funcionales

**Uso:** Cuerpo de texto (captions de Instagram, documentos de presupuesto, mensajes de WhatsApp formateados), subtítulos de apoyo, textos de soporte.

**Pesos:**
- 300 (Light): texto de apoyo, notas al pie, captions muy largas donde se necesita aireación
- 400 (Regular): cuerpo principal de texto
- 500 (Medium): subtítulos, pequeños énfasis dentro del cuerpo
- 600 (SemiBold): énfasis de datos, pequeños títulos de sección dentro de cuerpo

**Por qué Inter:**
Inter fue diseñada específicamente para pantallas digitales. Tiene spacing optimizado para legibilidad en mobile — el contexto principal de lectura de Instagram. Su neutralidad la hace invisible como tipografía (el objetivo del cuerpo de texto).

**Lo que nunca:**
- Inter 700 o 800 — ese peso lo tiene Montserrat
- Inter para títulos principales — pierde el impacto
- Inter 300 para textos de 10pt o menos — pierde legibilidad

---

## Escala Tipográfica

Para uso en diseño digital (reels, stories, documentos):

| Nombre | Fuente | Peso | Tamaño (px) | Uso |
|---|---|---|---|---|
| Display | Montserrat | 700 | 72-96px | Número o dato único de máximo impacto |
| H1 | Montserrat | 600 | 48-60px | Título principal de reel o slide |
| H2 | Montserrat | 600 | 36-42px | Subtítulo de sección en carrusel |
| H3 | Montserrat | 600 | 28-32px | Encabezado de ítem en carrusel |
| Data | Montserrat | 600 | 24-28px | Datos numéricos (no el número principal) |
| Body | Inter | 400 | 18-20px | Cuerpo de texto en slides y documentos |
| Body Small | Inter | 400 | 16px | Texto secundario, explicaciones |
| Caption | Inter | 300 | 14px | Notas, referencias, texto muy secundario |
| Label | Inter | 500 | 12px | Etiquetas, tags, metadatos |

**Nota para reels en mobile:** En pantalla de 390px de ancho (iPhone 14), el texto de Reel debe ser:
- Título en pantalla: mínimo 48px para lectura cómoda
- Dato de apoyo: mínimo 32px
- Logo/marca: mínimo 24px

---

## Usos por Contexto

### Reels — Texto en pantalla

```
TIPO DE DATO         FUENTE         PESO   TAMAÑO
─────────────────────────────────────────────────
Número de impacto    Montserrat     700    80-96px
Dato principal       Montserrat     600    60-72px
Contexto del dato    Montserrat     600    32-40px
Información de zona  Inter          400    24-28px
Logo / Marca         Montserrat     600    20-24px
```

**Regla de legibilidad:** Si el texto no se lee en 3 segundos viendo el reel en mobile, es demasiado pequeño.

---

### Instagram Stories — Texto en pantalla

```
TIPO DE DATO         FUENTE         PESO   TAMAÑO
─────────────────────────────────────────────────
Pregunta / gancho    Montserrat     600    52-64px
Explicación          Inter          400    28-32px
CTA (ej: "Swipe")   Montserrat     600    24-28px
```

---

### Documentos (Presupuesto, Brief)

```
TIPO DE DATO         FUENTE         PESO   TAMAÑO
─────────────────────────────────────────────────
Nombre del cliente   Montserrat     600    18-20pt
Título del presup.   Montserrat     600    16-18pt
Sección              Montserrat     600    12pt
Cuerpo               Inter          400    10-11pt
Notas / aclaraciones Inter          300    9-10pt
Precios / números    Inter          600    10-11pt
```

---

### WhatsApp (mensajes formateados)

WhatsApp tiene formato limitado. El sistema tipográfico aplica a nivel de tono, no de fuente:

- **Negrita** (`*texto*`): para datos clave, nombres de productos, precios
- _Cursiva_ (`_texto_`): uso muy limitado, solo para énfasis emocional específico
- Sin abuso del formato: un WhatsApp bien redactado no necesita negrita en todo

---

## Combinaciones de Color con Tipografía

| Fondo | Tipografía | Contexto |
|---|---|---|
| Carbon `#1A1C1E` | Blanco `#FFFFFF` + Montserrat 600 | Texto de alto impacto en reel |
| Carbon `#1A1C1E` | Concrete `#B0A99A` + Inter 400 | Texto de apoyo en reel |
| Foto con overlay Carbon | Blanco `#FFFFFF` + Montserrat 600 | Texto sobre imagen de obra |
| Steel `#2E3338` | Blanco `#FFFFFF` + Inter 400-600 | Documentos y presentaciones |
| Blanco `#FFFFFF` | Carbon `#1A1C1E` + Inter 400 | Versión light de documentos |

---

## Lo que nunca hacemos tipográficamente

- **Mezclar más de 2 familias tipográficas** — solo Montserrat + Inter
- **Texto decorativo o cursivos de fantasía** — fuera del territorio industrial
- **Kerning automático sin ajuste en títulos grandes** — Montserrat en 80px necesita ajuste manual de kern
- **Texto en todas mayúsculas para cuerpo largo** — solo para datos numéricos o labels muy cortos
- **Más de 3 tamaños distintos de tipo en la misma composición** — crea caos visual
- **Alineación centrada para texto de cuerpo** — siempre izquierda, salvo títulos únicos en reel
