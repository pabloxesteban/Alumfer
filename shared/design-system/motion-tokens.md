# Motion Tokens — Alumfer

> Tokens de motion listos para implementar en CSS, JS y herramientas de diseño.

---

## Variables CSS de Motion

```css
/* =============================================
   ALUMFER MOTION TOKENS
   Sistema de movimiento de la marca
   Versión: 1.0
   ============================================= */

:root {

  /* ─── DURATIONS ─────────────────────────────
     Tiempos de animación organizados por
     velocidad de percepción
  ─────────────────────────────────────────── */

  /* Instantáneo — para feedback de interacción */
  --motion-duration-instant:   100ms;

  /* Rápido — para micro-interacciones */
  --motion-duration-fast:      200ms;

  /* Estándar — la duración base de la marca */
  --motion-duration-base:      300ms;

  /* Moderado — para entradas de elementos con peso */
  --motion-duration-moderate:  400ms;

  /* Lento — para transiciones de estado completo */
  --motion-duration-slow:      600ms;

  /* Muy lento — para dissolves entre imágenes */
  --motion-duration-xslow:     800ms;

  /* Cinematográfico — para Ken Burns y efectos de cámara */
  --motion-duration-cinematic: 6000ms;


  /* ─── EASING CURVES ─────────────────────────
     Curvas de aceleración del sistema
  ─────────────────────────────────────────── */

  /* Salida suave — entrada de elementos (la curva principal de Alumfer) */
  --motion-ease-out:       cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Entrada-salida suave — transiciones entre estados */
  --motion-ease-in-out:    cubic-bezier(0.445, 0.05, 0.55, 0.95);

  /* Lineal — solo para fades de opacidad */
  --motion-ease-linear:    linear;

  /* Entrada — para salidas de elementos del frame */
  --motion-ease-in:        cubic-bezier(0.55, 0.055, 0.675, 0.19);

  /* Peso — curva que imita inercia de material pesado */
  --motion-ease-weight:    cubic-bezier(0.2, 0.0, 0.0, 1.0);


  /* ─── COMPOUND TOKENS ───────────────────────
     Combinaciones pre-definidas de duration + easing
     para los patrones de animación más comunes
  ─────────────────────────────────────────── */

  /* Fade in de texto en reel */
  --motion-text-enter:     var(--motion-duration-base)
                           var(--motion-ease-out);

  /* Fade out de texto antes del corte */
  --motion-text-exit:      var(--motion-duration-fast)
                           var(--motion-ease-linear);

  /* Entrada de imagen / plano */
  --motion-image-enter:    var(--motion-duration-moderate)
                           var(--motion-ease-linear);

  /* Dissolve entre planos */
  --motion-dissolve:       var(--motion-duration-slow)
                           var(--motion-ease-linear);

  /* Ken Burns base */
  --motion-ken-burns:      var(--motion-duration-cinematic)
                           var(--motion-ease-in-out);

  /* Push horizontal (before/after) */
  --motion-push:           700ms
                           var(--motion-ease-weight);

  /* Transición de UI / overlay */
  --motion-ui-enter:       var(--motion-duration-moderate)
                           var(--motion-ease-out);

  --motion-ui-exit:        var(--motion-duration-fast)
                           var(--motion-ease-in);


  /* ─── TRANSFORM VALUES ──────────────────────
     Valores estándar de transformación
  ─────────────────────────────────────────── */

  /* Desplazamiento Y para Fade Up de texto */
  --motion-fade-up-distance:   12px;

  /* Scale máximo para Ken Burns */
  --motion-ken-burns-scale:    1.04;  /* 104% — sutil */
  --motion-ken-burns-scale-lg: 1.06;  /* 106% — más énfasis */

  /* Push horizontal completo (100% del ancho del contenedor) */
  --motion-push-distance:      100%;

}
```

---

## Implementación de Patrones Comunes

### Fade Up de Texto

```css
/* Clase base para texto que entra */
.text-enter {
  opacity: 0;
  transform: translateY(var(--motion-fade-up-distance));
  transition:
    opacity   var(--motion-text-enter),
    transform var(--motion-text-enter);
}

.text-enter.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Para texto que sale */
.text-exit {
  opacity: 1;
  transition: opacity var(--motion-text-exit);
}

.text-exit.is-hidden {
  opacity: 0;
}
```

---

### Ken Burns sobre Imagen Estática

```css
/* Aplicar a un contenedor de imagen */
.ken-burns-container {
  overflow: hidden;
  position: relative;
}

.ken-burns-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-origin: center center; /* Ajustar según punto de interés */
  transform: scale(1);
  transition: transform var(--motion-ken-burns);
}

/* Al activar (ej: cuando el slide está visible) */
.ken-burns-container.is-active .ken-burns-image {
  transform: scale(var(--motion-ken-burns-scale));
}
```

---

### Dissolve entre Imágenes

```css
.dissolve-image {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity var(--motion-dissolve);
}

.dissolve-image.is-active {
  opacity: 1;
}
```

---

### Push Horizontal (Before/After)

```css
.push-container {
  position: relative;
  overflow: hidden;
}

.push-after {
  position: absolute;
  inset: 0;
  transform: translateX(var(--motion-push-distance));
  transition: transform var(--motion-push);
}

.push-container.is-revealed .push-after {
  transform: translateX(0);
}
```

---

## Tokens para After Effects

Para quienes usan After Effects para los reels:

| Token | Valor en AE |
|---|---|
| `--motion-ease-out` | Velocity: 0% in / 80% out en el keyframe de llegada |
| `--motion-ease-in-out` | Easy Ease (F9) con 80% en ambos extremos |
| `--motion-ease-linear` | Linear (sin ease) |
| `--motion-duration-base` | 300ms = 7.2 frames a 24fps |
| `--motion-duration-slow` | 600ms = 14.4 frames a 24fps |
| `--motion-dissolve` | 800ms = 19.2 frames a 24fps |
| `--motion-ken-burns` | 6000ms = 144 frames a 24fps |

---

## Tokens para CapCut / Aplicaciones Móviles de Edición

CapCut no usa variables CSS, pero estos son los valores equivalentes:

- **Fade in de texto:** Duración 0.3s, Entrada: Fade
- **Dissolve entre clips:** Duración 0.6-0.8s
- **Ken Burns:** Zoom 0% a 4% en la duración del clip, con ease in/out
- **Push horizontal:** Duración 0.7s — usar la transición "Slide" de CapCut con la curva más suave disponible
