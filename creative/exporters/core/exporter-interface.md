# Exporter Interface — Contrato Común de Exportadores

> Toda herramienta de destino (Canva, Figma, CapCut, Adobe Express, Meta Business Suite, Buffer, Later, Hootsuite…) se integra al Creative OS implementando **exactamente esta misma interfaz**.
> Agregar un exportador nuevo **no debe requerir tocar el resto del sistema.**

---

## Objetivo del contrato

Un exportador es una función pura de alto nivel:

```
Exporter: (Content Package)  ──▶  (Artefactos listos para una herramienta + Reporte)
```

El resto del Creative OS conoce **solo esta interfaz**, nunca la implementación concreta. Esto es Inversión de Dependencias: los agentes y workflows dependen de la abstracción `Exporter`, no de `CanvaExporter`. Podés reemplazar, agregar o quitar exportadores sin que nada más se entere.

### Principios que garantiza

| Principio SOLID | Cómo lo aplica el contrato |
|---|---|
| **S**ingle Responsibility | Cada etapa del ciclo hace una sola cosa (cargar, validar, mapear, transformar, emitir, reportar). |
| **O**pen/Closed | El sistema se extiende con exportadores nuevos sin modificar los existentes ni el core. |
| **L**iskov Substitution | Cualquier exportador es intercambiable donde se espera un `Exporter`. Mismos inputs, mismo shape de outputs. |
| **I**nterface Segregation | El contrato se divide en capacidades (`describe`, `supports`) y ejecución (`load…report`); un consumidor puede usar solo lo que necesita. |
| **D**ependency Inversion | El core depende de la interfaz; los exportadores dependen del core. Nunca al revés. |

---

## El ciclo de vida del exportador

Todo exportador implementa **siete etapas**, siempre en este orden. Cada etapa recibe la salida de la anterior y produce una entrada tipada para la siguiente (pipeline explícito, sin estado oculto compartido).

```
describe()                      ── metadatos y capacidades del exportador (sin efectos)
   │
supports(package) ──────────────── ¿puede este exportador manejar este paquete?
   │
   ▼
load(packagePath) ──────────────── LoadedPackage      (parsea y normaliza el paquete)
   │
validate(loaded) ───────────────── ValidationReport   (pre-flight; corta si hay errores bloqueantes)
   │
resolveTemplate(loaded) ────────── TemplateBinding     (elige y liga la plantilla de destino)
   │
map(loaded, binding) ───────────── VariableMap         (mapea contenido → variables de la plantilla)
   │
transform(variableMap) ─────────── ArtifactSet         (genera los artefactos específicos del destino)
   │
emit(artifactSet, outDir) ──────── EmitResult          (serializa a disco)
   │
report(emitResult) ─────────────── ExportReport        (resumen humano + máquina)
```

> Los nombres son el contrato canónico de Alumfer. Un exportador puede tener helpers internos con otros nombres, pero **debe exponer estas siete etapas con esta semántica**.

---

## Especificación de cada etapa

### `describe() → ExporterDescriptor`
Declara qué es y qué sabe hacer el exportador. **Sin efectos secundarios, sin leer el paquete.** Es lo que permite construir un registro de exportadores disponibles.

```jsonc
{
  "id": "canva",
  "name": "Canva Exporter",
  "version": "1.0.0",
  "targetPlatform": "Canva",
  "consumesStandard": "alumfer.content-package/1.x",   // rango semver que entiende
  "supportedContentTypes": ["instagram-carousel", "story", "quote", "reel-cover", "..."],
  "outputFormats": ["canva-bulk-csv", "canva-bulk-json", "asset-manifest", "variable-map"],
  "capabilities": {
    "bulkCreate": true,
    "templateMapping": true,
    "assetUpload": false,        // Canva no permite subir assets vía export; se listan en manifest
    "roundTrip": false
  }
}
```

### `supports(package) → CompatibilityReport`
Responde si este exportador puede procesar este paquete, **antes** de intentarlo. Chequea versión del estándar, `contentType`, plataforma. No lanza: devuelve un reporte.

```jsonc
{ "supported": true, "reasons": [], "warnings": ["contentType 'faq' se mapeará a plantilla genérica"] }
```

Permite al Creative OS **elegir automáticamente** el exportador correcto para un paquete, o avisar si ninguno aplica.

### `load(packagePath) → LoadedPackage`
Lee el paquete desde disco y lo normaliza a una estructura en memoria. Resuelve `manifest.json` primero, luego el resto. Resuelve todos los `assetRef` y `ctaRef` a sus valores. **No valida reglas de negocio** (eso es la etapa siguiente); solo parsea y normaliza. Falla solo si el paquete no es parseable.

### `validate(loaded) → ValidationReport`
Corre la batería de validadores compartidos (`shared/validators/`) más los específicos del exportador. Es el **pre-flight**: si hay errores bloqueantes, el pipeline se detiene acá y nunca se emite nada.

```jsonc
{
  "ok": false,
  "blocking": [
    { "validator": "asset-existence", "assetRef": "photo.despues.dormitorio", "message": "Archivo no encontrado: assets/fotos/quilmes-despues.jpg" }
  ],
  "warnings": [
    { "validator": "text-length", "blockId": "b1", "message": "Headline de 82 caracteres; la plantilla recomienda ≤ 60" }
  ],
  "summary": { "blockingCount": 1, "warningCount": 1 }
}
```

Regla: **`blocking.length > 0` ⇒ el pipeline aborta**. Los `warnings` no abortan pero viajan hasta el `report`.

### `resolveTemplate(loaded) → TemplateBinding`
Elige la plantilla de destino apropiada (por `contentType`, `publication.type`, `aspectRatio`, `slideCount`) y la liga al paquete. Si `metadata` no fuerza una plantilla, aplica la lógica de selección del mapper (`shared/mappers/`). Verifica restricciones de la plantilla (p. ej. nº máximo de slides).

