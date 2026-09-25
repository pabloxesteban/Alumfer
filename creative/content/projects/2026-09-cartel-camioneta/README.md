# Carteles laterales de la camioneta — Alumfer (200 × 42 cm, x2)

Carteles para los dos laterales de la caja metálica de la Peugeot 504. Reemplazan a los
actuales (fotos en `referencia/`). Mismo lenguaje visual que el cartel del frente
(`2026-09-cartel-frente`): fondo oscuro con la marca, panel metalizado, Barlow Condensed para
lo que resalta y franja de contacto abajo.

**Dos versiones espejadas: el logo siempre queda hacia la trompa del vehículo.**

| Archivo | Lado | Distribución |
|---|---|---|
| `LADO_IZQUIERDO_conductor` | Lado del conductor | Trompa a la izquierda de quien mira → marca y WhatsApp a la izquierda |
| `LADO_DERECHO_vereda` | Lado de la vereda | Trompa a la derecha de quien mira → marca y WhatsApp a la derecha |

El texto se lee normal en los dos; solo se invierte el orden de los bloques (el isologo no se da vuelta).

## Especificaciones

| Dato | Valor |
|---|---|
| Medida final (corte) | **200 × 42 cm** cada uno. En el diseño, 1 px = 1 mm |
| Sangrado | **3 cm por lado** → tamaño total **206 × 48 cm** |
| Para la imprenta | `export/IMPRENTA_Alumfer_camioneta_LADO_*_206x48cm_TAMANO_REAL.pdf` — tamaño real, 100 % vectorial, tipografías incrustadas, TrimBox 200 × 42 cm |
| Alternativa en imagen | `export/IMPRENTA_Alumfer_camioneta_LADO_*_206x48cm_150dpi.png` (12165 × 2835 px) |
| Vista (sin sangrado) | `export/Alumfer_camioneta_LADO_*_vista.png` |
| Ficha técnica | `export/Alumfer_camioneta_FICHA_TECNICA.pdf` |

## Contenido

- Isologo + **ALUMFER** + **CARPINTERÍA DE ALUMINIO**
- **SOMOS FABRICANTES**
- **COLOCACIÓN EN SECO** (azul del isologo `#2F7FD6` con contorno blanco) / SIN ROMPER NI ENSUCIAR
- WhatsApp **11 6336-8643 / 11 5806-5231** · **www.alumfer.com.ar** · **@alumfercarpinteria**

Se deja afuera la lista de trabajos y las líneas: en un vehículo en movimiento no se llegan a leer.

## Cómo editar y exportar

1. Editar `cartel.html` (abrirlo en el navegador; agregar `#derecho` a la URL para ver el lado derecho).
2. `npm i playwright-core pdf-lib sharp && node scripts/export.mjs`
3. `node scripts/ficha.mjs` para regenerar la ficha técnica.
