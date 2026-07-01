# Skill: Motion Design

> Principios de motion para reels de Alumfer

---

## Descripción del Skill

Guía de decisiones de motion design para los reels de Alumfer. No requiere software específico — son principios que aplican a cualquier herramienta de edición (CapCut, Premiere, DaVinci, After Effects). El motion de Alumfer comunica: precisión, calidad, solidez. Nunca: caos, exceso, velocidad sin sentido.

---

## INPUT

- Archivo de video en bruto o secuencia de fotos
- Duración objetivo del reel
- Tipo de contenido: proceso / resultado / transformación / técnico
- Nivel de producción disponible: básico (CapCut) / medio (Premiere) / avanzado (AE)

---

## PROCESS

### Fase 1 — Definir la energía visual del reel

Antes de cortar o animar nada, definir qué energía debe transmitir:

| Tipo de contenido | Energía | Ritmo |
|---|---|---|
| Resultado de obra premium | Calma, peso, solidez | Lento-medio (cortes cada 3-5s) |
| Proceso de fábrica | Precisión, control | Medio (cortes cada 1.5-2.5s) |
| Transformación antes/después | Contraste, revelación | Variable: lento el antes, impacto en el after |
| Dato técnico / educativo | Claridad, autoridad | Estático o con tipografía animada |

### Fase 2 — Decidir los movimientos de cámara en post

Para material grabado sin movimiento intencional, el motion en edición puede simular cámara:

**Ken Burns (zoom lento):** Para fotos estáticas de resultado. Escala desde 100% a 105% en 4-6 segundos. Da vida sin distraer.

**Crop inteligente:** Para video con demasiado espacio vacío. Reencuadrar en post acerca el elemento principal.

**Parallax de capas:** Para before/after con dos imágenes. La capa de fondo se mueve más lento que el primer plano (efecto profundidad).

### Fase 3 — Transiciones

**Regla de oro de Alumfer:** Menos transiciones = más premium.

Las transiciones que usamos:
- **Corte directo:** Para cambios de ritmo intencionales. El estándar.
- **Dissolve (fade de 8-12 frames):** Para pasar de proceso a resultado. Suaviza el salto.
- **Match cut:** Cuando dos planos tienen forma o dirección similar. El corte más elegante.
- **Push horizontal:** Solo para antes/después. La nueva imagen "empuja" a la vieja.

Las transiciones que NO usamos:
- Glitch / distorsión digital
- Zoom de impacto con efecto de cámara shake
- Transition packs de redes sociales (efecto CapCut masivo)
- Rotación o flip sin justificación narrativa

### Fase 4 — Tipografía animada

Cuando hay texto en pantalla:

**Entrada:** Fade up (aparece subiendo levemente) o fade simple. Sin rebote, sin elasticidad.

**Tipografía en pantalla:**
- Montserrat 600 para datos técnicos y títulos de contexto
- Inter 400 para copy explicativo secundario
- Tamaño: que se lea sin esfuerzo en mobile, sin tapar la imagen principal

**Timing:** El texto aparece 0.5s después del corte al plano que lo acompaña. Sale 0.5s antes del siguiente corte.

**Color de texto:**
- Blanco puro (#FFFFFF) sobre fondos oscuros (Carbon / Steel)
- Carbon (#1A1C1E) sobre fondos claros o Concrete
- Nunca texto en Concrete sobre fondo claro (bajo contraste)
- El Blue (#1B6CC8) solo para elementos de énfasis, nunca para bloques de texto

### Fase 5 — Color Grade

El color de los reels de Alumfer sigue la paleta de marca sin forzarla:

**Grade base recomendado:**
- Reducir saturación un 10-15% respecto al original
- Levantar ligeramente las sombras (no crush negro total, pero sí peso)
- Temperatura: ligeramente más fría (más azul/gris) para acero y aluminio
- Skin tones si hay personas: protegerlos, no colorear encima

**Lo que nunca:**
- Filtro naranja-teal (el "filtro de película" genérico)
- Saturación elevada que haga lucir el metal plástico
- Exposición quemada (sobreexpuesto) que destruya el detalle del material

---

## OUTPUT

- Brief de motion para el editor: energía, ritmo, transiciones, grade
- Lista de decisiones tipográficas por plano
- Referencia de color grade en valores HEX o LUT si existe

---

## QUALITY CRITERIA

| Criterio | Test |
|---|---|
| Ritmo coherente | ¿El timing de cortes refuerza la emoción objetivo? |
| Transiciones | ¿Cada transición tiene una razón narrativa? |
| Tipografía legible | ¿El texto se lee en 3 segundos en mobile? |
| Color en paleta | ¿Los tonos son coherentes con Carbon/Steel/Concrete? |
| Motion mínimo | ¿Cada elemento animado justifica su animación? |

---

## ANTI-PATTERNS

- **Más de 3 tipos de transición en un mismo reel**
- **Texto con sombra paralela gruesa (shadow agresivo)**
- **Efectos de "cámara temblada" sin que sea footage real con movimiento**
- **Grade naranja-teal en material de aluminio** — destruye el metal y lo hace ver plástico
- **Zoom de impacto en el primer frame** — el gancho de energía debe venir de la imagen, no del efecto
- **Lower thirds de televisión** — los localizadores de zona van en texto simple, no en banners con degradado

---

## EXAMPLES

### Motion brief: Reel de transformación de ventanas (30s)

```
ENERGÍA: Calma con revelación
RITMO: Planos de 3-4s en proceso, 5-6s en resultado

PLANO 1 [0-3s]: Foto ANTES — Ken Burns muy sutil (100→102%), fade up del texto "Antes"
PLANO 2 [3-6s]: Video instalación — corte directo, sin transición
PLANO 3 [6-10s]: Video proceso sellado — corte directo
PLANO 4 [10-18s]: Resultado — Ken Burns (100→104%), texto "DVH • Quilmes" aparece a los 11s
PLANO 5 [18-26s]: Detalle del cierre — lento, sin texto
PLANO 6 [26-30s]: Logo + barrio — fade out al negro en 28s

TRANSICIONES: Solo fade de 8 frames entre PLANO 1 y PLANO 2 (contraste old/new)
TIPOGRAFÍA: Montserrat 600, blanco, alineado izquierda-inferior
COLOR: Grade frío, sombras levantadas al 15%, saturation -12
```
