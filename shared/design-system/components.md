# Catálogo de Componentes — Alumfer Design System

> Componentes reutilizables del sistema de diseño de Alumfer. Cada componente define sus variantes, estados y reglas de uso.

---

## Nomenclatura

Los componentes siguen la convención: `[Nombre]` con variantes nombradas `[Nombre]--[variante]`.

---

## Componente 01 — Logo

### Descripción
El logotipo de Alumfer en sus versiones oficiales.

### Variantes

**Logo Completo — Dark** (fondo oscuro)
- Sobre Carbon `#1A1C1E` o Steel `#2E3338`
- El texto "ALUMFER" en Montserrat 600, blanco
- El símbolo (si existe) en Blue `#1B6CC8`

**Logo Completo — Light** (fondo claro)
- Sobre blanco `#FFFFFF` o Concrete `#B0A99A`
- El texto "ALUMFER" en Carbon `#1A1C1E`
- El símbolo en Blue `#1B6CC8`

**Logo Solo Símbolo**
- Para usos donde el espacio es muy reducido (avatar de Instagram, favicon)
- Tamaño mínimo: 32px × 32px

### Reglas de uso

- El logo nunca aparece al inicio de un reel — solo al final
- Tamaño mínimo del logo completo: 120px de ancho
- Siempre respetar zona de exclusión de 16px alrededor del logo
- No distorsionar, rotar, ni cambiar colores del logo

---

## Componente 02 — Text Card

### Descripción
Card de texto para texto en pantalla en reels, slides de carrusel, y documentos.

### Variantes

**Text Card — Dark**
```
Fondo: Carbon #1A1C1E (con opacidad 80-100%)
Padding: 20px 24px
Border radius: 4px
Tipografía: Montserrat 600 (título) + Inter 400 (cuerpo)
Color de texto: Blanco #FFFFFF
```

**Text Card — Overlay**
```
Fondo: Carbon #1A1C1E con opacidad 70%
Posición: Over la imagen (para texto sobre fotos)
Padding: 16px 20px
Tipografía: Montserrat 600, Blanco
```

**Text Card — Minimal**
```
Sin fondo — solo texto con sombra de texto sutil
Uso: cuando la imagen de fondo tiene suficiente contraste
Tipografía: Montserrat 600, Blanco
Text-shadow: 0 2px 8px rgba(0,0,0,0.5)
```

### Reglas de uso

- No usar más de una variante de Text Card en el mismo reel
- El Card de Overlay siempre tiene la opacidad suficiente para garantizar legibilidad (ratio mínimo de contraste 4.5:1)

---

## Componente 03 — Location Tag

### Descripción
Etiqueta de ubicación geográfica. Aparece en reels y fotos para establecer el territorio.

### Anatomía

```
[ • Barrio, Zona Sur GBA ]
```

**Ícono:** punto sólido (•) en Blue `#1B6CC8`
**Texto:** "Barrio, Zona Sur GBA" en Inter 500, Concrete `#B0A99A` o Blanco según el fondo
**Tamaño:** 14-16px
**Padding:** 6px 12px

### Variante Dark
```
Fondo: Steel #2E3338 con opacidad 90%
Texto: Concrete #B0A99A
Punto: Blue #1B6CC8
Border radius: 20px (pill shape)
```

### Variante Minimal
```
Sin fondo
Texto: Blanco #FFFFFF
Punto: Blue #1B6CC8
Posición: sobre imagen, esquina inferior izquierda
```

### Reglas de uso

- Siempre aparece en la misma posición: esquina inferior izquierda del frame
- No combinar con el Logo en la misma esquina
- Texto máximo: "Barrio · Provincia" (no más de 3 palabras)

---

## Componente 04 — CTA Button

### Descripción
Botón de llamado a la acción. Uso principalmente en diseño web y documentos.

### Variante Principal (Primary)

```css
background-color: #1B6CC8;  /* Blue */
color: #FFFFFF;
font-family: Montserrat, sans-serif;
font-weight: 600;
font-size: 16px;
padding: 14px 28px;
border-radius: 4px;
border: none;
letter-spacing: 0.02em;
```

