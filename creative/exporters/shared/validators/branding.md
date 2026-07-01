# Validador: `branding`

La última defensa de marca dentro del pipeline técnico. Verifica que el paquete respete la voz, el uso de logo y el territorio de marca definidos en `brand/`. Complementa (no reemplaza) al Brand Guardian humano.

## Input
- `LoadedPackage.content` (textos y CTAs)
- `LoadedPackage.metadata.branding`
- Referencias vivas: `brand/voice.md`, `brand/brand-dna.md`, `brand/visual-language.md`

## Reglas

### Palabras prohibidas (de `brand/voice.md`) → `blocking`
```
económico · delivery · innovador · soluciones · 100% · el mejor
```
Y los anti-patrones de caption (`agents/copywriter.md`):
```
"el mejor" · "al mejor precio" · "número uno" · "no te pierdas" · "los más modernos"
```

### Uso de logo → `blocking`
- `metadata.branding.logoUsage` debe ser `cierre-solamente`. Si un bloque con `role` distinto de `cta`/`cover` incluye un elemento `logo`, es error (regla: "logo solo al final").

### Tono → `warning`
- Urgencia artificial ("solo hoy", "últimas unidades"), superlativos sin evidencia, tono corporativo. No bloquea, pero se reporta para revisión.

### Coherencia de perfil → `info`
- `voiceProfile` debe ser `artesano`. Otro valor se marca como `info` para revisión manual.

## Output
Hallazgos con la palabra/frase detectada y su ubicación (`blockId`, tipo de elemento).

## Nota de diseño
El validador no reescribe. Detecta y devuelve. La corrección la hace el Copywriter y el paquete se re-versiona. Así el aprendizaje de marca queda en los agentes, no escondido en el exportador.
