# Content Package — Estándar Interno del Creative OS

> El formato de intercambio universal de Alumfer.
> **Todo el sistema creativo produce SIEMPRE un Content Package. Nunca produce directamente un archivo de Canva, Figma o CapCut.**

---

## Por qué existe

El Creative OS genera contenido. Las herramientas de diseño (Canva, Figma, CapCut, Adobe Express…) lo renderizan. Estas dos responsabilidades no deben mezclarse nunca.

El **Content Package** es el contrato que las desacopla:

```
Idea → Creative Director → Copywriter → Brand Guardian → Quality Controller
                                   ↓
                          CONTENT PACKAGE  ← única salida posible del sistema creativo
                                   ↓
                              Exporter  (Canva / Figma / CapCut / …)
                                   ↓
                          Archivo listo para la herramienta de diseño
```

Un Content Package es **agnóstico de plataforma, autocontenido y validable**. Describe *qué* se comunica, no *cómo se dibuja*. Cualquier exportador puede consumirlo sin conocer el resto del Creative OS, y cualquier agente creativo puede producirlo sin conocer ningún exportador.

### Principio de responsabilidad única

| Responsabilidad | Dueño | NO le corresponde |
|---|---|---|
| Qué se dice y por qué | Agentes creativos → Content Package | Cómo se ve pixel a pixel |
| Cómo se renderiza en una herramienta | Exporter de esa herramienta | Decidir el mensaje o la estrategia |
| Validar que el paquete está completo | Validadores (`shared/validators/`) | Corregir el contenido por su cuenta |

---

## Anatomía del paquete

Un Content Package es una **carpeta** con un nombre canónico y ocho archivos obligatorios más una carpeta de assets.

### Convención de nombre de carpeta

```
CP-{YYYYMMDD}-{plataforma}-{slug}-v{n}/
```

Ejemplo: `CP-20260701-instagram-dvh-quilmes-v1/`

- `CP-` — prefijo fijo (Content Package). Facilita búsquedas y ordenamiento.
- `YYYYMMDD` — fecha de creación del paquete.
- `plataforma` — destino primario (`instagram`, `facebook`, `linkedin`, `tiktok`, `multi`).
- `slug` — identificador humano de la pieza, en kebab-case, sin acentos.
- `v{n}` — versión del paquete (se incrementa ante cualquier re-generación).

### Estructura de archivos

```
CP-20260701-instagram-dvh-quilmes-v1/
├── manifest.json      ← índice y punto de entrada del paquete
├── content.json       ← el contenido estructurado (slides, copy, narrativa)
├── metadata.json      ← contexto estratégico y editorial
├── assets.json        ← inventario de todos los recursos visuales
├── captions.md        ← captions por plataforma, listos para copiar
├── hashtags.txt       ← hashtags clasificados por función
├── checklist.md       ← QA pre-exportación (marcado por el Quality Controller)
├── preview.md         ← vista rápida legible sin abrir ningún JSON
└── assets/            ← los recursos referenciados por assets.json (rutas relativas)
    ├── fotos/
    ├── videos/
    ├── logos/
    └── ...
```

---

## Los ocho archivos

Cada archivo tiene un propósito único y exclusivo. Ningún dato vive en dos archivos a la vez: cada dato tiene una única fuente de verdad.

| Archivo | Propósito de una línea | Fuente de verdad de… |
|---|---|---|
| `manifest.json` | Índice del paquete y metadatos de integridad | Qué archivos existen, versión del estándar, checksums |
| `content.json` | El contenido en sí, estructurado | Slides, copy, narrativa, CTA, emociones |
| `metadata.json` | Contexto estratégico y editorial | Objetivo, embudo, campaña, autor, branding, plataformas |
| `assets.json` | Inventario de recursos visuales | Todo logo, foto, video, color, tipografía necesarios |
| `captions.md` | Captions listos por plataforma | El texto publicable de cada red |
| `hashtags.txt` | Hashtags clasificados | Los hashtags de la pieza y su función |
| `checklist.md` | QA pre-exportación | El estado de aprobación de cada criterio |
| `preview.md` | Resumen humano navegable | Nada nuevo — es una proyección legible de lo anterior |

