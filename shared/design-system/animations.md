# Principios de Animación — Alumfer

> Curvas, duraciones, y usos de animación en el sistema de diseño de Alumfer.

---

## La filosofía de animación de Alumfer

La animación de la marca sigue el mismo principio que el material que fabrica: **peso, precisión, sin exceso.**

El aluminio tiene peso real. Los marcos tienen inercia. Los vidrios se mueven con deliberación. La animación de la marca imita esa física — no el bounce ligero de las apps consumer, ni la velocidad frenética del contenido de entretenimiento.

**Regla general:** Si la animación llama la atención sobre sí misma, es demasiado. La animación ideal es la que el espectador no nota conscientemente — solo siente que todo se mueve "bien."

---

## Curvas de Easing

### `ease-out` — La Curva Principal de Alumfer

Empieza rápido, termina suave. Es la curva del peso que se detiene.

**CSS:** `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
**Equivalente en After Effects:** Easy Ease Out
**Uso:** Entradas de elementos (texto que aparece, imagen que entra, overlay que se muestra)

Esta curva imita el comportamiento de un objeto pesado que llega a su posición y se detiene con naturalidad. Es la curva correcta para la marca del artesano.

---

### `ease-in-out` — Movimientos de Paso

Empieza suave, acelera en el medio, termina suave. Para transiciones entre estados.

**CSS:** `cubic-bezier(0.445, 0.05, 0.55, 0.95)`
**Equivalente en After Effects:** Easy Ease
**Uso:** Transiciones entre planos en reel, slides de carrusel, cambios de estado

---

### `linear` — Fade de Opacidad Puro

Velocidad constante. Solo para fades de opacidad (no para movimientos de posición o escala).

**CSS:** `linear`
**Uso:** Fade in/out de overlays y textos, dissolves entre imágenes

**Por qué linear para fades:** Los fades de opacidad con ease-in-out crean un efecto de "parpadeo" en el medio. Linear es más limpio para cambios de transparencia.

---

### `ease-in` — Salidas de Elementos

Empieza suave, termina rápido. Para elementos que salen del frame.

**CSS:** `cubic-bezier(0.55, 0.055, 0.675, 0.19)`
**Uso:** Cuando un elemento sale de pantalla — el objeto "acelera" hacia afuera, como si la gravedad lo jalara.

---

## Duraciones

| Tipo de animación | Duración | Justificación |
|---|---|---|
| Fade de opacidad (texto) | 200-300ms | Suficientemente rápido para no interrumpir |
| Fade in de imagen / plano | 400-600ms | Más suave para no generar flash |
| Entrada de elemento de UI | 300-400ms | Rápido pero con peso |
| Dissolve entre planos (reel) | 8-12 frames a 24fps = 333-500ms | El estándar del sistema |
| Ken Burns (zoom lento) | 4000-8000ms | Movimiento muy lento sobre imagen estática |
| Push horizontal (before/after) | 600-800ms | Rápido pero con inercia |
| Transición de slide en carrusel | N/A (Instagram controla) | No se puede personalizar |

**Nota:** Para el contexto de reels de Instagram, estas duraciones aplican a animaciones de texto en pantalla y a decisiones de corte. La duración de los cortes entre planos es decisión editorial, no de animación de UI.

---

## Animaciones Aprobadas para Reels

### Fade Up (entrada de texto)
El texto entra subiendo levemente (8-12px de desplazamiento) mientras hace fade in de opacidad 0 → 100%.

```
Duración: 300ms
Easing: ease-out
Desplazamiento Y: -12px → 0px
Opacidad: 0 → 1
```

---

### Fade In (imagen o overlay)
Opacidad simple 0 → 100%, sin movimiento de posición.

```
Duración: 400ms para imágenes, 200ms para textos rápidos
Easing: linear
Opacidad: 0 → 1
```

---

### Fade Out (salida de texto)
Opacidad 100% → 0% antes del siguiente corte.

```
Duración: 200ms (ejecutar 0.3s antes del corte para que complete)
Easing: linear
Opacidad: 1 → 0
```

---

### Ken Burns (movimiento de imagen estática)
Scale de 100% a 104-106% en el tiempo del plano. Siempre ease-in-out para que el inicio y el final sean suaves.

```
Duración: Igual a la duración del plano (4-8 segundos)
Easing: ease-in-out
Scale: 100% → 104% (con transform-origin centrado o en el punto de interés)
```

**Regla:** El Ken Burns siempre va hacia la parte más importante de la imagen. Si el interés está en la parte superior (el cielo a través de la ventana), el zoom va hacia arriba y el origen está en la parte superior.

---

## Animaciones Prohibidas

| Animación | Por qué está prohibida |
|---|---|
| Bounce / Spring | Comunica ligereza — incompatible con el peso del artesano |
| Rotate / Flip | No tiene justificación narrativa en el contexto de Alumfer |
| Glitch / Distorsión | Territorio de contenido de entretenimiento digital |
| Shake / Vibración | Solo si es footage real con movimiento de cámara |
| Scale > 110% en Ken Burns | El zoom excesivo se convierte en efecto visual, no en composición |
| Text Scramble / Typewriter | Lento y distractivo para contenido de 15-60s |
| Animaciones de partículas / loops infinitos decorativos | Fuera del territorio industrial |

---

## Tokens de Animación (para implementación CSS)

Ver `motion-tokens.md` para los valores exactos en variables CSS listos para implementar.
