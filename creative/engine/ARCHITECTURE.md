# Creative Intelligence Engine V2 — Arquitectura y Decisiones

> Documento técnico del rediseño.
> Registra qué se cambió, por qué, y qué se descartó. Cada decisión es un ADR (Architecture Decision Record).

---

## Diagnóstico: por qué V1 producía contenido genérico

V1 no fallaba técnicamente. Fallaba estructuralmente. Tres causas raíz:

1. **Pipeline lineal.** `idea → guión → …`. El sistema empezaba a escribir sobre la primera idea. La primera idea es siempre la más obvia, y lo obvio es genérico por definición.
2. **Sin fase de divergencia.** No existía un paso que obligara a generar y descartar en exceso. Se ejecutaba la única idea que había.
3. **Sin crítica adversarial.** El Brand Guardian auditaba consistencia de marca, pero nadie tenía el trabajo de preguntar "¿por qué esto se ignoraría?". La marca estaba protegida; la atención, no.

V2 ataca las tres: introduce un loop no lineal, hace la divergencia obligatoria y desproporcionada, y crea agentes cuya única función es destruir y puntuar.

---

## Principio de diseño rector

> **Divergir en exceso, converger con crueldad.**

Generar decenas de ideas para usar una. El desperdicio no es un costo del sistema: es su mecanismo de calidad. La creatividad emerge del volumen explorado y la severidad del filtro, no de la genialidad de un solo intento.

---

## ADR-001 — Reemplazar el pipeline lineal por un loop diverge/converge

**Contexto:** el pipeline lineal garantizaba consistencia pero no originalidad.
**Decisión:** modelar el proceso como un ciclo con una fase de divergencia obligatoria (generar 50+ conceptos y 50–100 hooks) seguida de convergencia por filtros severos, con re-iteración automática si no se supera el gate.
**Alternativas descartadas:**
- *Mejorar los prompts del copywriter existente* — no ataca la causa raíz (empezar escribiendo).
- *Agregar un paso de "generá 3 opciones"* — insuficiente; 3 opciones siguen siendo las 3 más obvias.
**Consecuencia:** el sistema es más lento y "desperdicia" ideas por diseño. A cambio, lo que sale supera un umbral que V1 no alcanzaba. Costo asumido conscientemente.

---

## ADR-002 — Agentes adversariales dedicados (Challenger + Reviewer)

**Contexto:** nadie tenía el mandato de rechazar por falta de potencial viral.
**Decisión:** crear dos agentes que **no pueden aprobar**: el Creative Challenger (destruye cualitativamente) y el Viral Reviewer (puntúa 0–100). El sesgo del sistema pasa a ser el "no".
**Alternativas descartadas:**
- *Que el copywriter se autocritique* — conflicto de interés; quien crea no destruye bien su propia idea.
- *Solo puntuación numérica* — un número sin crítica cualitativa no dice cómo mejorar. Se necesitan ambos.
**Consecuencia:** más fricción interna, más vueltas. Es el punto: la fricción filtra lo tibio.

---

## ADR-003 — Un Orchestrator como meta-agente, no un flujo hardcodeado

**Contexto:** el orden de agentes no siempre es el mismo; a veces hay que volver atrás.
**Decisión:** un agente Orchestrator (Director Creativo Senior) dirige el loop y decide en cada transición AVANZAR / ITERAR / MATAR. El flujo es dinámico, no una secuencia fija.
**Alternativas descartadas:**
- *Workflow estático numerado (estilo V1)* — no permite la re-iteración que exige la calidad.
**Consecuencia:** el sistema requiere un "director" con criterio, no solo ejecutores. Ese rol se documenta en `orchestrator.md`.

---

## ADR-004 — Copywriter especializado por emoción, no genérico

**Contexto:** un único copywriter promedia todos los registros y produce voz plana.
**Decisión:** siete copywriters especialistas (storytelling, humor, premium, ventas, educativo, conversacional, autoridad). El Orchestrator elige uno según la emoción objetivo fijada por el Strategist.
**Alternativas descartadas:**
- *Un copywriter con "modos"* — en la práctica colapsa a un tono promedio.
**Consecuencia:** más archivos, pero cada pieza tiene un registro deliberado en vez de un tono default.

