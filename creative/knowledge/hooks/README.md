# Hooks — Biblioteca de Hooks Usados y su Rendimiento

> Todo hook que sobrevive el loop o se publica se archiva acá.
> Sirve para dos cosas: NO repetir (prohibido, `engine/prohibitions.md`) y aprender cuáles frenan de verdad.

---

## Cómo se usa
- **Se lee** cuando el Hook Generator arranca: para no repetir y para ver qué tipo rindió.
- **Se escribe** cuando un hook sobrevive el loop (estado: candidato) o se publica (estado: usado, con resultado).

## Esquema de una entrada
```
HOOK: "[texto exacto]"
TIPO: [curiosidad/polémica/humor/error/mito/dato/comparación/pregunta/historia/
       confesión/visual/desafío/autoridad/antes-después/contraste/urgencia]
ESTADO: candidato | usado
PIEZA: [slug de la pieza donde se usó, o "-"]
FECHA: [YYYY-MM]
RESULTADO: [retención 3s / guardados / DMs, cuando esté publicado]
VEREDICTO: [funcionó / no funcionó / a reformular]
```

## Registro (arranca con los 16 tipos sembrados desde `agents/hook-generator.md`)

> Los ejemplos de calibración del Hook Generator entran acá como **candidatos**. Al usarse, se les carga resultado. Ver la tabla de tipos en `agents/hook-generator.md`.

| Hook | Tipo | Estado | Resultado | Veredicto |
|---|---|---|---|---|
| "Una junta mal sellada te sube la factura de gas hasta un 30%." | dato | candidato | — | — |
| "Misma casa, misma orientación, 6 grados de diferencia." | comparación | candidato | — | — |
| "Te vamos a decir algo que la mayoría de las carpinterías te oculta." | confesión | candidato | — | — |
| "Poné la mano cerca de tu ventana. Si sentís aire, seguí mirando." | desafío | candidato | — | — |
| "El 90% pide el vidrio equivocado. Nadie les avisa." | error | candidato | — | — |

## Reglas de la biblioteca
1. **No repetir un hook `usado`.** Se puede reformular con un giro nuevo, nunca clonar.
2. **Registrar el tipo** para medir qué categorías rinden con la audiencia de Alumfer.
3. **Cargar resultado post-publicación** vía `learning/` — un hook sin resultado es solo una hipótesis.
4. Cuando un tipo acumula varios "funcionó", se promueve a regla en `creative-rules/`.
