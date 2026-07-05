# Retrospective — Protocolo de Análisis Post-Publicación

> Qué hacer con cada pieza después de publicar, y con el conjunto cada mes.
> Sin este protocolo, el `content-ledger` se queda vacío y el sistema deja de aprender.

---

## Retrospectiva por pieza (48–72h después de publicar)

Checklist:

```
[ ] Cargar señales reales en content-ledger.md (retención, guardados,
    compartidos, comentarios, DMs).
[ ] Comparar con el score predicho del Viral Reviewer.
[ ] Clasificar: ¿acertamos / sobreestimamos / subestimamos?
[ ] Si la pieza SUPERÓ su predicción → documentar en
    knowledge/successful-content/ (el mecanismo, no la descripción).
[ ] Si la pieza RINDIÓ POR DEBAJO → documentar en
    knowledge/failed-content/ (causa raíz honesta).
[ ] Completar el campo APRENDIZAJE de la fila del ledger.
[ ] Cerrar la decisión en knowledge/creative-decisions/ con el resultado real.
```

Pregunta central de la retro por pieza:
> "¿La realidad confirmó por qué pensábamos que esto iba a frenar el scroll?"
Si sí, sabemos algo nuevo y verdadero. Si no, sabemos que una de nuestras creencias estaba equivocada — igual de valioso.

## Retrospectiva mensual (todo el conjunto)

```
[ ] Revisar todas las filas del mes en content-ledger.md.
[ ] Buscar patrones: ¿qué hook / ángulo / emoción / formato rindió mejor?
    (mínimo 2-3 piezas coincidentes para que cuente).
[ ] Ejecutar feedback-loop.md: promover/degradar reglas, recalibrar pesos.
[ ] Actualizar el dashboard de patrones de éxito
    (analytics/success-patterns.md, sección final).
[ ] Revisar perfiles psicológicos: ¿algún segmento reaccionó distinto a lo
    esperado? Ajustar knowledge/psychology/.
[ ] Registrar toda recalibración como decisión de sistema en creative-decisions/.
```

## Retrospectiva trimestral (el sistema mismo)

```
[ ] ¿Las "leyes" de creative-rules/ siguen siendo leyes?
[ ] ¿El gate de 80 es el correcto, o hay que subirlo/bajarlo?
[ ] ¿Los 7 copywriters se usan todos, o alguno nunca se elige (señal de que
    sobra o de que el Strategist no explora esa emoción)?
[ ] ¿Qué ángulos están "gastados" y hay que rotar?
[ ] ¿La memoria creativa refleja lo que de verdad funciona, o quedó desactualizada?
[ ] Escribir un ADR nuevo en engine/ARCHITECTURE.md si el sistema evolucionó.
```

## Anti-patrones de la retrospectiva

- **Medir vanidad.** Celebrar views o likes cuando la señal real es DMs y guardados. Un reel de 60k views sin consultas es un fracaso, no un éxito (F01).
- **Actuar sobre una sola pieza.** Una pieza puede ser suerte. Esperar el patrón.
- **No documentar los fracasos.** El instinto es archivar lo que funcionó y olvidar lo que no. El sistema aprende más de `failed-content/`.
- **Recalibrar por intuición.** Todo cambio de peso o regla necesita evidencia en el ledger.

## Regla rectora
> Una pieza no está terminada cuando se publica. Está terminada cuando ya nos enseñó algo y ese algo cambió el sistema. Esa es la diferencia entre un generador de contenido y un Director Creativo que mejora con cada campaña.
