# Failed Content — Piezas que Fallaron (y Por Qué)

> El archivo de lo que murió. El más valioso a largo plazo.
> Un fracaso documentado vale más que un éxito casual: enseña qué NO repetir.

---

## Cómo se usa
- **Se lee** para no repetir errores conocidos.
- **Se escribe** en dos momentos:
  1. Cuando el loop **mata** un concepto antes de publicar (score < 55 o brief no viable).
  2. Cuando una pieza publicada **rinde por debajo** de su predicción.

## Esquema de una entrada
```
CASO: [slug o concepto] · FECHA: [YYYY-MM]
TIPO DE FALLO: matado-en-loop | publicado-bajo-rendimiento
QUÉ ERA: [concepto/hook/pieza]
SCORE / RESULTADO: [predicho vs. real, o motivo de kill]
POR QUÉ FALLÓ: [causa raíz honesta]
SEÑAL TEMPRANA: [qué lo delataba y no vimos / sí vimos]
LECCIÓN: [qué evitar]
¿GENERÓ PROHIBICIÓN O REGLA?: [si sí, dónde]
```

---

## Fallos conocidos del rubro (sembrados desde `analytics/success-patterns.md`)

### F01 · El viral sin localización
Reel de alto alcance sin mención de Zona Sur GBA. **Falló:** ~0 consultas calificadas; las views son de todo el país. **Lección:** toda pieza debe poder anclarse a la zona. → Es kill-switch en `engine/quality-gates.md`.

### F02 · El post de precio
Precio/descuento como argumento central. **Falló:** atrae al cliente que busca lo barato, desgasta al equipo comercial sin cerrar. **Lección:** nunca precio como gancho. → Prohibición en `engine/prohibitions.md`.

### F03 · El catálogo sin historia
Producto aislado + specs sin traducción a beneficio. **Falló:** engagement mínimo, 0 consultas; el cliente no se imagina el resultado. **Lección:** toda pieza necesita contexto y tensión.

### F04 · El post corporativo
Texto institucional en tercera persona. **Falló:** no conecta con nadie. **Lección:** primera persona, voz de artesano. → Prohibición en `engine/prohibitions.md`.

---

## Regla
Documentar un fracaso no es opcional: es parte del cierre de cada pieza que muere. El sistema aprende más de acá que de `successful-content/`. Un patrón que aparece 3 veces en fallos se promueve a **prohibición** en `engine/prohibitions.md`.
