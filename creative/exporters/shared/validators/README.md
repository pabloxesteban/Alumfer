# Validadores Compartidos

> Corren en la etapa `validate()` de cualquier exportador. Verifican que un Content Package esté completo, correcto y dentro de marca **antes** de generar cualquier artefacto.

Ningún validador modifica el paquete. Cada uno recibe el `LoadedPackage` (+ el `TemplateBinding` cuando aplica) y devuelve una lista de hallazgos con severidad.

## Formato de hallazgo (común a todos)

```jsonc
{
  "validator": "text-length",
  "severity": "warning",              // blocking | warning | info
  "target": { "blockId": "b1", "elementType": "headline" },
  "message": "Headline de 82 caracteres; la plantilla recomienda ≤ 60",
  "expected": "≤ 60",
  "actual": 82
}
```

## Catálogo de validadores

| Validador | Qué detecta | Severidad por defecto |
|---|---|---|
| `text-length` | Texto que excede el máximo de la plantilla/plataforma | warning (blocking si > 130% del máximo) |
| `missing-variables` | Variables requeridas por la plantilla sin dato en el paquete | blocking |
| `branding` | Voz/tono fuera de marca, uso de logo incorrecto, palabras prohibidas | blocking (logo/paleta) · warning (tono) |
| `colors` | Colores fuera de la paleta de marca | blocking |
| `asset-existence` | Assets `required` que no existen en la ruta indicada | blocking |
| `empty-cta` | Bloques con `role: cta` sin CTA resuelto, o `ctaRef` roto | blocking |
| `typography` | Familias/pesos tipográficos fuera del sistema (Montserrat/Inter) | blocking |
| `duplicate-names` | Claves de asset, IDs de bloque o nombres de variable duplicados | blocking |

Detalle de cada uno en su archivo correspondiente. Los cuatro que el estándar destaca explícitamente —texto largo, variables faltantes, errores de branding, assets inexistentes— más CTA vacíos, colores inválidos, tipografía incorrecta y nombres duplicados.

## Orden de ejecución

Los validadores estructurales corren primero (más baratos, cortan antes):

```
1. duplicate-names      (integridad de claves)
2. missing-variables    (completitud)
3. empty-cta            (completitud de CTA)
4. asset-existence      (I/O)
5. text-length          (encaje en plantilla)
6. colors               (marca)
7. typography           (marca)
8. branding             (marca — el más costoso, requiere leer brand/voice.md)
```

Todos corren aunque uno falle (se acumulan hallazgos), pero si al final hay ≥ 1 `blocking`, `validate()` devuelve `ok: false` y el pipeline aborta.