```jsonc
{
  "templateId": "instagram-carousel",
  "templateVersion": "1.0",
  "matchedBy": "contentType",       // contentType | publication.type | fallback
  "constraintsChecked": true,
  "unboundVariables": []            // variables de la plantilla sin dato en el paquete
}
```

### `map(loaded, binding) → VariableMap`
Traduce el contenido agnóstico a las **variables concretas de la plantilla**. Acá vive el conocimiento "bloque `role:hook` → variable `Titular_1`". Es la frontera entre el mundo Alumfer y el mundo de la herramienta.

```jsonc
{
  "rows": [
    { "Titular": "Este dormitorio tenía frío…", "Imagen": "assets/fotos/quilmes-antes.jpg", "CTA": "" },
    { "Titular": "6 grados de diferencia",       "Imagen": "assets/fotos/quilmes-despues.jpg", "CTA": "" },
    { "Titular": "¿Tu casa tiene el mismo problema?", "Imagen": "", "CTA": "Escribinos por WhatsApp" }
  ],
  "unmapped": []
}
```

### `transform(variableMap) → ArtifactSet`
Produce los artefactos en el/los formatos del destino (CSV de Bulk Create, JSON, mapa de variables, manifest de assets…). Usa los serializadores de `shared/serializers/`. **No toca disco todavía** — devuelve los artefactos en memoria.

```jsonc
{
  "artifacts": [
    { "name": "bulk-create.csv",   "format": "canva-bulk-csv",  "bytes": "…" },
    { "name": "bulk-create.json",  "format": "canva-bulk-json", "bytes": "…" },
    { "name": "asset-manifest.csv","format": "asset-manifest",  "bytes": "…" },
    { "name": "variables.json",    "format": "variable-map",    "bytes": "…" }
  ]
}
```

### `emit(artifactSet, outDir) → EmitResult`
Escribe los artefactos a `outDir` (por convención, `<exporter>/exports/<packageId>/`). Es la **única etapa con efectos de escritura**. Idempotente: reejecutar sobre el mismo paquete produce el mismo output.

```jsonc
{
  "outputDir": "canva/exports/CP-20260701-instagram-dvh-quilmes-v1/",
  "written": ["bulk-create.csv", "bulk-create.json", "asset-manifest.csv", "variables.json"],
  "bytesTotal": 4821
}
```

### `report(emitResult) → ExportReport`
Genera el reporte final: qué se exportó, qué warnings quedaron, qué debe hacer el humano a continuación (p. ej. "subí estos 3 assets a Canva antes de correr Bulk Create"). Doble salida: un `report.md` legible y un `report.json` para analytics.

```jsonc
{
  "packageId": "CP-20260701-instagram-dvh-quilmes-v1",
  "exporter": "canva",
  "result": "success-with-warnings",   // success | success-with-warnings | failed
  "template": "instagram-carousel",
  "artifacts": 4,
  "warnings": 1,
  "nextSteps": [
    "Subir a Canva los 2 assets listados en asset-manifest.csv",
    "En Canva: Bulk Create → conectar bulk-create.csv a la plantilla 'Instagram Carousel Alumfer'"
  ],
  "brandingVerified": true,
  "timestamp": "2026-07-01T14:40:00-03:00"
}
```

---

## Contrato de errores

El pipeline es **fail-fast y explícito**. Ningún exportador "adivina" ni corrige contenido por su cuenta.

| Situación | Etapa que la detecta | Comportamiento |
|---|---|---|
| Paquete no parseable | `load` | Aborta con error de formato |
| Versión de estándar incompatible | `supports` / `validate` | Rechaza con mensaje de versión |
| Estado ≠ `ready-for-export` | `validate` | Rechaza; indica el estado actual |
| Asset `required` faltante | `validate` | Error bloqueante |
| CTA vacío / variable sin dato | `validate` / `map` | Bloqueante o warning según severidad |
| Texto excede la plantilla | `validate` | Warning (no bloquea, pero se reporta) |

Regla invariante: **un exportador nunca modifica el Content Package.** Si algo está mal, lo reporta y el paquete vuelve al flujo creativo para corregirse y re-versionarse.

---

## Cómo agregar un exportador nuevo (checklist de extensión)

1. Crear la carpeta `exporters/<nombre>/` con la misma estructura que `canva/`.
2. Escribir `<nombre>/exporter.md` implementando las **siete etapas** de este contrato.
3. Definir sus plantillas en `<nombre>/templates/` y schemas en `<nombre>/schemas/`.
4. Reutilizar `shared/validators`, `shared/mappers`, `shared/serializers` — solo agregar lo específico del destino.
5. Registrar el exportador en `compatibleExporters` del estándar y en el README de `exporters/`.
6. **No tocar nada fuera de `exporters/<nombre>/` y el registro.** Si necesitás cambiar el core, es señal de que algo del contrato falta — discutirlo antes.

> Si al agregar un exportador aparece lógica que también sirve a otros (un serializador de CSV, un validador de colores), **subilo a `shared/`** en vez de duplicarlo. La regla es: dos usos → `shared/`.

---

## Registro de exportadores (conceptual)

El Creative OS mantiene un registro implícito: la lista de carpetas bajo `exporters/` que contienen un `exporter.md`. Para elegir el exportador de un paquete:

```
1. Leer manifest.compatibleExporters del paquete
2. Para cada exportador candidato: correr supports(package)
3. Elegir el primero con supported: true
4. Ejecutar su ciclo load → … → report
```

Esto permite que un mismo paquete se exporte a múltiples destinos (Canva para el carrusel, CapCut para el reel) sin cambios en el contenido.
