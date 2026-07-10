# 11 · Quality Control — Revisión final

> Agente: **Quality Controller** (última línea antes de publicar) + **Test de las 8 preguntas**
> del Orchestrator (`engine/quality-gates.md`). Riguroso, no creativo.
> Si aparece un problema → vuelve automáticamente al paso correspondiente.

---

## Test de las 8 preguntas (versión humana del Viral Score)

| # | Pregunta | ¿? | Nota |
|---|---|---|---|
| 1 | ¿Detiene el scroll? | ✅ | "Tu quincho no está terminado" acusa algo que se cree resuelto |
| 2 | ¿Genera curiosidad? | ✅ | "y se nota en un solo lugar" → loop abierto |
| 3 | ¿Se siente diferente? | ✅ | nadie del rubro comunica la bajomesada así |
| 4 | ¿Tiene personalidad? | ✅ | voz de fabricante honesto, registro premium |
| 5 | ¿Sorprende? | ✅ | el giro (el hueco que nadie mira) |
| 6 | ¿La compartiría alguien? | ✅ | reenvío a pareja / al que está en obra |
| 7 | ¿La guardaría alguien? | ✅ | referencia para la propia obra ("para cuando lo termine") |
| 8 | ¿Parece de una agencia creativa de primer nivel? | ✅ | tesis + editorial premium + materia |

**Resultado: 8/8 SÍ.** Ningún NO → no se dispara re-iteración.

---

## Checklist QC (adaptado a carrusel/estático)

**BLOQUE 1 — TÉCNICO**
- [x] Formato 1080×1080 (feed) / export 4:5 opcional 1080×1350 — ✅
- [x] Texto dentro de zonas seguras (no tapado por UI de IG) — ✅
- [x] 5 slides (≤ máximo del brief) — ✅
- [x] Legibilidad de tipografía a tamaño móvil — ✅ (títulos grandes, contraste alto)

**BLOQUE 2 — CONTENIDO**
- [x] Primer slide es el más fuerte — ✅ (hook)
- [x] Historia con arco claro (Antes→Giro→Después) — ✅
- [x] El producto es el medio, no el fin (la bajomesada sirve a "terminar el quincho") — ✅
- [x] Referencia geográfica (Adrogué / Zona Sur) — ✅ (slides 1 y 5)
- [x] Dato técnico traducido a beneficio ("no se hincha/oxida/pela" → queda terminado) — ✅
- [x] CTA claro y no agresivo al final — ✅

**BLOQUE 3 — TEXTO**
- [x] Caption sin errores ortográficos/gramaticales — ✅ (revisado)
- [x] Primera línea del caption = gancho real — ✅ ("Terminaste el quincho...")
- [x] Sin superlativos sin evidencia — ✅
- [x] Sin urgencia artificial — ✅
- [x] Hashtags en primer comentario (≤ 8) — ✅ (ver `package/hashtags.txt`)
- [x] Alt text escrito manualmente — ✅ (ver `package/assets.json`)

**BLOQUE 4 — MARCA**
- [x] Paleta coherente (Carbón / Acero / Hormigón / azul acento) — ✅
- [x] Tipografía Montserrat / Inter — ✅
- [x] Sin filtros saturados incompatibles con "industrial elegante" — ✅
- [x] Tono = artesano/premium, no vendedor ni corporativo — ✅
- [x] Logo solo al final — ✅ (slide 5)

**BLOQUE 5 — PUBLICACIÓN**
- [ ] Fecha/hora agendada — pendiente (equipo)
- [ ] Ubicación de IG configurada (Adrogué) — pendiente
- [ ] Miniatura/portada elegida a mano (slide 1) — recomendado

---

## Clasificación de hallazgos
- CRÍTICOS: **0**
- ALTOS: **0**
- MEDIOS: **0** → *(resuelto)* el hallazgo previo ("foto de antes" del slide 3) se elimina al convertir el slide 3 en **tipográfico**. Ya no depende de una foto que no teníamos. Fotos reales quedan solo en slides 2 y 5 (obra propia).
- BAJOS: ítems del Bloque 5 (operativos de publicación).

## Revisión de diseño (2ª pasada — pedido del cliente)
- **Fotos en TODOS los slides → NO.** Corregido: fotos reales solo en slides 2 (bajomesada1) y 5 (bajomesada2). Slides 1·3·4 tipográficos/gráficos. ✅
- **Diseño más moderno.** Sistema editorial "industrial elegante": regla de aluminio azul 3px, numeral fantasma, grano sutil, motivo de listones de aluminio en slide 4. ✅
- **Nota GPT Image:** el servicio existe pero `OPENAI_API_KEY` no está en el entorno → no se generaron imágenes IA. Prompts listos en `assets.json` para cuando haya clave (solo como apoyo; nunca reemplazan la obra propia).

## Decisión final
```
APROBADO — LISTO PARA PRODUCCIÓN
Sin hallazgos CRÍTICOS/ALTOS/MEDIOS. Fotos reales en slides 2 y 5.
No requiere re-iteración creativa. La pieza representa a Alumfer tal cual está.
Timestamp de aprobación: 2026-07-10 (rev. diseño)
```
