# North Star Metric — "Imposible de Ignorar"

> La métrica principal cambió.
> Ya no medimos cuánto publicamos. Medimos cuánto es imposible de ignorar.

---

## El cambio de métrica

| | V1 | V2 |
|---|---|---|
| Objetivo | Producir publicaciones | Producir contenido imposible de ignorar |
| Métrica de proceso | Piezas por semana | % de ideas que superan el gate de 80 |
| Éxito de una pieza | Se publicó | Frenó el scroll y generó una acción |
| Fracaso | No se publicó | Se publicó algo ignorable |

El peor resultado del sistema V2 **no es** no publicar. Es publicar algo que nadie mira. Un calendario vacío es recuperable; erosionar la marca con contenido tibio, no.

---

## Definición operativa

Una pieza es **imposible de ignorar** si supera el test de las 8 preguntas con 8 SÍ:

1. ¿Detiene el scroll?
2. ¿Genera curiosidad?
3. ¿Se siente diferente?
4. ¿Tiene personalidad?
5. ¿Sorprende?
6. ¿La compartiría alguien?
7. ¿La guardaría alguien?
8. ¿Parece creada por una agencia creativa de primer nivel?

**Un solo NO dispara re-iteración automática.** No es un promedio: es un AND lógico.

---

## Cómo se mide antes de publicar (predictivo)

El **Viral Score** (ver `quality-gates.md`) es el proxy predictivo de "imposible de ignorar". Gate de publicación: **80/100**. Esto se decide dentro del engine, antes de gastar un minuto de producción.

## Cómo se mide después de publicar (real)

La predicción se contrasta con señales reales, en orden de importancia para Alumfer:

```
SEÑAL PRIMARIA   → DMs y consultas por WhatsApp        (intención de compra)
SEÑAL DE FRENO   → watch time / retención primeros 3s   (¿frenó el scroll?)
SEÑAL DE FUTURO  → guardados                            (intención diferida)
SEÑAL DE ALCANCE → compartidos                          (el contenido viaja)
SEÑAL DE DEBATE  → comentarios con sustancia            (no "lindo 👍")
RUIDO            → likes, follows                        (vanidad, se ignora)
```

Para Alumfer, guardados + DMs pesan más que views: el cliente tarda semanas en decidir y el contenido siembra. Una pieza con 5.000 views y 40 guardados vale más que una con 60.000 views y 3 guardados.

---

## El bucle de "imposible de ignorar"

```
        PREDECIR (Viral Score ≥ 80)
              │
              ▼
        PUBLICAR
              │
              ▼
        MEDIR (DMs · retención · guardados · compartidos)
              │
              ▼
   ¿La realidad confirmó la predicción?
        │                    │
        SÍ                   NO
        │                    │
   reforzar la regla    corregir el peso del factor
   en creative-rules/   que engañó (learning/)
        │                    │
        └────────┬───────────┘
                 ▼
        el gate de mañana es más filoso
```

---

## Regla final

> Si una idea no responde SÍ a las 8 preguntas, el sistema no la escribe: la vuelve a pensar.
> El objetivo no es llenar un calendario. Es ganar la única batalla que importa: que alguien, a mitad del scroll, se detenga.
