# Validador: `empty-cta`

Verifica que todo llamado a la acción esté presente, resuelto y con destino. Un CTA vacío es una pieza que pide algo pero no dice qué — el error más caro en contenido de conversión.

## Input
- `content.json` → `blocks[]` con `role: cta` y el array `ctas[]`

## Reglas
- Todo bloque con `role: cta` debe contener un elemento con `ctaRef` → si no, `blocking`.
- Todo `ctaRef` debe resolver a una entrada de `ctas[]` → si no resuelve, `blocking` (referencia rota).
- El CTA resuelto debe tener `label` no vacío, `action` válido y `target` no vacío → `blocking` si falta cualquiera.
- Un paquete de tipo con conversión esperada (`objective: generar-consultas`) sin **ningún** bloque CTA → `blocking`.
- `action: whatsapp` con `target` que no resuelve a `{{brand.whatsapp}}` o a un número válido → `warning`.

## Acciones válidas
```
whatsapp · link-bio · dm · comentar · guardar · compartir · visitar-web
```

## Output
```jsonc
{ "validator": "empty-cta", "severity": "blocking",
  "target": { "blockId": "b3", "ctaRef": "whatsapp-presupuesto" },
  "message": "El CTA 'whatsapp-presupuesto' no tiene 'label'" }
```

## Nota
El tono del CTA (`tone: invitacion-sin-presion`) lo valida `branding`, no este validador. Acá solo importa que exista y funcione.