`preview.md`, `captions.md`, `hashtags.txt` y `checklist.md` son **proyecciones derivadas** de los JSON: se generan a partir de ellos y no deben contener información que no exista en `content.json` / `metadata.json`. Si hay conflicto, los JSON mandan.

---

### 1. `manifest.json` — índice del paquete

Punto de entrada. Un exportador **siempre** lee `manifest.json` primero: le dice qué versión del estándar seguir, qué archivos esperar y cómo verificar integridad.

```jsonc
{
  "packageStandard": "alumfer.content-package/1.0",
  "packageId": "CP-20260701-instagram-dvh-quilmes-v1",
  "createdAt": "2026-07-01T14:32:00-03:00",
  "generatedBy": "creative-os",
  "revision": 1,
  "status": "ready-for-export",        // draft | in-review | ready-for-export | exported
  "files": [
    { "path": "content.json",  "role": "content",   "required": true,  "sha256": "…" },
    { "path": "metadata.json", "role": "metadata",  "required": true,  "sha256": "…" },
    { "path": "assets.json",   "role": "assets",    "required": true,  "sha256": "…" },
    { "path": "captions.md",   "role": "captions",  "required": true },
    { "path": "hashtags.txt",  "role": "hashtags",  "required": true },
    { "path": "checklist.md",  "role": "checklist", "required": true },
    { "path": "preview.md",    "role": "preview",   "required": false }
  ],
  "entrypoints": {
    "content": "content.json",
    "assets": "assets.json"
  },
  "compatibleExporters": ["canva", "figma", "capcut"]
}
```

- `packageStandard` — versión del estándar (semver). Un exportador rechaza paquetes de una versión mayor que no soporta.
- `status` — ciclo de vida del paquete. Un exportador solo procesa `ready-for-export`.
- `sha256` — opcional, permite detectar corrupción o edición manual no autorizada.
- `compatibleExporters` — declaración de intención, no restricción dura: qué destinos se pensaron para esta pieza.

---

### 2. `content.json` — el contenido

El corazón del paquete. Representa **cualquier** tipo de contenido (carrusel, reel, story, post simple, video) mediante un modelo de bloques unificado, no un formato por tipo.

Diseño clave: un contenido es una **secuencia de `blocks`** (slides/escenas/frames), cada uno con **`elements`** tipados. Esto sirve igual para un carrusel de Instagram que para las escenas de un reel de CapCut.

```jsonc
{
  "schemaVersion": "1.0",
  "contentType": "instagram-carousel",   // ver taxonomía en schemas/
  "narrative": {
    "framework": "problema-solucion-prueba",
    "throughline": "Un dormitorio frío en Quilmes deja de serlo con DVH",
    "emotionalArc": ["incomodidad", "reconocimiento", "alivio", "confianza"],
    "primaryEmotion": "alivio",
    "audiencePromise": "Podés dejar de pelear con el frío sin rehacer la casa"
  },
  "blocks": [
    {
      "id": "b1",
      "role": "hook",                     // hook | context | value | proof | cta | cover
      "index": 0,
      "layoutHint": "full-bleed-photo",
      "elements": [
        { "type": "eyebrow",  "text": "Quilmes · DVH" },
        { "type": "headline", "text": "Este dormitorio tenía frío en los cuatro costados." },
        { "type": "image",    "assetRef": "photo.antes.dormitorio" }
      ]
    },
    {
      "id": "b2",
      "role": "value",
      "index": 1,
      "layoutHint": "split-text-image",
      "elements": [
        { "type": "headline", "text": "6 grados de diferencia" },
        { "type": "body",     "text": "El mismo ambiente, sin tocar la calefacción. Solo cambiamos las aberturas por DVH." },
        { "type": "image",    "assetRef": "photo.despues.dormitorio" }
      ]
    },
    {
      "id": "b3",
      "role": "cta",
      "index": 2,
      "layoutHint": "brand-closing",
      "elements": [
        { "type": "headline", "text": "¿Tu casa tiene el mismo problema?" },
        { "type": "cta",      "ctaRef": "whatsapp-presupuesto" },
        { "type": "logo",     "assetRef": "logo.principal" }
      ]
    }
  ],
  "ctas": [
    {
      "id": "whatsapp-presupuesto",
      "intent": "consulta",
      "label": "Escribinos por WhatsApp",
      "action": "whatsapp",
      "target": "{{brand.whatsapp}}",
      "tone": "invitacion-sin-presion"
    }
  ],
  "copyVariants": {
    "headline.short": "6°C menos de frío",
    "headline.long": "6 grados de diferencia sin tocar la calefacción"
  }
}
```

