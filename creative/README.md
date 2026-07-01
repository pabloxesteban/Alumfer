# Alumfer Creative OS

Sistema operativo creativo de Alumfer. Contiene toda la inteligencia de marca, los agentes de contenido y los workflows de producción.

**No es el sitio web.** Es el sistema que produce el contenido que alimenta la marca.

---

## Mapa del sistema

```
creative/
│
├── brand/              ← Fuente de verdad de identidad
│   ├── brand-dna.md        Esencia, posicionamiento, promesa
│   ├── voice.md            Cómo habla Alumfer (por canal)
│   ├── personality.md      Quién es Alumfer como persona
│   ├── visual-language.md  Cómo se ve Alumfer
│   └── storytelling.md     Cómo cuenta historias
│
├── agents/             ← Roles creativos con prompts base
│   ├── creative-director.md    Aprueba/rechaza ideas
│   ├── copywriter.md           Escribe el contenido
│   ├── brand-guardian.md       Audita antes de publicar
│   └── strategist.md           Planifica qué y cuándo publicar
│
├── skills/             ← Canales y formatos específicos
│   └── instagram.md        Algoritmo, horarios, DMs, bio
│
├── workflows/          ← Procesos de producción paso a paso
│   └── idea-to-reel.md     Del concepto al reel publicado
│
├── templates/          ← Estructuras reutilizables
│   ├── reel-hook.md        Primeros 2 segundos que retienen
│   └── caption-structure.md  4 formatos de caption listos
│
├── knowledge/          ← Base de conocimiento y referencias
│   └── design-references.md   Arquitectos, marcas, estética
│
├── analytics/          ← Evaluación de performance
│   ├── content-evaluation.md    Métricas que importan y template mensual
│   └── template-performance.md  Qué plantilla convierte mejor (cierra el loop)
│
├── exporters/          ← Content Export System (desacopla contenido de herramienta)
│   ├── core/               Estándar Content Package + interfaz de exportador
│   ├── shared/             Validadores, mappers y serializers reutilizables
│   ├── canva/              Primer exportador (plantillas, schemas, ejemplos)
│   ├── figma/              Preparado (no implementado)
│   └── capcut/             Preparado (no implementado)
│
└── content/            ← Contenido en producción (drafts, reels, campañas)
    (se puebla con Content Packages: ideas y borradores activos)
```

---

## Content Export System (`exporters/`)

El Creative OS **nunca produce directamente un archivo para Canva**. Produce siempre un **Content Package**: un paquete estándar, agnóstico de plataforma, autocontenido y validable. Los **exportadores** lo traducen a cada herramienta.

```
Idea → Creative Director → Copywriter → Brand Guardian → Quality Controller
                                   ↓
                            CONTENT PACKAGE
                                   ↓
                       Exporter (Canva · Figma · CapCut · …)
```

- El estándar y el contrato están en `exporters/core/`.
- Se produce con el skill `skills/content-packaging.md`.
- Se exporta a Canva con el agente `agents/canva-exporter.md`.
- Todos los workflows terminan en un Content Package (ver `workflows/content-package-export.md`).

Detalle completo en `exporters/README.md`.

---

## Cómo usar el Creative OS

### Para generar un reel
1. Leer `brand/brand-dna.md` para confirmar que la idea encaja
2. Seguir `workflows/idea-to-reel.md`
3. Usar `agents/copywriter.md` para el guión
4. Usar `agents/brand-guardian.md` para aprobación final

### Para escribir un caption
1. Elegir el template en `templates/caption-structure.md`
2. Aplicar la voz de `brand/voice.md`
3. Revisar con `agents/brand-guardian.md`

### Para planificar el mes
1. Revisar `analytics/content-evaluation.md` (mes anterior)
2. Consultar calendario de temporadas en `agents/strategist.md`
3. Definir mix de contenido del mes

### Para evaluar si una idea es de marca
Activar `agents/creative-director.md` con el prompt base + la idea.

### Para empaquetar contenido y exportarlo a Canva
1. Empaquetar la pieza con `skills/content-packaging.md` → Content Package en `content/drafts/`
2. Aprobar el `checklist.md` con `agents/quality-controller.md` → estado `ready-for-export`
3. Exportar con `agents/canva-exporter.md` siguiendo `workflows/content-package-export.md`
4. Armar en Canva con el `report.md` generado (paso mecánico, sin diseñar de cero)

---

## Relación con el sitio web

El Creative OS y el website son independientes:
- **Website** (`apps/website/`) → convierte visitas en consultas
- **Creative OS** (`creative/`) → genera confianza antes de la visita

Comparten la misma identidad visual via `shared/design-system/`.

---

## Principio rector

> El mejor contenido de Alumfer no parece contenido.
> Parece el registro honesto de un trabajo bien hecho.
