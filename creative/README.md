# Alumfer Creative OS

Sistema operativo creativo de Alumfer. Contiene toda la inteligencia de marca, los agentes de contenido, la memoria creativa y los workflows de producción.

**No es el sitio web.** Es el sistema que produce el contenido que alimenta la marca.

> **Creative Intelligence Engine V2** — El núcleo creativo se rediseñó por completo.
> El sistema ya no genera publicaciones: genera ideas que la gente quiere mirar.
> Empezá por [`engine/README.md`](engine/README.md).

---

## Qué cambió: de generador a Director Creativo

| | Antes (V1) | Ahora (V2) |
|---|---|---|
| Filosofía | empezar escribiendo un post | empezar pensando como Director Creativo |
| Proceso | pipeline lineal | loop no lineal: divergir → criticar → converger → iterar |
| Objetivo | producir publicaciones | producir contenido **imposible de ignorar** |
| Exploración | la primera idea | 50+ conceptos y 50–100 hooks antes de escribir |
| Control | consistencia de marca | consistencia **+ crítica adversarial + score viral** |
| Memoria | archivos sueltos | memoria creativa permanente que aprende |
| Mejora | manual | autoaprendizaje: performance → reglas |

El detalle del rediseño y las decisiones técnicas están en [`engine/ARCHITECTURE.md`](engine/ARCHITECTURE.md).

---

## Mapa del sistema

```
creative/
│
├── engine/            ← ⭐ EL NÚCLEO V2 · el Director Creativo que piensa antes de escribir
│   ├── README.md          Visión general del engine
│   ├── ARCHITECTURE.md     Decisiones técnicas del rediseño (ADR)
│   ├── orchestrator.md     Meta-agente que dirige el loop
│   ├── creative-loop.md    El proceso no lineal (diverge/converge/itera)
│   ├── quality-gates.md    Umbrales que toda idea debe superar (Viral Score)
│   ├── prohibitions.md     Lo que el sistema tiene prohibido producir
│   └── north-star-metric.md  "Imposible de ignorar"
│
├── agents/            ← Roles creativos que el engine invoca
│   ├── audience-psychologist.md   Entiende personas (nunca escribe)
│   ├── creative-strategist.md     Decide la jugada creativa de cada pieza
│   ├── hook-generator.md          50–100 hooks, descarta lo promedio
│   ├── concept-generator.md       50+ conceptos, mezcla para crear lo nuevo
│   ├── creative-challenger.md     Solo destruye ideas
│   ├── viral-reviewer.md          Puntúa 0–100, aplica el gate
│   ├── story-architect.md         Convierte la idea en historia
│   ├── copywriters/               7 especialistas (storytelling, humor, premium,
│   │                                ventas, educativo, conversacional, autoridad)
│   └── (V1: creative-director, copywriter, brand-guardian, strategist, ...)  soporte
│
├── knowledge/         ← 🧠 MEMORIA CREATIVA PERMANENTE · lee antes, escribe después
│   ├── viral-patterns/  hooks/  angles/  storytelling/  analogies/  metaphors/
│   ├── psychology/  competitors/  successful-content/  failed-content/  swipe-file/
│   ├── creative-rules/  creative-decisions/
│   └── (V1: apple/aesop/nike/tesla-analysis, design-references, ...)  material sembrado
│
├── learning/          ← ♻️ AUTOAPRENDIZAJE · performance → reglas
│   ├── content-ledger.md    ADN creativo de cada pieza vs. su resultado
│   ├── feedback-loop.md     Cómo la performance modifica el engine
│   └── retrospective.md     Protocolo post-publicación
│
├── brand/             ← Fuente de verdad de identidad (filtro de convergencia)
│   ├── brand-dna.md · voice.md · personality.md · visual-language.md · storytelling.md · ...
│
├── workflows/         ← Procesos de producción
│   ├── creative-engine-v2.md  ⭐ Workflow maestro (de la persona a la pieza)
│   ├── idea-to-reel.md         Producción física (grabación → publicación)
│   └── campaign-planning.md · obra-to-reels.md
│
├── templates/         ← Estructuras reutilizables (hooks, captions, CTA, reels)
│
├── analytics/         ← Frameworks de performance (fuente de señales para learning/)
│
└── content/           ← Contenido en producción (ideas, drafts, aprobados, publicados)
```

---

## Cómo usar el Creative OS (V2)

### Para crear cualquier pieza
Punto de entrada único: **el Orchestrator**. Seguí [`workflows/creative-engine-v2.md`](workflows/creative-engine-v2.md).
Nunca invoques un copywriter directo: el engine decide todo el recorrido (comprender → explorar → criticar → escribir → aprender).

### Para producir físicamente una pieza ya aprobada
Seguí [`workflows/idea-to-reel.md`](workflows/idea-to-reel.md) (grabación, edición, publicación).

### Para aprender de lo publicado
Seguí [`learning/retrospective.md`](learning/retrospective.md) a las 48–72h y en la revisión mensual.

### Para evaluar si una idea es de marca
La marca es el **filtro de convergencia**, no el punto de partida. El engine explora libre y converge dentro del territorio de [`brand/brand-dna.md`](brand/brand-dna.md).

---

## Relación con el sitio web

El Creative OS y el website son independientes:
- **Website** (`apps/website/`) → convierte visitas en consultas
- **Creative OS** (`creative/`) → genera confianza antes de la visita

Comparten la misma identidad visual vía `shared/design-system/`.

---

## Principios rectores

> Nunca empezamos escribiendo. Empezamos pensando.
> Nunca aceptamos la primera idea. La primera idea es la más obvia.
> El objetivo no es llenar un calendario: es que alguien, a mitad del scroll, se detenga.
> El mejor contenido de Alumfer no parece contenido. Parece el registro honesto de un trabajo bien hecho — que además es imposible de ignorar.
