# Serializer: JSON

Convierte estructuras del paquete en JSON estable, para exportadores que consumen JSON (Canva JSON import, Figma plugin, APIs de programación futuras).

## Input
- Cualquier estructura serializable (típicamente el `VariableMap` completo o un `ArtifactSet`)
- `options` — `{ pretty?: true, sortKeys?: false }`

## Reglas
- **Claves ordenadas de forma estable.** Con `sortKeys: false` (default), respeta el orden de inserción; con `true`, orden alfabético. Nunca aleatorio → diffs limpios en git.
- **Indentación** de 2 espacios cuando `pretty: true`; compacto cuando `false`.
- **UTF-8**, sin escapar caracteres no-ASCII (los acentos van literales: `"diseño"`, no `"diseño"`).
- **Números** sin notación científica; **fechas** en ISO 8601.
- **null explícito** para campos intencionalmente vacíos (no se omiten); esto conserva el schema.

## Forma canónica de export JSON (Canva)
```jsonc
{
  "template": "instagram-carousel",
  "packageId": "CP-20260701-instagram-dvh-quilmes-v1",
  "slides": [
    { "slide": 1, "variables": { "eyebrow": "Quilmes · DVH", "headline": "…", "image": "quilmes-antes.jpg" } },
    { "slide": 2, "variables": { "headline": "6 grados de diferencia", "body": "…", "image": "quilmes-despues.jpg" } },
    { "slide": 3, "variables": { "headline": "¿Tu casa…?", "cta_label": "Escribinos por WhatsApp", "logo": "alumfer-blanco.svg" } }
  ]
}
```

## Output
`{ "name": "bulk-create.json", "format": "canva-bulk-json", "bytes": "…" }`

## Por qué también JSON además de CSV
El CSV es lo que Canva Bulk Create consume hoy. El JSON es el formato durable y expresivo: soporta anidamiento (variables por slide, metadatos), es el input natural de Figma y de cualquier automatización futura, y es más fácil de versionar y auditar. Emitir ambos no cuesta y prepara el terreno para nuevos exportadores.
