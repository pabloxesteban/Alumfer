# Sistema de Color — Alumfer

> Sistema completo de color con casos de uso, combinaciones permitidas y prohibidas.

---

## Paleta Base

### Carbon — `#1A1C1E`
El color dominante de la marca. Negro con tinte azul-gris industrial.

**Usos correctos:**
- Fondo principal de reels y stories
- Texto sobre fondos claros (Concrete, blanco)
- Overlays semitransparentes sobre fotografías
- Fondo de cards en diseño digital

**Usos incorrectos:**
- Como color de texto sobre Steel (bajo contraste)
- Como overlay opaco sobre imagen de obra (tapa el contenido)

**Valores alternos:**
- HEX: `#1A1C1E`
- RGB: `26, 28, 30`
- HSL: `216°, 7%, 11%`

---

### Steel — `#2E3338`
El gris oscuro secundario. Ligeramente más claro que Carbon, más azulado.

**Usos correctos:**
- Superficies secundarias sobre Carbon (cards, paneles)
- Texto de segundo nivel sobre fondos claros
- Fondos de elementos interactivos (hover states)
- Separadores y bordes sobre Carbon

**Usos incorrectos:**
- Como fondo principal (muy similar a Carbon, crea confusión de jerarquía)
- Como texto sobre Carbon (bajo contraste)

**Valores alternos:**
- HEX: `#2E3338`
- RGB: `46, 51, 56`
- HSL: `210°, 10%, 20%`

---

### Concrete — `#B0A99A`
El color neutro cálido. Beige-gris que evoca hormigón, aluminio envejecido.

**Usos correctos:**
- Texto secundario / subtítulos sobre Carbon o Steel
- Líneas divisoras y elementos gráficos sutiles
- Fondos alternativos para variantes de comunicación (no siempre fondo negro)
- Texto en fotogramas con imagen de fondo (con suficiente contraste)

**Usos incorrectos:**
- Como fondo de texto oscuro (el contraste es insuficiente para textos pequeños)
- Como color de CTA (falta urgencia / énfasis)
- Sobre fondos claros para texto de cuerpo largo (bajo contraste)

**Valores alternos:**
- HEX: `#B0A99A`
- RGB: `176, 169, 154`
- HSL: `39°, 12%, 65%`

---

### Blue — `#1B6CC8`
El azul de acento. El único color "caliente" de la paleta — usado con restricción.

**Usos correctos:**
- CTAs principales (botón de WhatsApp, link principal)
- Énfasis de un dato clave en pantalla (nunca todo el texto)
- Elemento de identidad en el logo
- Un solo elemento por composición cuando se usa en reels

**Usos incorrectos:**
- Como fondo general (rompe la paleta industrial)
- Como color de texto de cuerpo largo (fatiga visual)
- Más de un elemento de color Blue en la misma composición
- Combinado con rojos o naranjas (pierde el efecto de acento)

**Valores alternos:**
- HEX: `#1B6CC8`
- RGB: `27, 108, 200`
- HSL: `212°, 76%, 45%`

---

### Blanco Puro — `#FFFFFF`
Usado específicamente para texto sobre fondos Carbon y Steel.

**Usos correctos:**
- Texto principal sobre Carbon o Steel
- Espacio negativo y separación en diseños densos
- Logo en versión dark background

**Usos incorrectos:**
- Como fondo general (rompe la paleta oscura industrial)
- Como texto sobre Concrete (insuficiente contraste en algunos casos)

---

## Combinaciones Aprobadas

| Fondo | Texto / Elemento | Uso |
|---|---|---|
| Carbon `#1A1C1E` | Blanco `#FFFFFF` | Texto principal en reels y pantallas |
| Carbon `#1A1C1E` | Concrete `#B0A99A` | Texto secundario, subtítulos |
| Carbon `#1A1C1E` | Blue `#1B6CC8` | CTAs, énfasis único |
| Steel `#2E3338` | Blanco `#FFFFFF` | Texto en surfaces secundarias |
| Steel `#2E3338` | Concrete `#B0A99A` | Elementos sutiles sobre surface |
| Blanco `#FFFFFF` | Carbon `#1A1C1E` | Versión light (presupuestos, documentos) |
| Concrete `#B0A99A` | Carbon `#1A1C1E` | Uso muy limitado, no para texto largo |
| Imagen fotográfica | Blanco `#FFFFFF` + sombra | Texto sobre fotos con alta variabilidad de fondo |

---

## Combinaciones Prohibidas

| Combinación | Por qué está prohibida |
|---|---|
| Steel sobre Carbon (texto) | Contraste insuficiente (ratio < 3:1) |
| Concrete sobre Blanco (texto) | Contraste insuficiente para texto pequeño |
| Blue como fondo general | Destruye el territorio industrial |
| Dos colores Blue en la misma composición | Pierde el efecto de énfasis único |
| Rojo o naranja de cualquier tipo | Fuera de la paleta — no usar bajo ningún contexto |
| Filtros saturados sobre fotografías de obra | Destruye la paleta natural del aluminio y el hormigón |

---

## Color Grade en Fotografía y Video

Las fotos de obra de Alumfer deben seguir estos parámetros de edición:

- **Saturación:** -10% a -15% respecto al original (colores menos saturados = más peso)
- **Temperatura:** Ligeramente más fría (hacia los azules-grises, no naranja-teal)
- **Sombras:** Levantadas al 10-15% (no crush negro total, las sombras tienen detalle)
- **Luces:** Controladas, sin sobre-exposición que destruya el detalle del aluminio
- **Contraste:** Medio-alto, pero siempre con detalle recuperado en sombras y luces

**Color grade prohibido:**
- Orange & Teal (el filtro de cine genérico) — convierte el aluminio en plástico naranja
- Preset de "película" con viñeta fuerte — territorio equivocado para una marca industrial
- Saturación elevada para hacer los colores "más vivos" — los materiales de Alumfer no son "vivos"

---

## Jerarquía de Uso del Color

```
Carbon (dominante) ─── 60% del espacio visual
Steel (secundario) ─── 20% del espacio visual
Concrete (neutro) ─── 15% del espacio visual
Blue (acento) ──────── 5% del espacio visual — máximo un elemento por composición
```

Esta jerarquía aplica a:
- Composición de reels y stories
- Diseño de presentaciones
- Documentos de presupuesto
- Cualquier material de comunicación visual
