# El Creative Loop — Proceso No Lineal

> Reemplaza el pipeline lineal de V1.
> No es una línea de A a B. Es un ciclo de divergencia y convergencia que solo termina cuando la idea es imposible de ignorar.

---

## Forma del loop

```
        ╔═══════════════════ DIVERGIR (explorar en exceso) ══════════════════╗
        ║                                                                     ║
   COMPRENDER  ──▶  GENERAR  ──▶  MEZCLAR  ──▶  CRITICAR  ──▶  PUNTUAR        ║
   persona +        50+ conceptos  combinar    destruir       viral score     ║
   estrategia       50-100 hooks   variantes   cada idea      0-100           ║
        ▲                                                        │            ║
        ║                                                        ▼            ║
        ║                                              ¿supera el gate?        ║
        ║                                              NO ──▶ ITERAR ─────────╝
        ║                                              (vuelve con lo aprendido)
        ║                                                        │ SÍ
        ╚════════════════════════════════════════════════════════▼════════════
                          CONVERGER (elegir y ejecutar)
                   ESTRUCTURAR ──▶ ESCRIBIR ──▶ AUDITAR ──▶ DOCUMENTAR
                   story arch.     copywriter   guardian     memoria
```

La regla que hace que esto funcione: **la divergencia es obligatoria y desproporcionada**. Se generan decenas de ideas para usar una. El desperdicio es el mecanismo, no un defecto.

---

## Fase 0 — CARGAR MEMORIA (antes de todo)

Antes de la primera idea, el Orchestrator lee la memoria creativa relevante para no repetir ni empezar de cero:

- `knowledge/creative-rules/` → reglas aprendidas que aplican a este tipo de pieza.
- `knowledge/hooks/` → qué hooks ya se usaron (para no repetir) y cuáles rindieron.
- `knowledge/successful-content/` y `failed-content/` → qué funcionó y qué murió.
- `knowledge/psychology/` → perfiles de audiencia ya construidos.
- `knowledge/swipe-file/` → referencias externas para robar estructura (no copiar).

**Salida:** un resumen de "lo que ya sabemos" que condiciona toda la exploración.

---

## Fase 1 — COMPRENDER (nunca escribir todavía)

Dos agentes, en orden:

1. **Audience Psychologist** construye o actualiza el perfil psicológico del cliente objetivo de esta pieza: qué desea, qué teme, qué evita, qué comparte, qué guarda, qué ignora, qué objeción tiene. Guarda el perfil en `knowledge/psychology/`.

2. **Creative Strategist** decide, a partir del perfil: objetivo de la pieza, emoción a provocar, comportamiento a disparar, patrón a romper, formato conveniente, ángulo tentativo.

**Gate de fase:** si no hay una emoción objetivo clara y una tensión humana real, ITERAR. No se avanza a generar ideas sobre un objetivo difuso.

---

## Fase 2 — GENERAR (explorar en exceso)

En paralelo:

- **Concept Generator** produce **mínimo 50 conceptos**, cada uno desde un ángulo distinto (ver `knowledge/angles/`). Sin filtrar todavía.
- **Hook Generator** produce **50–100 hooks** de tipos variados (curiosidad, polémica, humor, error, mito, dato, comparación, confesión, visual, desafío, contraste, etc.).

Ambos **descartan automáticamente lo promedio** dentro de su propia salida y suben solo el top ~20%.

**Gate de fase:** al menos 5 conceptos no-obvios y 3 hooks que frenan el scroll. Si no, ITERAR con instrucción de forzar ángulos más lejanos.

---

## Fase 3 — MEZCLAR (combinar para crear lo nuevo)

La creatividad real aparece en la combinación. El Orchestrator cruza conceptos entre sí y con hooks de otra categoría para producir **variantes híbridas** que ningún agente propuso solo. Ejemplos de operación:

- Concepto A (proceso de taller) × Hook de confesión → "Lo que no te decimos cuando pedís presupuesto."
- Concepto B (dato de aislación) × Ángulo de error frecuente → "El error que te va a hacer pagar dos veces la misma ventana."

**Salida:** 8–12 finalistas combinados, mejores que cualquier idea individual.

---

## Fase 4 — CRITICAR (destruir)

Cada finalista pasa por el **Creative Challenger**, cuyo único trabajo es demoler:

- ¿Por qué esta idea sería ignorada?
- ¿Qué tiene de predecible?
- ¿Qué marca ya hizo esto?
- ¿Qué IA escribiría exactamente lo mismo?
- ¿Cómo se hace 10x mejor?

El Challenger **no puede aprobar nada**. Si una idea sobrevive intacta, no fue bien atacada. La crítica alimenta una última ronda de mejora de los finalistas.

---

## Fase 5 — PUNTUAR (aplicar el gate)

El **Viral Reviewer** puntúa cada finalista sobrevivente 0–100 según los 10 factores (ver `quality-gates.md`). Solo pasan los que superan el umbral.

**Bifurcación crítica:**
- Si **ningún** finalista supera el gate → **ITERAR**: volver a Fase 2 con todo lo aprendido de por qué fallaron. Este es el corazón anti-genérico del sistema: es normal dar 2–3 vueltas.
- Si uno o más superan → el Orchestrator elige el ganador y se pasa a converger.

---

## Fase 6 — CONVERGER (recién ahora se escribe)

1. **Story Architect** convierte el concepto ganador en una estructura narrativa (nunca una lista de información).
2. El Orchestrator **elige el copywriter especialista** según la emoción objetivo.
3. El copywriter escribe el guión/caption final sobre la estructura.
4. **Brand Guardian** audita la salida (voz, identidad, riesgo).

---

## Fase 7 — DOCUMENTAR (cerrar el ciclo)

- La decisión creativa se guarda en `knowledge/creative-decisions/`: qué se eligió, qué se descartó y por qué.
- Los hooks nuevos que valieron la pena se archivan en `knowledge/hooks/`.
- La pieza queda lista para producción con su predicción de performance, que después se contrastará en `learning/`.

---

## Condiciones de salida del loop

El loop termina **solo** si se cumplen las tres:

1. Hay un ganador con score sobre el gate del Viral Reviewer.
2. El Challenger no encuentra una razón fuerte para ignorarlo.
3. El Orchestrator no puede imaginar una versión 10x mejor en este momento.

Si alguna falla, el loop sigue. No hay entrega por cansancio.

---

## Presupuesto de iteración

Para que el sistema sea usable y no infinito:

- **2–3 vueltas** completas es lo esperado y saludable.
- Si a la **4ª vuelta** nada supera el gate, el Orchestrator declara el brief como **no viable**, lo documenta en `knowledge/failed-content/` y devuelve un diagnóstico: el problema no es la ejecución, es el ángulo/tema. Mejor no publicar que publicar algo ignorable.
