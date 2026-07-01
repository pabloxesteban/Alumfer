# Content Export System

> Sistema profesional de exportación de contenido del Creative OS. Desacopla **la generación del contenido** del **software que lo renderiza**.

**Claude nunca diseña directamente en Canva.** El Creative OS produce un **Content Package** estructurado; los **exportadores** lo traducen a cada herramienta (Canva hoy; Figma, CapCut y más, mañana).

---

## El principio

```
Idea
 ↓
Creative Director → Copywriter → Brand Guardian → Quality Controller
 ↓
CONTENT PACKAGE          ← única salida posible del sistema creativo
 ↓
Exporter                 ← Canva · Figma · CapCut · Adobe Express · …
 ↓
Archivo listo para la herramienta de diseño
```

Un Content Package es agnóstico de plataforma, autocontenido y validable. Cualquier exportador lo consume sin conocer el resto del Creative OS, y cualquier agente lo produce sin conocer ningún exportador. Ese desacople es todo el punto.

---

## Estructura del módulo

```
exporters/
├── core/                        ← el contrato (independiente de toda herramienta)
│   ├── content-package.md          El estándar interno: 8 archivos, un propósito cada uno
│   └── exporter-interface.md       El ciclo común de 7 etapas que todo exportador implementa
│
├── shared/                      ← lógica reutilizable (se escribe una vez)
│   ├── validators/                 8 validadores agnósticos de plataforma
│   ├── mappers/                    selección de plantilla + mapeo contenido→variables
│   └── serializers/                CSV · JSON · Bulk Create
│
├── canva/                       ← primer exportador (implementado)
│   ├── exporter.md                 spec técnica (implementa core/exporter-interface.md)
│   ├── templates/                  11 plantillas (carousel, story, before-after, …)
│   ├── schemas/                    JSON Schemas de validación (draft 2020-12)
│   ├── examples/                   un paquete completo + su export esperado
│   └── exports/                    salida generada (no se edita a mano)
│
├── figma/                       ← preparado, no implementado
└── capcut/                      ← preparado, no implementado
```

---

## Cómo se usa (flujo end-to-end)

1. Un workflow del Creative OS produce contenido (guión, carrusel, etc.).
2. El skill **`content-packaging`** lo empaqueta en un Content Package (`content/drafts/`).
3. El **Brand Guardian** y el **Quality Controller** lo revisan; el checklist aprobado lo lleva a `ready-for-export`.
4. El agente **`canva-exporter`** ejecuta el ciclo del exportador y emite los artefactos a `canva/exports/<packageId>/`.
5. Un humano ejecuta Bulk Create en Canva siguiendo el `report.md` (paso mecánico, sin decisiones creativas).
6. Al publicar, la performance se registra por plantilla (`analytics/template-performance.md`) y alimenta el próximo calendario.

---

## Principios de diseño (por qué está hecho así)

| Principio | Cómo se aplica |
|---|---|
| **Separación de responsabilidades** | Contenido (agentes) ≠ renderizado (exportadores) ≠ validación (validators). |
| **SOLID** | Detallado en `core/exporter-interface.md`. El core depende de la abstracción `Exporter`, no de implementaciones. |
| **Open/Closed** | Se agregan exportadores sin tocar el core ni los existentes. |
| **DRY** | Todo lo común vive en `shared/`. Regla: dos usos → `shared/`. |
| **Fail-fast** | La validación corta antes de emitir nada; un exportador nunca "adivina" ni corrige. |
| **Inmutabilidad** | Un paquete `exported` no se edita; los cambios generan una versión nueva. |

---

## Escalabilidad — agregar un exportador

El sistema está preparado para exportadores de: **Canva, Figma, CapCut, Adobe Express, Meta Business Suite, Buffer, Later, Hootsuite** — sin modificar el resto del Creative OS.

Para agregar uno (checklist completo en `core/exporter-interface.md`):
1. Crear `exporters/<nombre>/` espejando `canva/`.
2. Implementar las 7 etapas del contrato en `<nombre>/exporter.md`.
3. Reutilizar `shared/`; agregar solo lo específico del destino.
4. Registrarlo en `compatibleExporters` del estándar y en este README.
5. No tocar nada fuera de `exporters/<nombre>/` y el registro.

---

## Estado de los exportadores

| Exportador | Estado | Formatos |
|---|---|---|
| Canva | ✅ implementado | CSV · JSON · Bulk Create · variable-map · asset-manifest |
| Figma | 🔜 preparado | (JSON / plugin API previsto) |
| CapCut | 🔜 preparado | (JSON de timeline previsto) |
| Adobe Express · Meta Business Suite · Buffer · Later · Hootsuite | 📋 contemplados | — |

---

## Mapa de lectura

- Empezá por **`core/content-package.md`** (qué produce el sistema).
- Seguí con **`core/exporter-interface.md`** (cómo se consume).
- Mirá el ejemplo real en **`canva/examples/`**.
- Para producir paquetes: **`../skills/content-packaging.md`**.
- Para exportar a Canva: **`../agents/canva-exporter.md`** + **`canva/exporter.md`**.
