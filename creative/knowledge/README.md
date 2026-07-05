# Creative Memory — Memoria Creativa Permanente

> El sistema nunca empieza de cero.
> Todo lo que el engine aprende se guarda acá y se reutiliza. Es lo que hace que Alumfer mejore con cada pieza.

---

## Cómo funciona la memoria

El Creative Intelligence Engine tiene dos momentos de contacto con esta carpeta:

```
ANTES de crear (Fase 0 del loop)     →  LEE la memoria relevante
DESPUÉS de crear/publicar (Fase 7)   →  ESCRIBE lo aprendido
```

Ningún contenido se genera sin antes leer la memoria. Ninguna pieza se cierra sin dejar algo en ella. Así el conocimiento se acumula en vez de perderse entre piezas.

## Los 13 dominios de memoria

| Carpeta | Qué guarda | Se lee cuando… | Se escribe cuando… |
|---|---|---|---|
| `viral-patterns/` | Patrones que hacen que algo se comparta/guarde | se planifica una pieza | se detecta un patrón nuevo |
| `hooks/` | Biblioteca de hooks usados y su rendimiento | el Hook Generator arranca | un hook sobrevive el loop o se publica |
| `angles/` | Biblioteca de ángulos de concepto | el Concept Generator arranca | aparece un ángulo nuevo |
| `storytelling/` | Estructuras narrativas | el Story Architect arranca | una estructura funciona |
| `analogies/` | Analogías reutilizables del rubro | se busca hacer entendible algo técnico | se crea una analogía que pega |
| `metaphors/` | Metáforas de marca | se busca elevar/emocionar | se crea una metáfora potente |
| `psychology/` | Perfiles psicológicos de audiencia | el Audience Psychologist arranca | se valida/ajusta un perfil |
| `competitors/` | Qué hace el rubro (para NO imitar) | se quiere romper un patrón | se observa algo de la competencia |
| `successful-content/` | Piezas que funcionaron + por qué | se planifica algo similar | una pieza supera su predicción |
| `failed-content/` | Piezas que fallaron + por qué | se evita repetir un error | una pieza muere o rinde por debajo |
| `swipe-file/` | Referencias externas a robar (estructura, no copia) | se busca inspiración de afuera del rubro | se encuentra una referencia potente |
| `creative-rules/` | Reglas creativas aprendidas | SIEMPRE, al inicio del loop | el `learning/` valida una regla nueva |
| `creative-decisions/` | Log de decisiones creativas de cada pieza | se quiere trazar por qué se eligió algo | se cierra cada pieza |

## Reglas de la memoria

1. **Todo se versiona en Git.** Cada aprendizaje es un commit. La memoria es auditable y revertible.
2. **Formato markdown legible por humanos.** Un miembro del equipo puede leer y editar cualquier archivo. No hay caja negra.
3. **Fechar todo.** Cada entrada lleva fecha. El conocimiento tiene vigencia; lo viejo se marca, no se borra.
4. **Evidencia sobre opinión.** Una regla en `creative-rules/` necesita al menos una pieza real que la respalde (de `successful-content/` o `failed-content/`). Sin evidencia, es hipótesis, y se marca como tal.
5. **La memoria condiciona, no encadena.** Se lee para no repetir y no empezar de cero, no para copiar. Repetir un hook archivado está prohibido (`engine/prohibitions.md`).

## Relación con `learning/`

`learning/` es el **proceso** que llena esta memoria con datos de performance. `knowledge/` es el **almacén**. El loop de autoaprendizaje toma piezas publicadas, mide su resultado, y escribe reglas acá. Ver `learning/feedback-loop.md`.

## Estado inicial

Estas carpetas arrancan **sembradas** con conocimiento real de Alumfer (extraído de `brand/`, `analytics/` y los `knowledge/*.md` de V1), no vacías. El engine ya tiene con qué trabajar desde el día uno, y la memoria crece desde ahí.
