# FASE 9 — Production · `final-content.md`

> Agentes: `copywriter` (voz storytelling) + `motion-designer`.
> Pieza: **Reel 9:16 · 1080×1920 · ~22 s · Concepto C-27 "Abrimos una más."**
> Regla de oro: captar → aportar → convertir. Logo solo al final. Blue en un único elemento.

---

## Storyboard (8 escenas)

| # | Escena | Visual | Texto en pantalla | Dur. | Transición | Audio |
|---|--------|--------|-------------------|:----:|-----------|-------|
| 1 | **La sombra** | Negro Carbon casi total. Una fina línea de luz azulada empieza a crecer en un borde (rendija de una abertura cerrada). Sin logo, sin marca. | — (solo la línea de luz) | 0–2.5s | La luz crece | Ambiente / silencio con un leve zumbido grave |
| 2 | **Se abre** | POV: una ventana/puerta de aluminio Alumfer se abre; la luz entra y baña el encuadre (over-exposición controlada, sin destruir el aluminio). | **"Abrimos una más."** (Montserrat 700, blanco, entra con la luz) | 2.5–5s | Flare de luz cubre el corte | *Click* seco del cierre real + música minimal entra |
| 3 | **Lo que entra** | La luz recorre un living real: cae sobre el piso, una planta, una mesa. Ambiente que "respira". | **"Entra luz."** | 5–7s | Slide de luz (cubre L→R) | Música minimal sube suave |
| 4 | **La zona** | Corte a obra real: ventanal grande en casa de Zona Sur. Rótulo discreto de barrio. | **"Adrogué."** (kicker Inter, uppercase, Concrete) | 7–9.5s | Corte al ritmo | Textura de ambiente exterior suave |
| 5 | **El recorrido** | Montaje ágil (3 tomas × ~0.8s) de obras reales con luz: DVH, portón corredizo, cocina. Rótulos: Lomas · Quilmes · Lanús. | **"Lomas. Quilmes. Lanús."** (encadenados) | 9.5–12.5s | Cortes secos al beat | Beat minimal marca los cortes |
| 6 | **El oficio** | Detalle de taller: corte a 45°, mano midiendo, sellado perfecto (ASMR de precisión). | **"15 años de trabajo."** | 12.5–15s | Match-cut de una línea recta | *Snip* del corte + sonido de metro |
| 7 | **La última abertura** | La línea recta del corte se convierte en la **línea azul de identidad** (3px). Debajo, aparece brevemente el sitio (2–3 pantallas reales en un dispositivo, sobre fondo Carbon). | **"Ahora, todo en un solo lugar."** | 15–18.5s | La línea azul se dibuja I→D | Música llega a su punto pleno |
| 8 | **Umbral / CTA + loop** | La abertura vuelve a su posición (se "cierra" un poco) invitando a repetir. CTA integrado. Único frame con logo. | **"Pasá. · alumfer.com"** + logo Alumfer + "Adrogué · Zona Sur GBA" | 18.5–22s | Cierre que reabre (loop al frame 1) | Cola de música + *click* final |

> **Duración total: ~22 s** (dentro del rango QC 15–90 s). Relación de aspecto 9:16. Zonas seguras respetadas (texto lejos del 14% inferior donde va la UI de IG).

---

## Copy en pantalla (limpio, para el diseñador)
```
1.  (sin texto — solo luz)
2.  Abrimos una más.
3.  Entra luz.
4.  Adrogué.
5.  Lomas. Quilmes. Lanús.
6.  15 años de trabajo.
7.  Ahora, todo en un solo lugar.
8.  Pasá.  ·  alumfer.com
    Adrogué · Zona Sur GBA
```

## Especificaciones de motion (del `motion-tokens.md`)
- Entrada de textos: `ease-out` `cubic-bezier(0.22,1,0.36,1)`, 400ms.
- Reveal de luz / slides: `slide` `cubic-bezier(0.16,1,0.3,1)`, 800ms.
- La línea azul (escena 7) se dibuja con `slide`, 800ms — es el clímax visual.
- Cortes de la escena 5 sincronizados al beat (no dissolves).
- Sin rebote (`micro`) en esta pieza: el tono es sereno, no juguetón.

## Tipografía en pantalla
- Títulos (escenas 2,3,6,7): **Montserrat 600/700**, blanco `#FFFFFF`, tracking -0.02em, mín. 48px.
- Kickers de barrio (4,5): **Inter 500**, uppercase, Concrete `#B0A99A`, tracking 0.12em, ~28px.
- CTA (8): Montserrat 600 blanco + link; barrio en Inter 400 Concrete.

## Color
- Fondo dominante Carbon `#1A1C1E`. Superficies Steel `#2E3338`.
- **Un solo Blue `#1B6CC8`**: la línea de identidad de la escena 7 (y su eco en el borde de luz de la escena 1). Nada más en azul.
- Foto con grade de marca: saturación −12%, temperatura fría, sombras con detalle. Prohibido orange&teal.

## Audio
- Base: música minimal/ambient sobria con licencia comercial (no trap viral, no tendencia genérica).
- Textura real por encima: *click* del cierre (escena 2 y 8), *snip* del corte y metro (escena 6). El sonido del oficio es parte del mensaje.
- Sin voz en off (el silencio y la textura sostienen el tono premium).

## Miniatura (cover)
Frame de la escena 2/3 con la luz entrando y "Abrimos una más." legible. Elegida a mano (no automática).

---

## Caption (producción — versión final en `package/caption.md`)
```
Abrimos una más.

Hace 15 años que abrimos ventanas y puertas en Zona Sur. Cada una deja
entrar un poco más de luz a una casa. Hoy abrimos una distinta: no da a la
calle, da a todo nuestro trabajo junto, por fin en un solo lugar.

Obras reales de Adrogué, Lomas, Quilmes, Lanús y toda la zona. Lo que
fabricamos, cómo lo hacemos y cómo dar el primer paso, sin intermediarios.

El aluminio no se oxida. Nosotros tampoco: seguimos siendo el mismo taller,
ahora con una vidriera abierta las 24 horas.

Pasá. Link en la bio → alumfer.com
```
> Primer comentario (fijado): "¿Estás por cambiar aberturas o arrancando una obra en Zona Sur? Entrá al sitio y, si querés, mandanos una foto de tu vano por WhatsApp. Te decimos qué necesitás de verdad, sin cargo. Somos fabricantes, no revendedores. Adrogué."

---

## Complemento — Re-post a Historia (del Strategist)
Tomar el Reel y republicarlo en Historias con:
- **Sticker de link** → alumfer.com (captura la acción directa que la Historia habilita).
- Sticker de encuesta lúdico: *"¿Entramos?"* → "Sí / Obvio" (micro-interacción que empuja el link).
- Texto: "Abrimos una más. Pasá 👉" (aquí sí un emoji, dentro del límite de marca).

---

### Sello de fase
✔ Storyboard completo (escena · visual · texto · duración · transición · audio).
✔ Copy en pantalla + caption + primer comentario + plan de Historia listos para diseño.
✔ Respeta orden sagrado (hook→valor→CTA), logo solo al final, un único Blue.
