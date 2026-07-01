# Canva Exporter

> Primer exportador del Creative OS. Convierte un **Content Package** en artefactos listos para Canva: CSV y JSON para **Bulk Create**, mapa de variables, mapeo de plantillas y manifest de assets.
> Implementa el contrato de `../core/exporter-interface.md`. **Está completamente desacoplado del resto del sistema**: no conoce agentes, workflows ni el website. Solo conoce el estándar Content Package y Canva.

---

## Descripción (`describe()`)

```jsonc
{
  "id": "canva",
  "name": "Canva Exporter",
  "version": "1.0.0",
  "targetPlatform": "Canva",
  "consumesStandard": "alumfer.content-package/1.x",
  "supportedContentTypes": [
    "instagram-carousel", "story", "quote", "before-after", "testimonial",
    "faq", "reel-cover", "promo", "oferta", "comparativa", "educativo"
  ],
  "outputFormats": ["canva-bulk-csv", "canva-bulk-json", "variable-map", "asset-manifest", "export-report"],
  "capabilities": {
    "bulkCreate": true,
    "templateMapping": true,
    "assetUpload": false,
    "roundTrip": false
  }
}
```

`assetUpload: false` es intencional: Canva no permite subir assets mediante import de datos. El exportador **lista** los assets a subir (en `asset-manifest.csv`) y el humano los sube una vez a Canva; luego Bulk Create los conecta por nombre.

---

## Qué produce

Para un paquete, el Canva Exporter emite en `exports/<packageId>/`:

| Artefacto | Formato | Para qué sirve |
|---|---|---|
| `bulk-create.csv` | CSV | Input directo de Canva **Bulk Create** (una fila = un diseño/slide). |
| `bulk-create.json` | JSON | Mismo contenido, expresivo y versionable; base para automatización futura. |
| `variables.json` | JSON | El `VariableMap` completo (variables por slide) para auditoría. |
| `template-map.json` | JSON | Qué plantilla de Canva usar y cómo se conecta cada variable. |
| `asset-manifest.csv` | CSV | Lista de assets a subir a Canva (nombre + ruta + tipo + uso). |
| `report.md` / `report.json` | MD + JSON | Reporte final: resultado, warnings, próximos pasos, branding verificado. |

---

## Ciclo de exportación (implementación del contrato)

El Canva Exporter implementa las **siete etapas** en orden. Reutiliza `shared/` y agrega solo lo específico de Canva.

### 1. `supports(package)`
- Verifica `manifest.packageStandard` dentro de `1.x`.
- Verifica `content.contentType` ∈ `supportedContentTypes`. Si no está, `supported: true` con warning (se usará plantilla genérica).
- Verifica `manifest.status == "ready-for-export"`. Si no, `supported: false`.

### 2. `load(packagePath)`
- Lee `manifest.json` → `content.json` → `metadata.json` → `assets.json`.
- Resuelve todos los `assetRef` y `ctaRef`; expande placeholders `{{brand.*}}`.
- Devuelve `LoadedPackage` normalizado.

### 3. `validate(loaded)`
Corre, en este orden, los validadores de `shared/validators/`:
`duplicate-names` → `missing-variables` → `empty-cta` → `asset-existence` → `text-length` → `colors` → `typography` → `branding`.
Agrega dos validaciones **específicas de Canva**:
- **`canva-slide-limit`** — Bulk Create admite hasta 100 filas por lote; `blocks.length ≤ maxSlides` de la plantilla y ≤ 100. (blocking)
- **`canva-image-names`** — los basenames de imagen deben ser únicos (Canva conecta por nombre). Colisión → blocking.

Si hay algún `blocking`, **aborta acá**.

### 4. `resolveTemplate(loaded)`
Delegado a `shared/mappers/template-selection.md`. El catálogo de plantillas es `canva/templates/`. Devuelve el `TemplateBinding` con la plantilla de Canva y sus nombres de variable (en español: `Volanta`, `Titular`, `Texto`, `Imagen`, `CTA`, `Logo`, `Dato`).

### 5. `map(loaded, binding)`
Delegado a `shared/mappers/content-to-variables.md`, con el renombrado a los nombres de variable de la plantilla de Canva. Produce el `VariableMap` (una fila por slide).

### 6. `transform(variableMap)`
Usa `shared/serializers/`:
- `bulk-create.md` (perfil CSV + JSON) → `bulk-create.csv`, `bulk-create.json`.
- `json.md` → `variables.json`, `template-map.json`.
- Genera `asset-manifest` (ver formato abajo).

### 7. `emit(artifactSet, outDir)`
Escribe todo a `canva/exports/<packageId>/`. Idempotente.

### 8. `report(emitResult)`
Genera `report.md` + `report.json`. Incluye **verificación de branding** (resultado del validador `branding`) y los **próximos pasos** operativos en Canva.

---

## `asset-manifest.csv` — formato

Canva conecta imágenes por nombre. El manifest le dice al humano qué subir:

```csv
nombre_en_canva,archivo_origen,tipo,usado_en_slides,requerido
alumfer-blanco.svg,assets/logos/alumfer-blanco.svg,logo,3,si
quilmes-antes.jpg,assets/fotos/quilmes-antes.jpg,photo,1,si
quilmes-despues.jpg,assets/fotos/quilmes-despues.jpg,photo,2,si
```

- `nombre_en_canva` — el nombre exacto que debe tener el asset en Canva para que Bulk Create lo conecte (= basename del archivo).
- `usado_en_slides` — en qué filas del CSV aparece; ayuda a verificar cobertura.

---

## `template-map.json` — formato

Explicita cómo cada variable de la plantilla de Canva se alimenta desde el paquete. Es el puente auditable entre ambos mundos:

```jsonc
{
  "canvaTemplate": "Instagram Carousel Alumfer",
  "templateId": "instagram-carousel",
  "aspectRatio": "4:5",
  "variableBindings": {
    "Volanta":  { "from": "eyebrow",   "maxChars": 40 },
    "Titular":  { "from": "headline",  "maxChars": 90 },
    "Texto":    { "from": "body",      "maxChars": 220 },
    "Imagen":   { "from": "image",     "type": "asset" },
    "CTA":      { "from": "cta_label", "maxChars": 32 },
    "Logo":     { "from": "logo",      "type": "asset", "slidesOnly": ["cta"] }
  }
}
```

---

## Cómo se usa el output en Canva (próximos pasos que el reporte imprime)

1. Abrir la plantilla de Canva indicada en `template-map.json` (ej: *Instagram Carousel Alumfer*).
2. Subir a Canva los assets listados en `asset-manifest.csv` con el `nombre_en_canva` exacto.
3. **Apps → Bulk Create → Import CSV** → cargar `bulk-create.csv`.
4. Conectar cada columna del CSV al elemento correspondiente de la plantilla (guía en `template-map.json`).
5. Generar los diseños. Revisar contra `preview.md` del paquete.

El exportador **no diseña**: prepara todo para que el paso en Canva sea mecánico y sin decisiones creativas.

---

## Desacoplamiento (garantías)

- El Canva Exporter **no importa** nada de `agents/`, `workflows/`, `brand/` ni `apps/`. Su único input es un Content Package en disco.
- No modifica el paquete. Si valida mal, reporta y termina.
- Toda su lógica reutilizable vive en `shared/`. Este archivo solo aporta lo *canva-específico*: límites de Bulk Create, nombres de variable en español, conexión de imágenes por nombre y los pasos operativos.
- Reemplazar Canva por otra herramienta no requiere tocar nada fuera de `canva/`.
