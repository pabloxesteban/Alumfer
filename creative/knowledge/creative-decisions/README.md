# Creative Decisions — Log de Decisiones Creativas

> La trazabilidad del engine. Por qué se eligió cada idea y qué se descartó en el camino.
> Cada pieza que pasa por el loop deja acá su registro.

---

## Por qué existe
Sin este log, el sistema no puede aprender de sus propias elecciones: no sabría por qué eligió A sobre B, ni podría revisar esa decisión cuando llegue el resultado real. Es la caja negra del engine, hecha transparente.

## Cómo se usa
- **Se escribe** al cerrar cada pieza (Fase 7 del loop), y cada vez que se recalibra una regla o un peso del Viral Score.
- **Se lee** cuando llega la performance real, para contrastar la decisión con el resultado (cierra el ciclo con `learning/`).

## Esquema de una decisión de pieza
```
DECISIÓN: [slug] · FECHA: [YYYY-MM-DD]
BRIEF: [objetivo de negocio + emoción objetivo]
CONCEPTOS EXPLORADOS: [cuántos se generaron]
FINALISTAS: [los que llegaron a crítica]
GANADOR: [concepto elegido] · SCORE: [XX/100]
POR QUÉ GANÓ: [la razón sobre los demás finalistas]
QUÉ MATÓ EL CHALLENGER: [ideas fuertes descartadas y por qué — lo más valioso]
VUELTAS DE ITERACIÓN: [cuántas hasta superar el gate]
COPYWRITER USADO: [especialista] · HOOK: "[texto]"
PREDICCIÓN: [qué esperamos que pase]
→ RESULTADO REAL: [se completa después, vía learning/]
→ ¿ACERTAMOS?: [se completa después]
```

## Esquema de una decisión de sistema (recalibración)
```
DECISIÓN DE SISTEMA: [qué se cambió] · FECHA: [YYYY-MM-DD]
QUÉ: [ej. "se bajó el peso del factor Claridad de 0.5 a 0.4"]
POR QUÉ: [evidencia que lo motivó]
EVIDENCIA: [piezas / datos]
IMPACTO ESPERADO: [qué debería mejorar]
```

---

## Estado inicial
Vacío de piezas (el engine recién arranca). La **primera decisión de sistema** registrada es la creación misma del Engine V2: ver `engine/ARCHITECTURE.md` (ADR-001 a ADR-007), que es el punto de partida de este log.

## Regla
Cada decisión importante deja rastro. "Elegimos esto porque nos gustó" no es una entrada válida: siempre hay una razón sobre las alternativas, y esa razón es lo que el sistema necesita para aprender. La trazabilidad no es burocracia: es la materia prima del autoaprendizaje.