Reglas de `content.json`:
- **Los placeholders `{{brand.*}}`** (ej: `{{brand.whatsapp}}`) se resuelven al exportar contra `../../brand/brand-profile.json` — la fuente única de verdad de los datos de marca. No se escriben a mano.
- **Los textos viven acá**, no en los assets. Un asset es un recurso; el texto es contenido.
- **Toda referencia a un recurso** se hace por `assetRef` (una clave de `assets.json`), nunca por ruta directa. Así el exportador resuelve rutas en un solo lugar.
- **Todo CTA se define una vez** en `ctas[]` y se referencia por `ctaRef`. Evita CTA duplicados o divergentes.
- `role` de cada bloque permite a los exportadores mapear a plantillas sin adivinar la intención.
- `layoutHint` es una **sugerencia**, no una orden: el exportador decide el layout final según su plantilla.

---

### 3. `metadata.json` — contexto estratégico y editorial

Todo lo que *rodea* al contenido: por qué existe, para quién, en qué campaña, con qué prioridad.

```jsonc
{
  "schemaVersion": "1.0",
  "objective": "generar-consultas",       // alcance | engagement | generar-consultas | posicionamiento
  "funnelStage": "consideracion",         // descubrimiento | consideracion | decision | fidelizacion
  "campaign": {
    "id": "invierno-2026",
    "name": "Antes del Invierno",
    "theme": "confort térmico"
  },
  "author": "creative-os",
  "reviewedBy": ["brand-guardian", "quality-controller"],
  "createdAt": "2026-07-01",
  "version": "1.0",
  "language": "es-AR",
  "branding": {
    "brandId": "alumfer",
    "voiceProfile": "artesano",
    "palette": "modo-oscuro",             // ver assets.json para los valores exactos
    "logoUsage": "cierre-solamente"
  },
  "priority": "alta",                      // baja | media | alta | urgente
  "compatiblePlatforms": ["instagram", "facebook"],
  "primaryPlatform": "instagram",
  "publication": {
    "type": "carrusel",                    // reel | carrusel | foto | story | video
    "category": "educativo-transformacion",
    "duration": null,                      // segundos si es video/reel; null si es estático
    "aspectRatio": "4:5",                  // 9:16 | 4:5 | 1:1 | 16:9
    "slideCount": 3
  },
  "geo": {
    "zone": "Zona Sur GBA",
    "neighborhood": "Quilmes"
  },
  "scheduling": {
    "suggestedWindow": "miércoles 19:00-21:00",
    "seasonalRelevance": "otoño-pre-invierno"
  }
}
```

`metadata.json` es lo que la capa de **analytics** usará para correlacionar performance con decisiones (campaña, objetivo, tipo, plantilla). Ver `../../analytics/template-performance.md`.

---

### 4. `assets.json` — inventario de recursos visuales

Lista **absolutamente todos** los recursos que el diseñador necesita para renderizar la pieza. Nada visual debe darse por supuesto. Cada asset se referencia por una **clave estable** (la misma que usa `content.json` en `assetRef`).

Rutas **siempre relativas** a la raíz del paquete.

