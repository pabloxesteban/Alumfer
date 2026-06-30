# Alumfer — Brand Tokens (fuente de verdad)

Este archivo es la referencia canónica de identidad visual de Alumfer.
`tokens.css` es la implementación CSS de estos valores. Si cambia un token aquí, debe reflejarse allá.

## Paleta de color

| Token           | Valor     | Rol                                    |
|-----------------|-----------|----------------------------------------|
| `--carbon`      | `#1A1C1E` | Fondo oscuro principal                 |
| `--steel`       | `#2E3338` | Fondo oscuro secundario                |
| `--steel-light` | `#3D444B` | Superficies elevadas sobre dark        |
| `--concrete`    | `#B0A99A` | Texto secundario / muted               |
| `--concrete-light` | `#E8E4DC` | Fondos claros con calidez            |
| `--concrete-faint` | `#F5F4F1` | Fondo claro principal                |
| `--blue`        | `#1B6CC8` | Acento primario (aluminio anodizado)   |
| `--blue-light`  | `#4A9DE8` | Variante clara del acento              |
| `--blue-faint`  | `#D6E8F7` | Fondo tintado / chips / badges         |

### Psicología del color
- **Carbon + Steel**: solidez industrial, peso, confianza. Evoca el aluminio en bruto.
- **Concrete**: calidez orgánica. Evita que el sistema se sienta frío o corporativo.
- **Blue**: el aluminio anodizado. Es el único color "vivo". Usarlo con economía para que tenga impacto.

## Tipografía

| Rol              | Fuente      | Peso         |
|------------------|-------------|--------------|
| Títulos/Brand    | Montserrat  | 600          |
| Cuerpo/UI        | Inter       | 300, 400, 500, 600 |

### Escala tipográfica
```
xs:   11px  — labels, badges
sm:   13px  — captions, metadata
base: 16px  — cuerpo
md:   18px  — intro texto
lg:   22px  — subtítulos
xl:   28px  — títulos sección
2xl:  36px  — títulos grandes
3xl:  48px  — hero secundario
4xl:  64px  — hero principal
```

### Tracking (letter-spacing)
- `tight`:   -0.02em — títulos grandes (mejora legibilidad en bold)
- `normal`:   0em    — cuerpo
- `wide`:     0.06em — eyebrows, labels de sección
- `wider`:    0.12em — tags, categorías
- `widest`:   0.20em — separadores decorativos

## Layout

- Max width: **1200px**
- Gutter: **clamp(1.25rem, 5vw, 3rem)** — fluido
- Section padding Y: **clamp(3rem, 6vw, 5rem)**

## Motion

### Curvas de easing (todos los productos deben usar estas)
```
ease-out (default): cubic-bezier(0.22, 1, 0.36, 1)    — elementos que entran
ease-in:            cubic-bezier(0.64, 0, 0.78, 0)     — elementos que salen
micro:              cubic-bezier(0.34, 1.56, 0.64, 1)  — micro-interacciones con rebote
slide:              cubic-bezier(0.16, 1, 0.3, 1)      — slides/reveals
```

### Duraciones
```
micro:    120ms — hover states, checkboxes
standard: 220ms — transiciones de componentes
entrance: 400ms — elementos que entran al viewport
hero:     800ms — animaciones de hero/portada
```

## Firma visual

La "línea de identidad" es el elemento visual más reconocible de Alumfer: una línea horizontal azul (`--blue`) de `3px` que aparece como regla decorativa sobre títulos y elementos de sección. Es el equivalente visual de una firma.

Uso: `border-top: var(--rule-width) solid var(--rule)` + `padding-top: espaciado`
