# Analytics: Performance por Plantilla

> Cierra el loop del sistema: correlaciona **qué plantilla se usó** con **cómo funcionó la publicación**, para aprender cuáles convierten mejor y priorizarlas.

Este archivo extiende `content-evaluation.md` y `success-patterns.md` con la dimensión que el módulo de exportación hace posible: cada pieza publicada ahora tiene un Content Package trazable (con su `metadata.json` y su plantilla).

---

## Por qué ahora es posible

Antes, "qué funcionó" se evaluaba por tipo de contenido a ojo. Con el Content Package, cada publicación queda ligada a datos estructurados:
- La **plantilla** usada (`instagram-carousel`, `before-after`, `educativo`…).
- El **objetivo** y **embudo** (`metadata.objective`, `funnelStage`).
- La **campaña** (`metadata.campaign.id`).
- El **tipo de publicación**, ratio y nº de slides.

Eso permite responder con datos: *"los carruseles `educativo` generan 3× más guardados que los `promo`, pero los `before-after` generan más DMs"*.

---

## Modelo de registro por publicación

Cada post publicado registra un objeto de performance ligado a su `packageId` y plantilla. Formato sugerido (`content/published/<packageId>.performance.json`):

```jsonc
{
  "packageId": "CP-20260701-instagram-dvh-quilmes-v1",
  "template": "instagram-carousel",
  "publishedAt": "2026-07-03T19:00:00-03:00",
  "objective": "generar-consultas",
  "funnelStage": "consideracion",
  "campaign": "invierno-2026",
  "metrics": {
    "reach": 0,
    "impressions": 0,
    "ctr": 0,
    "saves": 0,
    "shares": 0,
    "comments": 0,
    "engagement": 0,
    "conversions": 0
  },
  "businessMetrics": {
    "dmsFromPost": 0,
    "whatsappClicks": 0,
    "consultasAtribuidas": 0
  },
  "notes": ""
}
```

Las métricas pedidas por el sistema —**alcance, impresiones, CTR, guardados, compartidos, comentarios, engagement, conversiones**— más las métricas de negocio de Alumfer (DMs, clics a WhatsApp, consultas atribuidas), que son las que realmente importan (`content-evaluation.md`).

---

## Cómo se relaciona con la plantilla (aprendizaje)

### Agregación por plantilla (mensual)

```
PLANTILLA           | Posts | Alcance prom | Guardados prom | DMs prom | Conversiones
────────────────────────────────────────────────────────────────────────────────────
instagram-carousel  |   —   |      —       |       —        |    —     |      —
before-after        |   —   |      —       |       —        |    —     |      —
educativo           |   —   |      —       |       —        |    —     |      —
faq                 |   —   |      —       |       —        |    —     |      —
testimonial         |   —   |      —       |       —        |    —     |      —
comparativa         |   —   |      —       |       —        |    —     |      —
```

### Preguntas que responde
1. ¿Qué plantilla genera más **consultas** (la métrica de negocio primaria)?
2. ¿Qué plantilla genera más **guardados** (intención futura)?
3. ¿Qué plantilla funciona mejor por **objetivo** (alcance vs. engagement vs. consultas)?
4. ¿Hay plantillas que tienen mucho alcance pero **cero consultas** (entretienen pero no convierten)?
5. ¿Qué combinación **plantilla + campaña + estación** rindió mejor?

---

## Ciclo de aprendizaje

```
Publicar (con Content Package trazable)
    ↓
Registrar performance ligada a packageId + plantilla
    ↓
Agregar por plantilla al cierre del mes
    ↓
Actualizar el ranking de plantillas
    ↓
Alimentar la selección: priorizar plantillas ganadoras en el próximo calendario
    ↓
(vuelve a campaign-planning.md)
```

Este ranking es un **input directo** del `Paso 2` de `workflows/campaign-planning.md` (definición del mix de contenido) y refina la lógica de `shared/mappers/template-selection.md` con evidencia real.

---

## Ranking de Plantillas (actualizar mensualmente)

```
PLANTILLAS QUE MÁS CONSULTAS GENERARON ESTE MES:
1. [plantilla] — [consultas aprox] — [por qué funcionó]
2. [plantilla] — [consultas aprox]
3. [plantilla] — [consultas aprox]

PLANTILLA CON MEJOR RATIO CONSULTAS/ALCANCE: [plantilla]
PLANTILLA CON MÁS GUARDADOS (intención futura): [plantilla]

PLANTILLA A DESPRIORIZAR: [la que tuvo alcance sin consultas]

NUEVA HIPÓTESIS A TESTEAR EL PRÓXIMO MES:
[ej: "probar 'comparativa' para posicionamiento de DVH vs vidrio simple"]
```

---

## Nota de privacidad y alcance
Las métricas se registran de forma agregada, sin datos personales de quienes consultan. El objetivo es aprender qué **formato** comunica mejor el trabajo de Alumfer, no perfilar personas.