```jsonc
{
  "schemaVersion": "1.0",
  "assets": {
    "logo.principal":       { "type": "logo",       "path": "assets/logos/alumfer-blanco.svg", "required": true },
    "photo.antes.dormitorio": { "type": "photo",     "path": "assets/fotos/quilmes-antes.jpg",   "required": true, "alt": "Dormitorio con ventana vieja de madera" },
    "photo.despues.dormitorio":{ "type": "photo",    "path": "assets/fotos/quilmes-despues.jpg",  "required": true, "alt": "Mismo dormitorio con ventana DVH" }
  },
  "video": [],
  "brollHints": ["corte de perfil en taller", "sellado de junta"],
  "graphicElements": {
    "accent.bar": { "type": "shape", "description": "Barra azul 3px, borde izquierdo de títulos", "color": "brand.blue" }
  },
  "palette": {
    "brand.carbon":         "#1A1C1E",
    "brand.steel":          "#2E3338",
    "brand.concrete.faint": "#F5F4F1",
    "brand.concrete.light": "#E8E4DC",
    "brand.blue":           "#1B6CC8",
    "text.on-dark.strong":  "#FFFFFF",
    "text.on-dark.muted":   "rgba(255,255,255,0.60)"
  },
  "typography": {
    "heading": { "family": "Montserrat", "weight": 600, "tracking": "-0.02em" },
    "subhead": { "family": "Inter",      "weight": 400, "tracking": "0.06em", "transform": "uppercase" },
    "body":    { "family": "Inter",      "weight": 400 }
  },
  "backgrounds": {
    "bg.dark": { "type": "solid", "color": "brand.carbon" }
  },
  "textures": [],
  "mockups": [],
  "renders": []
}
```

Categorías soportadas (todas opcionales salvo `assets` y `palette`): `logos`, `íconos`, `fotografías`, `videos`, `b-roll`, `mockups`, `renders`, `colores`, `tipografías`, `elementos gráficos`, `fondos`, `texturas`.

Regla de oro: **si el exportador no encuentra un asset `required: true` en la ruta indicada, la exportación falla** (validador `asset-existence`).

---

### 5. `captions.md` — captions por plataforma

Texto publicable, **ya adaptado a cada red**, listo para copiar y pegar. No es el mismo texto repetido: cada plataforma tiene su longitud, tono y estructura.

```markdown
## Instagram
Este dormitorio en Quilmes tenía frío en los cuatro costados.
Cambiamos las aberturas por DVH y hoy hay 6 grados de diferencia, sin tocar la calefacción.
¿Tu casa tiene el mismo problema? Escribinos y te orientamos.

## Facebook
[versión un poco más explicativa, mismo mensaje, tono cercano]

## LinkedIn
[versión con foco en el aspecto técnico/profesional del DVH — para el canal B2B de arquitectos]

## TikTok
[versión corta, gancho directo en la primera línea]

## Google Business
[versión orientada a búsqueda local: incluye "aberturas de aluminio Quilmes" con naturalidad]
```

Cada sección se genera respetando `brand/voice.md` (tono por canal). El exportador toma de acá el caption correspondiente a `metadata.primaryPlatform`.

---

### 6. `hashtags.txt` — hashtags clasificados

Hashtags agrupados por **función**, no una lista plana. Permite al exportador (o al publicador) elegir el set según la plataforma y el momento.

```
# principales
#aberturasdealuminio #dvh #ventanasdealuminio

# secundarios
#confortermico #eficienciaenergetica #reformasdelhogar

# locales
#quilmes #zonasur #gba

# seo
#ventanasdvhquilmes #aberturasdealuminioquilmes

# marca
#alumfer #alumferarg
```

Convenciones: minúsculas, sin acentos, un hashtag por token. El bloque `# marca` es fijo. Total recomendado publicado: 5–15 (ver `skills/seo-instagram.md`).

---

### 7. `checklist.md` — QA pre-exportación

Estado de verificación antes de exportar. Lo completa el **Quality Controller**; el exportador **no exporta si hay ítems críticos sin marcar**. Se deriva del checklist de `skills/quality-control.md`, reducido a lo que el paquete puede garantizar.

