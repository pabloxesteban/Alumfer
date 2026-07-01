# Serializers Compartidos

> Convierten un `VariableMap` (o cualquier estructura del paquete) en el **formato de archivo** que una herramienta consume. Cubren la etapa `transform()` del ciclo del exportador.

Un serializador no sabe nada de marca ni de plantillas: recibe filas y devuelve bytes en un formato. Esa ignorancia deliberada es lo que los hace 100% reutilizables.

| Serializador | Convierte a | Lo usa |
|---|---|---|
| `csv.md` | CSV (RFC 4180) | Canva Bulk Create, cualquier import tabular |
| `json.md` | JSON estructurado | Canva JSON, Figma, APIs futuras |
| `bulk-create.md` | Formato específico de "Bulk Create" (perfil de CSV/JSON) | Canva, Adobe Express |

## Contrato común
- **Entrada:** filas homogéneas (mismas claves en todas) + opciones de formato.
- **Salida:** un artefacto en memoria `{ name, format, bytes }` (no toca disco; eso es `emit()`).
- **Determinismo:** mismas filas → mismos bytes. Orden de columnas estable.
- **Encoding:** siempre UTF-8. Sin BOM salvo que la herramienta lo exija (Canva no lo exige).

## Por qué separar serializador de mapper
El mapper decide *qué* datos van; el serializador decide *cómo se escriben*. Cambiar de CSV a JSON no debe tocar el mapeo, y cambiar el mapeo no debe tocar el formato. Separación de responsabilidades pura.