**Hover state:**
```css
background-color: #1559A0;  /* Blue 10% más oscuro */
transition: background-color 200ms ease-out;
```

### Variante Secundaria (Outline)

```css
background-color: transparent;
color: #FFFFFF;
border: 2px solid #FFFFFF;
font-family: Montserrat, sans-serif;
font-weight: 600;
font-size: 16px;
padding: 12px 26px;
border-radius: 4px;
```

### Variante Ghost (para fondos claros)

```css
background-color: transparent;
color: #1A1C1E;  /* Carbon */
border: 2px solid #1A1C1E;
```

### Reglas de uso

- El texto del CTA nunca usa exclamación
- Máximo 4 palabras en el texto del botón
- No usar más de 1 CTA Principal por sección

---

## Componente 05 — Divider

### Descripción
Línea divisora para separar secciones en documentos y slides.

### Variantes

**Divider Heavy**
```css
height: 2px;
background-color: #2E3338;  /* Steel */
margin: 32px 0;
```

**Divider Light**
```css
height: 1px;
background-color: #B0A99A;  /* Concrete con 30% opacidad */
margin: 16px 0;
```

**Divider Blue**
```css
height: 2px;
width: 48px;  /* No ocupa todo el ancho — elemento de énfasis */
background-color: #1B6CC8;  /* Blue */
margin: 0 0 24px 0;
```

El Divider Blue se usa como decorador antes de un título principal — no como separador de secciones.

---

## Componente 06 — Data Highlight

### Descripción
Componente para destacar un dato numérico de alto impacto en reels y slides.

### Anatomía

```
[ NÚMERO GRANDE ]
[ contexto en texto pequeño ]
```

Ejemplo:
```
      6°
  de diferencia
```

### Especificaciones

```
Número:  Montserrat 700, 80-96px, Blanco #FFFFFF
Contexto: Montserrat 600, 24-28px, Concrete #B0A99A
Alineación: centrado (solo en este componente se acepta centrado)
Espacio entre número y contexto: 8px
```

### Reglas de uso

- Un solo Data Highlight por composición
- El número siempre es la referencia que interesa al cliente (grados, años, metros, porcentaje)
- El contexto siempre traduce el número a beneficio (no solo "6°" — sino "de diferencia" o "más cálido")

---

## Componente 07 — Before/After Frame

### Descripción
Composición de antes/después para mostrar transformaciones de obra.

### Estructura

```
[ IMAGEN ANTES ] → [ transición Push ] → [ IMAGEN DESPUÉS ]
```

O en formato split estático:

```
[ IMAGEN ANTES | IMAGEN DESPUÉS ]
     "Antes"  |   "Después"
```

### Especificaciones del split estático

- Línea divisora central: 2px, Blanco `#FFFFFF`
- Label "Antes": Inter 500, 14px, Blanco, esquina superior izquierda
- Label "Después": Inter 500, 14px, Blanco, esquina superior derecha
- Ambas imágenes con el mismo color grade (no una tratada y otra no)

### Reglas de uso

- El "Antes" siempre a la izquierda
- Si el estado previo es muy malo visualmente (construcción deteriorada), mostrar con la misma calidad fotográfica que el después — no "apagar" el antes con edición descuidada

---

## Componente 08 — Caption Template

Ver `creative/templates/caption-structure.md` para el componente completo de caption.

**Referencia rápida:**
```
[Primera línea — Gancho]

[Cuerpo — máx 3 párrafos de 1-3 líneas]

[CTA — 1 línea]

[Hashtags — al final, máx 15]
```

---

## Versioning del Design System

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2024 | Sistema inicial: tokens de color, tipografía, spacing, animación, motion, componentes base |

Para proponer cambios al design system, crear un issue documentando: el componente afectado, el cambio propuesto, la justificación en términos de identidad de marca, y el impacto en piezas existentes.
