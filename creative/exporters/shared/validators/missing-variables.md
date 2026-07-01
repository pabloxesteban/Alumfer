# Validador: `missing-variables`

Garantiza que la plantilla de destino reciba **todas** las variables que necesita. Una variable sin dato produce un slide con un hueco en la herramienta de diseño.

## Input
- `TemplateBinding.template.variables[]` — variables declaradas por la plantilla, con flag `required`
- El `VariableMap` (o el `LoadedPackage` en pre-flight)

## Reglas
- Toda variable `required: true` de la plantilla debe tener un valor no vacío mapeado desde el paquete → si falta, `blocking`.
- Variables `required: false` sin dato → `info` (se dejan vacías intencionalmente).
- Una variable presente en el paquete que **no existe** en la plantilla → `warning` (dato que se perderá al exportar).

## Output
```jsonc
{ "validator": "missing-variables", "severity": "blocking",
  "target": { "variable": "CTA" },
  "message": "La plantilla 'instagram-carousel' requiere 'CTA' pero el paquete no la provee en el bloque de cierre" }
```

## Relación con otras etapas
Este validador es la contraparte de `resolveTemplate()`: la plantilla declara qué necesita, el validador confirma que el paquete lo cumple antes de `map()`.
