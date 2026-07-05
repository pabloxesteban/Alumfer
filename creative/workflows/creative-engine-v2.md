# Workflow: Creative Engine V2 — De la Persona a la Pieza Imposible de Ignorar

> El workflow maestro de V2. Reemplaza el pipeline lineal de `idea-to-reel.md`.
> No es una línea. Es un loop que solo termina cuando la idea es imposible de ignorar.

---

## Cuándo usar este workflow
Siempre que se quiera crear una pieza nueva (reel, carrusel, historia, campaña). El punto de entrada es **siempre el Orchestrator**, nunca un copywriter directo.

## Diferencia con `idea-to-reel.md` (V1)
`idea-to-reel.md` describe la **producción física** (grabación, edición, publicación) y se mantiene como referencia para esas etapas. Este workflow describe la **generación creativa** que ocurre ANTES: el pensamiento que decide qué vale la pena producir. Se encadenan así:

```
creative-engine-v2.md (pensar y decidir)  ──▶  idea-to-reel.md (producir y publicar)
```

---

## El recorrido completo

### FASE 0 · Cargar memoria
**Agente:** Orchestrator
Lee `knowledge/creative-rules/` (siempre), más `hooks/`, `angles/`, `psychology/`, `successful-content/`, `failed-content/`, `swipe-file/` relevantes.
**Salida:** resumen de "lo que ya sabemos" que condiciona la exploración.

### FASE 1 · Comprender (nunca escribir todavía)
**Agentes:** Audience Psychologist → Creative Strategist
- El Psychologist construye/actualiza el perfil (tensión central, deseos, miedos, gatillos). Guarda en `knowledge/psychology/`.
- El Strategist define objetivo, **una** emoción dominante, ángulo tentativo, patrón del rubro a romper, sorpresa, formato.
**Gate:** ¿hay emoción objetivo clara y tensión humana real? Si no → ITERAR.

### FASE 2 · Generar (explorar en exceso)
**Agentes en paralelo:** Concept Generator (≥50 conceptos) + Hook Generator (50–100 hooks)
Cada uno autofiltra y sube solo su top ~20%.
**Gate:** ≥5 conceptos no-obvios y ≥3 hooks que frenan. Si no → ITERAR forzando ángulos más lejanos.

### FASE 3 · Mezclar
**Agente:** Concept Generator (a pedido del Orchestrator)
Cruza conceptos entre sí y con hooks de otra categoría → 8–12 finalistas híbridos, mejores que sus partes.

### FASE 4 · Criticar (destruir)
**Agente:** Creative Challenger
Demuele cada finalista (¿por qué se ignoraría? ¿qué IA lo escribiría? ¿cómo 10x?). Ninguno sale intacto: o muere o mejora.

### FASE 5 · Puntuar (aplicar el gate)
**Agente:** Viral Reviewer
Puntúa 0–100 cada sobreviviente. Aplica kill-switches.
**Bifurcación:**
- Ningún finalista ≥ 80 → **ITERAR** a Fase 2 con el diagnóstico. (2–3 vueltas es normal y saludable.)
- Al menos uno ≥ 80 → el Orchestrator elige el ganador.
- 4ª vuelta sin éxito → brief **no viable**: documentar en `failed-content/` y frenar. Mejor no publicar que publicar algo ignorable.

### FASE 6 · Converger (recién ahora se escribe)
**Agentes:** Story Architect → Copywriter especialista → Brand Guardian
1. Story Architect convierte el ganador en estructura narrativa (nunca lista).
2. Orchestrator elige el copywriter según la emoción (ver `agents/copywriters/README.md`).
3. El copywriter viste el esqueleto con el hook ganador.
4. Brand Guardian audita voz, identidad, riesgo (≥ 4/5).

### FASE 7 · Documentar y entregar
**Agente:** Orchestrator
- Guarda la decisión en `knowledge/creative-decisions/`.
- Archiva los hooks nuevos en `knowledge/hooks/`.
- Entrega el **paquete creativo** completo (ver `engine/orchestrator.md`).
**→ La pieza pasa a producción física vía `workflows/idea-to-reel.md`.**

### FASE 8 · Aprender (después de publicar)
**Proceso:** `learning/retrospective.md`
- Carga resultado real en `learning/content-ledger.md`.
- Contrasta predicción vs. realidad.
- Actualiza reglas, pesos y perfiles vía `learning/feedback-loop.md`.
**→ El engine cambió. La próxima pieza se crea mejor.**

---

## Diagrama del loop

```
        ┌─────────────────────── ITERAR (2-3 vueltas normales) ───────────────────┐
        │                                                                          │
   [0] MEMORIA → [1] COMPRENDER → [2] GENERAR → [3] MEZCLAR → [4] CRITICAR → [5] PUNTUAR
                                                                                   │
                                                    ¿algún finalista ≥ 80? ────────┤
                                                              │ SÍ                  │ NO (4ª vuelta)
                                                              ▼                     ▼
                                              [6] CONVERGER → [7] DOCUMENTAR    brief NO VIABLE
                                                              │                (failed-content/)
                                                              ▼
                                                    producción (idea-to-reel.md)
                                                              │
                                                              ▼
                                              [8] APRENDER (learning/) ──▶ el engine mejora
```

---

## Roles en una tabla

| Fase | Agente | Output | Gate para avanzar |
|---|---|---|---|
| 0 | Orchestrator | resumen de memoria | — |
| 1 | Psychologist + Creative Strategist | perfil + dirección creativa | emoción + tensión claras |
| 2 | Concept + Hook Generator | 50+ conceptos, 50-100 hooks | 5 conceptos / 3 hooks que frenan |
| 3 | Concept Generator | 8-12 híbridos | mejores que sus partes |
| 4 | Creative Challenger | crítica demoledora | ninguno intacto |
| 5 | Viral Reviewer | scores + ranking | ≥1 con ≥80 (o iterar) |
| 6 | Story Architect + Copywriter + Brand Guardian | pieza escrita | Guardian ≥4/5 |
| 7 | Orchestrator | paquete creativo + decisión | — |
| 8 | (retrospectiva) | aprendizaje aplicado | ledger completo |

---

## Principio del workflow
> Nunca empezamos escribiendo. Empezamos entendiendo a la persona, exploramos en exceso, destruimos lo tibio, y recién escribimos lo que sobrevive. Después medimos y aprendemos. Ese es el trabajo de un Director Creativo Senior, no de un generador de contenido.