```markdown
# Checklist de exportación — CP-20260701-instagram-dvh-quilmes-v1

## Marca
- [x] Brand Voice: tono artesano, sin clichés prohibidos
- [x] Colores dentro de la paleta de marca
- [x] Tipografía Montserrat / Inter

## Contenido
- [x] CTA presente y no vacío
- [x] Ortografía revisada
- [x] Longitud de textos dentro de límites de la plantilla
- [x] Claridad del mensaje
- [x] Valor real para la audiencia
- [x] Legibilidad (contraste, jerarquía visual)

## Estructura
- [x] Jerarquía de bloques coherente (hook → valor → CTA)
- [x] Compatibilidad con la plataforma destino (aspect ratio, nº de slides)

## Assets
- [x] Todos los assets required existen en las rutas indicadas
- [x] Sin nombres/claves duplicadas

**Estado:** ✅ APROBADO PARA EXPORTAR — 2026-07-01, quality-controller
```

Los criterios cubiertos son exactamente los pedidos por el estándar: Brand Voice, Colores, Tipografía, CTA, Ortografía, Longitud, Claridad, Valor, Legibilidad, Jerarquía, Compatibilidad con plataforma.

---

### 8. `preview.md` — vista rápida humana

Permite revisar **todo el paquete sin abrir un solo JSON**. Es una proyección legible; no agrega información. Ideal para aprobación rápida en el celular.

```markdown
# Preview — DVH en Quilmes (carrusel Instagram)

**Objetivo:** generar consultas · **Embudo:** consideración · **Campaña:** Antes del Invierno
**Plataforma:** Instagram (4:5, 3 slides) · **Prioridad:** alta

## Resumen
Un dormitorio frío en Quilmes deja de serlo con DVH. Dato ancla: 6 grados de diferencia.

## Miniatura textual
> [Foto antes: ventana vieja] "Este dormitorio tenía frío en los cuatro costados."

## Slides
1. **Hook** — "Este dormitorio tenía frío en los cuatro costados." (foto antes)
2. **Valor** — "6 grados de diferencia" (foto después)
3. **CTA** — "¿Tu casa tiene el mismo problema?" + WhatsApp + logo

## Caption (Instagram)
Este dormitorio en Quilmes tenía frío en los cuatro costados. …

## CTA
Escribinos por WhatsApp → consulta, tono invitación sin presión

## Assets necesarios
- Logo principal (SVG blanco)
- Foto antes del dormitorio
- Foto después del dormitorio
- Paleta modo oscuro · Montserrat 600 / Inter 400
```

---

## Ciclo de vida del paquete

```
draft ──▶ in-review ──▶ ready-for-export ──▶ exported
  │           │               │
  │           │               └─ el Quality Controller marcó checklist.md OK
  │           └─ Brand Guardian + QC revisando
  └─ generado por content-packaging skill, aún incompleto
```

Un exportador **solo** acepta paquetes en estado `ready-for-export`. Cualquier otro estado se rechaza en la etapa de validación con un mensaje claro.

---

## Reglas invariantes (contract)

1. Un Content Package es **autocontenido**: todo lo necesario para renderizar está adentro (o referenciado por ruta relativa interna).
2. **Una única fuente de verdad por dato.** Los `.md` derivan de los `.json`.
3. **Ninguna ruta absoluta.** Todo es relativo a la raíz del paquete.
4. **Toda referencia cruzada usa claves** (`assetRef`, `ctaRef`), nunca copias del valor.
5. El paquete es **agnóstico de herramienta**: no contiene nada específico de Canva/Figma/CapCut.
6. Es **validable**: cada `.json` cumple su JSON Schema (ver `../canva/schemas/` y `schemas` compartidos).
7. Es **inmutable una vez `exported`**: cambios generan una nueva versión (`v{n+1}`), no editan la anterior.

---

## Relación con el resto del Creative OS

- Lo **produce** el skill `skills/content-packaging.md`, a partir de la salida de cualquier workflow.
- Lo **consume** cualquier exportador que implemente `core/exporter-interface.md`.
- Lo **valida** la capa `shared/validators/`.
- Lo **audita** el Quality Controller (llena `checklist.md`).
- Lo **aprende** la capa `analytics/` correlacionando `metadata.json` + plantilla usada con performance real.
