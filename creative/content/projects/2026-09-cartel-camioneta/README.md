# Carteles laterales de la camioneta — Alumfer (200 × 42 cm, 2 iguales)

Carteles para los dos laterales de la caja metálica de la Peugeot 504. Reemplazan a los
actuales (fotos en `referencia/`). Mismo lenguaje visual que el cartel del frente
(`2026-09-cartel-frente`): fondo oscuro con la marca, panel metalizado, Barlow Condensed para
lo que resalta y franja de contacto abajo.

**Se usa el mismo diseño en los dos laterales: imprimir 2 copias iguales.**
(La marca queda a la izquierda en ambos lados. `cartel.html#derecho` conserva una variante espejada,
con la marca hacia la trompa en el lado derecho, por si en algún momento se quiere usar.)

## Especificaciones

| Dato | Valor |
|---|---|
| **Medida total** | **2000 × 420 mm (200 × 42 cm)** cada uno — el archivo mide exactamente eso, sin sangrado extra. En el diseño, 1 px = 1 mm |
| Para la imprenta | `export/IMPRENTA_Alumfer_camioneta_AMBOS_LADOS_x2_200x42cm_TAMANO_REAL.pdf` (imprimir 2 copias) — tamaño real, 100 % vectorial, tipografías incrustadas |
| Alternativa en imagen | `export/IMPRENTA_Alumfer_camioneta_AMBOS_LADOS_x2_200x42cm_150dpi.png` (11811 × 2480 px) |
| Vista (sin sangrado) | `export/Alumfer_camioneta_AMBOS_LADOS_x2_vista.png` |
| Ficha técnica | `export/Alumfer_camioneta_FICHA_TECNICA.pdf` |
| Simulación | `export/simulacion-camioneta.jpg` (sobre la foto del cartel actual en la caja) |

## Contenido

- Isologo + **ALUMFER** + **CARPINTERÍA DE ALUMINIO**
- **SOMOS FABRICANTES**
- **COLOCACIÓN EN SECO** (azul del isologo `#2F7FD6` con contorno blanco) / SIN ROMPER NI ENSUCIAR
- WhatsApp **11 6336-8643 / 11 5806-5231** · **www.alumfer.com.ar** · **@alumfercarpinteria**

Se deja afuera la lista de trabajos y las líneas: en un vehículo en movimiento no se llegan a leer.

## Cómo editar y exportar

1. Editar `cartel.html` (abrirlo en el navegador).
2. `npm i playwright-core pdf-lib sharp && node scripts/export.mjs`
3. `node scripts/ficha.mjs` para regenerar la ficha técnica.
