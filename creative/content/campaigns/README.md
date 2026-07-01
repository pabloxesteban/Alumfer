# Campaigns — Campañas Activas y Archivadas

> Este directorio contiene las campañas de contenido: el plan mensual completo con su eje temático, calendario, y análisis final.

---

## Qué es una campaña en Alumfer

Una campaña es un mes de contenido con un eje temático coherente y un objetivo medible.

No es una campaña publicitaria pagada (aunque puede tenerla). Es la unidad de planificación de contenido orgánico.

**Cada mes = una campaña.**

---

## Naming convention

`[año]-[mes]-[nombre-del-eje].md`

Ejemplos:
- `2024-08-invierno-sin-frio.md`
- `2024-09-quincho-todo-el-ano.md`
- `2024-10-antes-del-verano.md`

---

## Formato de campaña

```markdown
# Campaña: [nombre del eje]

**Período:** [mes y año]
**Estado:** PLANIFICACIÓN / ACTIVA / COMPLETADA

## Objetivo del mes

**Objetivo principal:** [alcance / engagement / consultas / posicionamiento de producto]
**Meta cuantitativa:** [ej: 20 consultas de WhatsApp desde Instagram]

## Eje temático

[El tema central del mes en 1-2 líneas]

## Calendario de contenido

| Fecha | Tipo | Tema | Estado |
|---|---|---|---|
| [fecha] | [reel/foto/carrusel] | [tema] | pendiente/en producción/publicado |

## Material disponible

[Inventario de obras y material para el mes]

## Análisis final (completar al cierre del mes)

**Alcance total del mes:**
**Nuevos seguidores:**
**Consultas generadas:**
**Engagement rate promedio:**

**Top 3 piezas del mes:**
1. [pieza] — [por qué funcionó]
2. [pieza] — [por qué funcionó]
3. [pieza] — [por qué funcionó]

**Aprendizajes:**
[Qué llevamos al próximo mes]
```

---

## Estructura de subdirectorios

```
campaigns/
  activas/    ← campaña del mes en curso
  archivadas/ ← campañas completadas
```

Cuando una campaña completa su análisis final, se mueve a `archivadas/`.

---

## Flujo

```
campaign-planning.md (workflow) → crear archivo en campaigns/activas/
Fin del mes + análisis → mover a campaigns/archivadas/
```