---

## ADR-005 — Memoria creativa como sistema de archivos versionado

**Contexto:** el conocimiento creativo se perdía entre piezas; cada contenido empezaba de cero.
**Decisión:** `knowledge/` como memoria permanente en 13 dominios (patrones virales, hooks, ángulos, storytelling, analogías, metáforas, psicología, competidores, contenido exitoso, contenido fallido, swipe file, reglas, decisiones). Todo se lee al empezar y se escribe al terminar. Vive en Git → versionado, auditable, revertible.
**Alternativas descartadas:**
- *Base de datos externa / vector store* — sobreingeniería para el volumen actual; rompe la simplicidad de un repo de markdown que un humano puede leer y editar.
**Consecuencia:** la memoria es legible y editable por personas, y evoluciona con cada commit. Si algún día el volumen lo justifica, se puede indexar sin cambiar la fuente de verdad.

---

## ADR-006 — Loop de autoaprendizaje que modifica reglas, no solo reporta

**Contexto:** V1 tenía analytics descriptivos (`analytics/`) pero nada retroalimentaba las decisiones creativas.
**Decisión:** `learning/` cierra el ciclo. Cada pieza publicada se registra con su ADN creativo (hook, estructura, tema, emoción, formato, CTA) y su resultado real. La correlación actualiza `knowledge/creative-rules/` y recalibra los pesos del Viral Score.
**Alternativas descartadas:**
- *Solo dashboards* — informan pero no cambian el comportamiento del sistema.
**Consecuencia:** el engine mejora con el uso. El de dentro de seis meses no es el de hoy.

---

## ADR-007 — La marca es filtro de convergencia, no punto de partida

**Contexto:** empezar por "¿qué diría la marca?" reprime la exploración.
**Decisión:** la exploración (Fases 1–5) es libre y agresiva; `brand/` se aplica como filtro en la convergencia (Fase 6) y como kill-switch de territorio. La creatividad es la prioridad absoluta; la marca asegura que lo creativo siga siendo Alumfer.
**Alternativas descartadas:**
- *Chequear marca en cada idea generada* — mata la divergencia; se autocensura antes de explorar.
**Consecuencia:** aparecen ideas fuera de territorio que se descartan después. Es aceptable: es más barato descartar que no haber explorado.

---

## Relación V1 → V2 (qué se mantiene, qué se reubica)

| Componente V1 | Estado en V2 |
|---|---|
| `brand/*` | **Se mantiene.** Fuente de verdad de identidad; filtro de convergencia. |
| `agents/creative-director.md` | **Absorbido.** Su rol se eleva al `engine/orchestrator.md`. Se conserva como referencia de criterios. |
| `agents/copywriter.md` | **Se especializa.** Da lugar a `agents/copywriters/*`. Se conserva como base de voz. |
| `agents/brand-guardian.md` | **Se mantiene.** Auditor de salida en Fase 6. |
| `agents/strategist.md` | **Se mantiene** y convive con el nuevo `creative-strategist.md` (estrategia de negocio vs. estrategia creativa de pieza). |
| `workflows/idea-to-reel.md` | **Reemplazado** por `workflows/creative-engine-v2.md`. Se conserva como referencia de producción física (grabación, edición). |
| `analytics/*` | **Se integra** al nuevo `learning/` como fuente de señales. |
| `templates/*`, `knowledge/*` (archivos V1) | **Se mantienen** y se incorporan a la memoria como material sembrado. |

Nada se borra. V2 es una capa de inteligencia sobre los activos de V1, no una demolición.

---

## Estado de madurez y próximos pasos

- **Hoy:** arquitectura definida, agentes y memoria sembrados con conocimiento inicial real de Alumfer.
- **Con uso:** la memoria se llena de piezas reales y sus resultados; las reglas se afinan.
- **Evolución posible (no ahora):** indexado semántico de la memoria, generación de variantes A/B automáticas por pieza, y un panel que muestre la correlación score-predicho vs. performance-real. Se documentará como ADR cuando se implemente.
