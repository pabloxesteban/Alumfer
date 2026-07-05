# Feedback Loop — Cómo la Performance Modifica el Engine

> El proceso que convierte datos del `content-ledger.md` en cambios de comportamiento del sistema.
> Acá es donde el Creative OS deja de ser estático y empieza a aprender.

---

## El ciclo

```
content-ledger.md (datos)
        │
        ▼
1. COMPARAR predicción vs. realidad
        │
        ▼
2. DETECTAR el patrón (¿qué correlaciona con el resultado?)
        │
        ▼
3. DECIDIR el ajuste (regla / peso / prohibición / perfil)
        │
        ▼
4. APLICAR el cambio en knowledge/ o engine/
        │
        ▼
5. DOCUMENTAR en creative-decisions/
        │
        ▼
   (el engine cambió → la próxima pieza se crea distinto)
```

## 1. Comparar predicción vs. realidad

Para cada pieza, el score predicho por el Viral Reviewer se contrasta con el resultado real:

| Caso | Qué significa | Acción |
|---|---|---|
| Score alto → resultado alto | el modelo acertó | reforzar la regla que lo predijo |
| Score alto → resultado bajo | **el modelo se dejó engañar** | recalibrar el factor culpable |
| Score bajo → resultado alto | subestimamos algo | investigar qué factor pesó de más en contra |
| Score bajo → resultado bajo | acertamos en descartar | validar el kill-switch |

El caso más valioso es **score alto → resultado bajo**: revela un factor que suena bien pero no funciona con esta audiencia.

## 2. Detectar el patrón

Con varias piezas en el ledger, buscar correlaciones:

- ¿Qué **tipo de hook** tiene mayor retención a 3s?
- ¿Qué **ángulo** genera más DMs (no más views)?
- ¿Qué **emoción** se guarda más?
- ¿Qué **copywriter** convierte mejor por tema?
- ¿Qué **formato** (reel vs. carrusel) rinde para educativo?

Regla de significancia: no actuar sobre una sola pieza. Se necesitan **2–3 piezas coincidentes** antes de mover una regla. Una pieza puede ser suerte; tres son un patrón.

## 3. Decidir el ajuste

Según lo detectado, el ajuste puede ser:

- **Promover una hipótesis a regla** (o regla a ley) en `knowledge/creative-rules/`.
- **Degradar una regla** que dejó de funcionar (con fecha, no se borra).
- **Recalibrar un peso** del Viral Score en `engine/quality-gates.md`. Ejemplo: si "Claridad" puntúa alto en piezas que no rinden, bajar su peso; si "Originalidad" predice bien, subirlo.
- **Agregar una prohibición** en `engine/prohibitions.md` cuando un patrón falla 3 veces.
- **Ajustar un perfil** en `knowledge/psychology/`: pasar de hipótesis a validado, o corregir un gatillo mal supuesto.

## 4. Aplicar

El cambio se edita directamente en el archivo correspondiente. Como todo vive en Git, cada aprendizaje es un commit trazable y revertible.

## 5. Documentar

Toda recalibración se registra como **decisión de sistema** en `knowledge/creative-decisions/` con su evidencia. Sin evidencia documentada, un cambio de pesos es solo una opinión disfrazada de dato.

---

## Recalibración de los pesos del Viral Score

El mecanismo concreto que hace "inteligente" al gate:

```
Para cada factor del Viral Score (Stop Scroll, Curiosidad, ...):
  correlación = ¿este factor, cuando fue alto, predijo buen resultado real?
  si correlación fuerte y positiva → subir su peso
  si correlación débil o nula      → bajar su peso
  si un factor no correlaciona nunca → candidato a eliminarse
```

Ejemplo hipotético tras 20 piezas: si "Guardable" resulta el mejor predictor de DMs para Alumfer (coherente con R06), su peso sube de 1.0 a 1.25. El engine empieza a premiar ideas guardables por sobre otras. El gate evolucionó solo, con datos.

## Cadencia
- **Por pieza (48–72h):** cargar señales, comparar con la predicción.
- **Mensual:** revisar patrones acumulados, mover reglas y pesos (ver `retrospective.md`).
- **Trimestral:** auditar si las leyes siguen siendo leyes.

## Regla rectora
> El engine no confía en su propia intuición: confía en el ledger. Cada creencia creativa está a una tanda de datos de ser confirmada o derogada.
