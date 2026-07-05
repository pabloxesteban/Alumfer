# Creative Intelligence Engine V2

> El núcleo creativo del Creative OS.
> No es un generador de contenido. Es un Director Creativo Senior que piensa antes de escribir.

---

## Qué cambió respecto a V1

El Creative OS V1 funcionaba como una **línea de producción**:

```
idea → brief → guión → storyboard → grabación → edición → aprobación → caption → publicación
```

Producía contenido correcto. Pero correcto no es memorable.
El problema no era técnico. Era filosófico: **el sistema empezaba escribiendo.**

El Engine V2 invierte la lógica. **Nunca empieza escribiendo. Siempre empieza pensando.**

```
                      ┌──────────────────────────────────────┐
                      │   ORCHESTRATOR (Director Creativo)     │
                      │   corre el loop, no acepta lo obvio    │
                      └───────────────────┬──────────────────┘
                                          │
        ┌─────────────── DIVERGIR ───────┴──────── CONVERGER ───────────────┐
        │                                                                    │
   comprender          explorar en exceso            destruir           elegir y escribir
   ┌──────────┐   ┌──────────────────────┐    ┌───────────────┐   ┌────────────────────┐
   │ Audience │   │ Concept Generator     │    │ Creative      │   │ Story Architect    │
   │ Psycho-  │──▶│  (50+ conceptos)      │──▶ │ Challenger    │──▶│ + Copywriter       │
   │ logist   │   │ Hook Generator        │    │ (destruye)    │   │   especialista     │
   │          │   │  (50-100 hooks)       │    │ Viral Reviewer│   │   (elegido según   │
   │ Creative │   │ Concept mixing        │    │ (puntúa 0-100)│   │    la pieza)       │
   │ Strategist│  └──────────────────────┘    └───────────────┘   └────────────────────┘
        │                    ▲                        │                      │
        │                    └──────── iterar ◀───────┘                      │
        │                    (si el score no supera el gate, vuelve)         │
        └────────────────────────────────────────────────────────────────────┘
                                          │
                              ┌───────────▼────────────┐
                              │   CREATIVE MEMORY       │
                              │  (knowledge/)           │
                              │  lee antes · escribe    │
                              │  después · nunca        │
                              │  empieza de cero        │
                              └───────────┬────────────┘
                                          │
                              ┌───────────▼────────────┐
                              │   LEARNING LOOP         │
                              │  (learning/)            │
                              │  performance → reglas   │
                              └────────────────────────┘
```

---

## Los 3 principios no negociables

1. **Explorar antes de decidir.** Mínimo 50 conceptos y 50–100 hooks antes de escribir una sola línea de contenido publicable. La primera idea del modelo se descarta por definición: es la más obvia.

2. **Criticar antes de aprobar.** Ninguna idea llega a producción sin pasar por el Creative Challenger (que solo destruye) y el Viral Reviewer (que solo puntúa). El sistema tiene un sesgo estructural hacia el "no".

3. **Aprender siempre.** Cada pieza publicada vuelve al sistema con su resultado real. Ese resultado modifica las reglas creativas. El engine de mañana es distinto al de hoy.

---

## Mapa del engine

| Archivo | Qué hace |
|---|---|
| `orchestrator.md` | El meta-agente Director Creativo. Corre el loop completo y decide cuándo una idea está lista. |
| `creative-loop.md` | El proceso no lineal: divergir → criticar → converger → iterar. Fases, gates y condiciones de salida. |
| `quality-gates.md` | Los umbrales que toda idea debe superar para avanzar. Define qué se descarta automáticamente. |
| `prohibitions.md` | Lo que el sistema tiene prohibido producir. Se chequea en cada fase. |
| `north-star-metric.md` | La métrica única: "imposible de ignorar". Cómo se mide y cómo dispara re-iteración. |
| `ARCHITECTURE.md` | Las decisiones técnicas del rediseño, documentadas (ADR). Por qué el sistema es así. |

---

## Cómo se conecta con el resto del Creative OS

- **`brand/`** sigue siendo la fuente de verdad de identidad. El engine explora con libertad total, pero converge dentro del territorio de marca. La creatividad es la prioridad; la marca es el filtro, no el punto de partida.
- **`agents/`** aloja a los agentes que el orchestrator invoca. Los agentes V1 (brand-guardian, etc.) siguen vivos como control de calidad de salida.
- **`knowledge/`** es la memoria creativa permanente. El engine lee de ahí al empezar y escribe ahí al terminar.
- **`learning/`** cierra el ciclo: convierte performance en reglas.

> Regla de oro del engine: si una idea no obliga a detener el scroll, no existe. Volver a iterar.
