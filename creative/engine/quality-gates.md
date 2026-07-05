# Quality Gates — Los Umbrales que Toda Idea Debe Superar

> El sistema tiene un sesgo estructural hacia el "no".
> Estos gates son las barreras. Lo promedio muere acá, automáticamente.

---

## El gate principal: Viral Score

El **Viral Reviewer** puntúa cada idea 0–100 sumando 10 factores (0–10 cada uno).

| # | Factor | Pregunta que responde | Peso |
|---|---|---|---|
| 1 | **Stop Scroll** | ¿El primer segundo obliga a frenar? | ×1.5 |
| 2 | **Curiosidad** | ¿Abre un loop que la persona necesita cerrar? | ×1.5 |
| 3 | **Originalidad** | ¿Se siente distinto a todo lo del rubro? | ×1.5 |
| 4 | **Emoción** | ¿Hace sentir algo (no solo entender)? | ×1 |
| 5 | **Compartible** | ¿Alguien lo mandaría a otra persona? | ×1 |
| 6 | **Guardable** | ¿Alguien lo guardaría para después? | ×1 |
| 7 | **Comentarios** | ¿Genera ganas de responder / opinar? | ×0.75 |
| 8 | **Valor percibido** | ¿Se siente que da algo valioso? | ×0.75 |
| 9 | **Claridad** | ¿Se entiende sin esfuerzo? | ×0.5 |
| 10 | **Recordación** | ¿Se recuerda mañana? | ×0.5 |

Puntaje ponderado normalizado a 0–100.

> Los tres factores de mayor peso (Stop Scroll, Curiosidad, Originalidad) son los que separan lo memorable de lo correcto. Un contenido claro y valioso pero predecible **no pasa**: eso es exactamente lo que producía V1.

---

## Umbrales de decisión

```
Score ≥ 80   →  APROBADO. Excelente. A producción.
Score 70-79  →  APROBADO CON MEJORA. Una vuelta más de pulido sobre el mismo concepto.
Score 55-69  →  ITERAR. Concepto tibio. Volver a Fase 2 (generar) con el diagnóstico.
Score < 55   →  MATAR. Descartar. Documentar en failed-content/ por qué.
```

**Gate de publicación: 80.** Nada se publica por debajo de 80. Si tras 3 vueltas no se llega, el brief se declara no viable (ver `creative-loop.md` → presupuesto de iteración).

### Kill-switches (matan la idea sin importar el score)

Si **cualquiera** de estos es verdadero, la idea muere aunque puntúe alto:

- Stop Scroll < 5 (si no frena el scroll, nada más importa).
- Originalidad < 4 ("cualquier IA / cualquier carpintería escribiría esto").
- Viola algo de `prohibitions.md`.
- Cae fuera del territorio de marca (`brand/brand-dna.md`).
- Para Alumfer específicamente: no hay forma de anclar la pieza a Zona Sur GBA ni a obra propia (un viral sin localización no genera consultas — ver `analytics/success-patterns.md`).

---

## Gates intermedios (por fase del loop)

Cada fase tiene su propio mini-gate para no arrastrar material débil:

| Fase | Gate para avanzar |
|---|---|
| 1 · Comprender | Emoción objetivo definida + una tensión humana real identificada. |
| 2 · Generar | ≥ 50 conceptos y ≥ 50 hooks producidos; ≥ 5 conceptos no-obvios y ≥ 3 hooks que frenan sobreviven al autofiltro. |
| 3 · Mezclar | 8–12 finalistas híbridos, cada uno mejor que sus partes. |
| 4 · Criticar | Cada finalista atacado por el Challenger; sobreviven solo los que resisten o mejoran. |
| 5 · Puntuar | ≥ 1 finalista con score ≥ 80. Si no, ITERAR. |
| 6 · Converger | Brand Guardian ≥ 4/5. Estructura narrativa presente (no lista). |

---

## Test de las 8 preguntas (checklist final del Orchestrator)

Antes de aprobar, toda idea debe responder **SÍ** a las 8. Un solo NO dispara re-iteración:

1. ¿Detiene el scroll?
2. ¿Genera curiosidad?
3. ¿Se siente diferente?
4. ¿Tiene personalidad?
5. ¿Sorprende?
6. ¿La compartiría alguien?
7. ¿La guardaría alguien?
8. ¿Parece creada por una agencia creativa de primer nivel?

Este test es la versión humana y rápida del Viral Score. Si el número dice 80 pero una de estas responde NO, gana el NO.

---

## Cómo se calibran los umbrales

Los umbrales no son fijos para siempre. El `learning/feedback-loop.md` los ajusta con datos reales:

- Si piezas con score 80 rinden por debajo de lo esperado de forma consistente → **subir el gate** o **recalibrar el peso** del factor que engañó.
- Si un factor puntúa alto pero no correlaciona con guardados/DMs reales → bajar su peso.
- Cada recalibración se documenta en `knowledge/creative-decisions/` con la evidencia que la motivó.
