# Mappers Compartidos

> Traducen el mundo agnóstico del Content Package al mundo concreto de una plantilla. Cubren las etapas `resolveTemplate()` y `map()` del ciclo del exportador.

Dos responsabilidades separadas (una por archivo):

| Mapper | Etapa | Pregunta que responde |
|---|---|---|
| `template-selection.md` | `resolveTemplate()` | ¿Qué plantilla es la correcta para este paquete? |
| `content-to-variables.md` | `map()` | ¿Cómo se convierte el contenido en las variables de esa plantilla? |

## Por qué son shared

La lógica de "un bloque `role: hook` alimenta la variable de titular principal" es **la misma** para Canva, Figma o CapCut. Solo cambian los nombres de las variables (definidos en las plantillas de cada exportador). Manteniendo el mapeo acá, un exportador nuevo hereda toda la inteligencia de mapeo y solo declara sus nombres de variables.

## Contrato

- Los mappers **no** inventan contenido. Si falta un dato, lo dejan sin mapear y `missing-variables` lo detecta.
- Los mappers **no** truncan texto. Si un texto no entra, `text-length` lo reporta; recortar es decisión del Copywriter.
- Los mappers son **deterministas**: mismo paquete + misma plantilla → mismo `VariableMap`.
