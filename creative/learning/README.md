# Learning Loop — Autoaprendizaje del Creative OS

> El sistema mejora con el uso.
> Cada pieza publicada vuelve al engine con su resultado real y modifica las decisiones futuras.

---

## La idea

`analytics/` (V1) describía la performance. No cambiaba nada. `learning/` cierra el ciclo: convierte performance en **reglas** que modifican cómo el engine crea la próxima pieza.

```
   CREAR ──▶ PUBLICAR ──▶ MEDIR ──▶ APRENDER ──▶ (el engine cambió) ──▶ CREAR mejor
     ▲                                                                        │
     └────────────────────────────────────────────────────────────────────────┘
```

## Los tres componentes

| Archivo | Qué hace |
|---|---|
| `content-ledger.md` | El registro. Vincula el ADN creativo de cada pieza (hook, estructura, tema, emoción, formato, CTA) con su resultado real. |
| `feedback-loop.md` | El proceso. Cómo la performance actualiza `knowledge/creative-rules/` y recalibra los pesos del Viral Score. |
| `retrospective.md` | El protocolo. Qué hacer con cada pieza después de publicar y en la revisión mensual. |

## Qué se relaciona (el ADN creativo)

Cada pieza se registra con estos atributos, para poder correlacionar cuáles predicen resultado:

```
hook · estructura narrativa · tema · ángulo · emoción · formato · duración ·
CTA · copywriter usado · score predicho  ──vs──  resultado real
```

## Qué modifica el aprendizaje

Cuando la evidencia se acumula, el loop actúa sobre el sistema:

- **`knowledge/creative-rules/`** → promueve hipótesis a reglas, degrada reglas que dejaron de funcionar.
- **`engine/quality-gates.md`** → recalibra el peso de los factores del Viral Score que engañaron.
- **`engine/prohibitions.md`** → agrega prohibiciones cuando un patrón falla 3 veces.
- **`knowledge/psychology/`** → valida o ajusta perfiles de audiencia.
- **`knowledge/hooks/` y `angles/`** → marca qué tipos rinden con esta audiencia.

## Relación con `analytics/` (V1)

`analytics/` se mantiene como **fuente de señales** (frameworks de performance, patrones de éxito). `learning/` es el **motor que las procesa** y las convierte en cambios de comportamiento del engine. No se duplican: analytics observa, learning actúa.

## Regla rectora
> Ninguna pieza se considera "terminada" cuando se publica. Se termina cuando su resultado ya modificó el sistema. Publicar sin medir ni aprender es desperdiciar la única señal real que tenemos.
