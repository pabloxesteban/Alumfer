/* ============================================================
   ALUMFER — Presupuestos
   Tabla de precios base (semilla editable desde la app)

   IMPORTANTE: los valores son DE REFERENCIA. Se editan desde la
   pestaña "Precios" y quedan guardados en el navegador. La app
   nunca vuelve a leer este archivo salvo que se pulse "Restaurar
   valores de fábrica".

   Modelo de cálculo:
     precio ítem = (precioM2 tipología × factor línea × (1 + recargo color)
                    + precioM2 vidrio) × m² facturables
                   + adicionales
   ============================================================ */

window.PRECIOS_BASE = {
  version: 1,
  catalogo: 2,              // sube cuando se agregan o quitan productos de fábrica (ver Almacenamiento)
  revision: 1,              // sube con cada cambio: detecta presupuestos calculados con precios viejos
  actualizado: '2026-09-22',
  moneda: 'ARS',

  /* Factor multiplicador sobre el precio por m² de cada tipología. */
  lineas: [
    { id: 'herrero', nombre: 'Herrero',     factor: 1.00, ayuda: 'la más elegida, robusta' },
    { id: 'rotonda', nombre: 'Rotonda 640', factor: 1.12, ayuda: 'para ventanas y puertas grandes' },
    { id: 'modena',  nombre: 'Módena 1',    factor: 1.45, ayuda: 'buena relación calidad-precio' },
    { id: 'modena2', nombre: 'Módena 2',    factor: 1.60, ayuda: 'perfil reforzado, aísla más' },
    { id: 'a30',     nombre: 'A30 New',     factor: 1.30, ayuda: 'perfil de 30 mm, de diseño' }
  ],

  /* precioM2: aluminio + herrajes + mano de obra de fábrica, SIN vidrio.
     minM2:    superficie mínima que se factura aunque la abertura sea menor.
     sinVidrio: la tipología no lleva vidrio (mosquiteros, rejas, postigones). */
  tipologias: [
    // ── Ventanas ───────────────────────────────────────────
    { id: 'vent-corr-2',  grupo: 'Ventanas', nombre: 'Ventana corrediza 2 hojas',  precioM2: 240000, minM2: 0.70, lineas: ['herrero','rotonda','a30','modena','modena2'] },
    { id: 'vent-corr-3',  grupo: 'Ventanas', nombre: 'Ventana corrediza 3 hojas',  precioM2: 265000, minM2: 1.20, lineas: ['herrero','rotonda','a30','modena','modena2'] },
    { id: 'vent-corr-4',  grupo: 'Ventanas', nombre: 'Ventana corrediza 4 hojas',  precioM2: 285000, minM2: 1.80, lineas: ['herrero','rotonda','a30','modena','modena2'] },
    { id: 'vent-abrir-1', grupo: 'Ventanas', nombre: 'Ventana de abrir 1 hoja',    precioM2: 275000, minM2: 0.50, lineas: ['herrero','rotonda','a30','modena','modena2'] },
    { id: 'vent-abrir-2', grupo: 'Ventanas', nombre: 'Ventana de abrir 2 hojas',   precioM2: 290000, minM2: 0.80, lineas: ['herrero','rotonda','a30','modena','modena2'] },
    { id: 'banderola',    grupo: 'Ventanas', nombre: 'Banderola / ventiluz',       precioM2: 300000, minM2: 0.36, lineas: ['herrero','rotonda','a30','modena','modena2'] },
    { id: 'oscilo',       grupo: 'Ventanas', nombre: 'Ventana oscilobatiente',     precioM2: 420000, minM2: 0.60, lineas: ['a30','modena','modena2'] },
    { id: 'pano-fijo',    grupo: 'Ventanas', nombre: 'Paño fijo',                  precioM2: 165000, minM2: 0.40, lineas: ['herrero','rotonda','a30','modena','modena2'] },

    // ── Puertas ────────────────────────────────────────────
    { id: 'puerta-abrir',     grupo: 'Puertas', nombre: 'Puerta de abrir 1 hoja',            precioM2: 330000, minM2: 1.60, lineas: ['herrero','rotonda','a30','modena','modena2'] },
    { id: 'puerta-doble',     grupo: 'Puertas', nombre: 'Puerta doble de abrir',             precioM2: 350000, minM2: 2.80, lineas: ['herrero','rotonda','a30','modena','modena2'] },
    { id: 'puerta-tablero',   grupo: 'Puertas', nombre: 'Puerta de tablero / inyectada',     precioM2: 390000, minM2: 1.60, lineas: ['herrero','rotonda','a30','modena','modena2'] },
    { id: 'pbalcon-corr-2',   grupo: 'Puertas', nombre: 'Puerta balcón corrediza 2 hojas',   precioM2: 280000, minM2: 1.80, lineas: ['herrero','rotonda','a30','modena','modena2'] },
    { id: 'pbalcon-corr-3',   grupo: 'Puertas', nombre: 'Puerta balcón corrediza 3 hojas',   precioM2: 300000, minM2: 2.60, lineas: ['herrero','rotonda','a30','modena','modena2'] },
    { id: 'pbalcon-abrir',    grupo: 'Puertas', nombre: 'Puerta balcón de abrir',            precioM2: 340000, minM2: 1.60, lineas: ['herrero','rotonda','a30','modena','modena2'] },

    // ── Cerramientos y obra ────────────────────────────────
    { id: 'cerramiento',  grupo: 'Cerramientos', nombre: 'Cerramiento de quincho / galería', precioM2: 260000, minM2: 2.00, lineas: ['herrero','rotonda','a30','modena','modena2'] },
    { id: 'baranda',      grupo: 'Cerramientos', nombre: 'Baranda de aluminio y vidrio',     precioM2: 310000, minM2: 1.00, lineas: ['herrero','rotonda','a30','modena','modena2'] },
    { id: 'techo-policarb',grupo:'Cerramientos', nombre: 'Techo de policarbonato (estructura)', precioM2: 195000, minM2: 2.00, lineas: ['herrero','rotonda','a30','modena','modena2'] },
    { id: 'porton-corr',  grupo: 'Cerramientos', nombre: 'Portón corredizo',                 precioM2: 420000, minM2: 4.00, lineas: ['herrero','rotonda','a30','modena','modena2'] },
    { id: 'porton-levad', grupo: 'Cerramientos', nombre: 'Portón levadizo',                  precioM2: 480000, minM2: 4.00, lineas: ['herrero','rotonda','a30','modena','modena2'] },
    { id: 'bajo-mesada',  grupo: 'Cerramientos', nombre: 'Bajo mesada de aluminio',          precioM2: 210000, minM2: 0.80, lineas: ['herrero','rotonda','a30','modena','modena2'] },

    // ── Complementos (sin vidrio). sinLinea: no se elige línea de perfil.
    { id: 'mosq-corr',  grupo: 'Complementos', nombre: 'Mosquitero corredizo',  precioM2:  95000, minM2: 0.50, sinVidrio: true, sinLinea: true },
    { id: 'mosq-fijo',  grupo: 'Complementos', nombre: 'Mosquitero fijo',       precioM2:  75000, minM2: 0.40, sinVidrio: true, sinLinea: true },
    { id: 'postigon',   grupo: 'Complementos', nombre: 'Postigón de aluminio',  precioM2: 230000, minM2: 0.80, sinVidrio: true, sinLinea: true },
    // Dos estilos de reja: los nombres definitivos los pasa Alumfer (se pueden cambiar en Precios).
    { id: 'reja',       grupo: 'Complementos', nombre: 'Reja de aluminio tipo 1', precioM2: 180000, minM2: 0.70, sinVidrio: true, sinLinea: true },
    { id: 'reja-2',     grupo: 'Complementos', nombre: 'Reja de aluminio tipo 2', precioM2: 200000, minM2: 0.70, sinVidrio: true, sinLinea: true },
    // Cortinas solas, para cuando se presupuestan sin abertura.
    { id: 'cortina-pvc-cajon', grupo: 'Complementos', nombre: 'Cortina de enrollar PVC con cajón', precioM2: 175000, minM2: 0.80, sinVidrio: true, sinLinea: true, sinColor: true },
    { id: 'cortina-pvc-sola',  grupo: 'Complementos', nombre: 'Cortina de enrollar PVC sin cajón', precioM2: 145000, minM2: 0.80, sinVidrio: true, sinLinea: true, sinColor: true }
  ],

  /* Precio por m² del vidrio (o del policarbonato en techos). */
  vidrios: [
    { id: 'sin',        nombre: 'Sin vidrio',                  precioM2: 0 },
    { id: 'float3',     nombre: 'Simple 3 mm',                 precioM2: 36000, ayuda: 'el más fino' },
    { id: 'float4',     nombre: 'Simple 4 mm',                 precioM2: 44000, ayuda: 'el más usado' },
    { id: 'float5',     nombre: 'Simple 5 mm',                 precioM2: 58000, ayuda: 'para ventanas grandes' },
    { id: 'float6',     nombre: 'Simple 6 mm',                 precioM2: 72000, ayuda: 'para ventanas muy grandes' },
    { id: 'esmerilado', nombre: 'Esmerilado 4 mm',             precioM2: 62000, ayuda: 'no se ve a través, para baños' },
    { id: 'espejado',   nombre: 'Espejado 5 mm',               precioM2: 86000, ayuda: 'de afuera no se ve adentro, da sombra' },
    { id: 'lam33',      nombre: 'Laminado 3+3',                precioM2: 118000, ayuda: 'de seguridad: si se rompe no se cae' },
    { id: 'lam44',      nombre: 'Laminado 4+4',                precioM2: 145000, ayuda: 'de seguridad, más resistente' },
    { id: 'dvh494',     nombre: 'Doble vidrio (DVH) 4/9/4',    precioM2: 168000, ayuda: 'aísla del frío y del ruido' },
    { id: 'dvh4126',    nombre: 'Doble vidrio (DVH) 4/12/6',   precioM2: 190000, ayuda: 'para calles con mucho ruido' },
    { id: 'dvh-lam',    nombre: 'Doble vidrio (DVH) con laminado', precioM2: 245000, ayuda: 'aísla y además es de seguridad' },
    // Poliestireno Fantasía: paneles con textura para mamparas y divisiones (15 diseños).
    { id: 'poli-amazonia',     nombre: 'Poliestireno Amazonia',        precioM2: 52000 },
    { id: 'poli-agua-viva',    nombre: 'Poliestireno Agua Viva',       precioM2: 52000 },
    { id: 'poli-bebe',         nombre: 'Poliestireno Bebé',            precioM2: 52000 },
    { id: 'poli-canalado',     nombre: 'Poliestireno Canalado Plus',   precioM2: 52000 },
    { id: 'poli-niagara',      nombre: 'Poliestireno Niágara',         precioM2: 52000 },
    { id: 'poli-diamante',     nombre: 'Poliestireno Diamante',        precioM2: 52000 },
    { id: 'poli-espuma',       nombre: 'Poliestireno Espuma',          precioM2: 52000 },
    { id: 'poli-foresta',      nombre: 'Poliestireno Foresta',         precioM2: 52000 },
    { id: 'poli-gaviota',      nombre: 'Poliestireno Gaviota',         precioM2: 52000 },
    { id: 'poli-iberia',       nombre: 'Poliestireno Iberia',          precioM2: 52000 },
    { id: 'poli-laberinto',    nombre: 'Poliestireno Laberinto',       precioM2: 52000 },
    { id: 'poli-monocril',     nombre: 'Poliestireno Monocril',        precioM2: 52000 },
    { id: 'poli-puntillado',   nombre: 'Poliestireno Puntillado',      precioM2: 52000 },
    { id: 'poli-pantanal',     nombre: 'Poliestireno Pantanal',        precioM2: 52000 },
    { id: 'poli-pantanal-cristal', nombre: 'Poliestireno Pantanal Cristal', precioM2: 52000 },
    // Policarbonato: el color (transparente, opal, bronce) se elige aparte y no cambia el precio.
    { id: 'policarb-alv4',  nombre: 'Policarbonato alveolar 4 mm',  precioM2: 62000, ayuda: 'liviano, aísla' },
    { id: 'policarb-alv',   nombre: 'Policarbonato alveolar 6 mm',  precioM2: 78000, ayuda: 'el más usado en techos' },
    { id: 'policarb-alv8',  nombre: 'Policarbonato alveolar 8 mm',  precioM2: 92000, ayuda: 'para techos más grandes' },
    { id: 'policarb-alv10', nombre: 'Policarbonato alveolar 10 mm', precioM2: 108000, ayuda: 'el más firme' },
    { id: 'policarb-comp',  nombre: 'Policarbonato compacto 4 mm',  precioM2: 165000, ayuda: 'macizo, muy resistente a golpes' }
  ],

  /* Recargo sobre el aluminio (no sobre el vidrio), en tanto por uno. */
  colores: [
    // Pintado (mismos colores que el diseñador del sitio). El blanco es el estándar.
    { id: 'blanco',         grupo: 'Pintado',   nombre: 'Blanco',           recargo: 0.00 },
    { id: 'negro',          grupo: 'Pintado',   nombre: 'Negro',            recargo: 0.10 },
    { id: 'bronce',         grupo: 'Pintado',   nombre: 'Bronce colonial',  recargo: 0.10 },
    { id: 'gris',           grupo: 'Pintado',   nombre: 'Gris',             recargo: 0.10 },
    { id: 'marron',         grupo: 'Pintado',   nombre: 'Marrón',           recargo: 0.10 },
    { id: 'simil-madera',   grupo: 'Pintado',   nombre: 'Símil madera',     recargo: 0.30 },
    { id: 'microtexturado', grupo: 'Pintado',   nombre: 'Microtexturado',   recargo: 0.15 },
    { id: 'azul',           grupo: 'Pintado',   nombre: 'Azul',             recargo: 0.12 },
    { id: 'verde',          grupo: 'Pintado',   nombre: 'Verde',            recargo: 0.12 },
    { id: 'rojo',           grupo: 'Pintado',   nombre: 'Rojo',             recargo: 0.12 },
    { id: 'amarillo',       grupo: 'Pintado',   nombre: 'Amarillo',         recargo: 0.12 },
    // Anodizado
    { id: 'natural',        grupo: 'Anodizado', nombre: 'Anodizado natural',   recargo: 0.05 },
    { id: 'anod-oro',       grupo: 'Anodizado', nombre: 'Anodizado oro',       recargo: 0.25 },
    { id: 'anod-negro',     grupo: 'Anodizado', nombre: 'Anodizado negro',     recargo: 0.22 },
    { id: 'anod-champagne', grupo: 'Anodizado', nombre: 'Anodizado champagne', recargo: 0.22 },
    { id: 'anod-peltre',    grupo: 'Anodizado', nombre: 'Anodizado peltre',    recargo: 0.22 }
  ],

  /* Formas especiales: se cobra el rectángulo que las contiene más este
     recargo (tanto por uno) sobre aluminio y vidrio. En 0 hasta que Alumfer
     defina cómo las cobra. */
  formas: [
    { id: 'inclinada', nombre: 'Con un lado inclinado', recargo: 0 },
    { id: 'triangulo', nombre: 'Triangular',            recargo: 0 },
    { id: 'arco',      nombre: 'Con arco arriba',       recargo: 0 },
    { id: 'redonda',   nombre: 'Redonda',               recargo: 0 }
  ],

  /* modo: 'm2' (× m² facturables) | 'ml' (× perímetro) | 'unidad' (× cantidad). */
  adicionales: [
    { id: 'mosquitero',   nombre: 'Mosquitero',                 modo: 'm2',     precio:  95000 },
    { id: 'premarco',     nombre: 'Premarco de aluminio',       modo: 'ml',     precio:  22000, ayuda: 'cubre el marco viejo de chapa' },
    { id: 'contramarco',  nombre: 'Contramarco / tapajuntas',   modo: 'ml',     precio:  18000 },
    { id: 'cortina-pvc',  nombre: 'Cortina de enrollar PVC',    modo: 'm2',     precio: 145000 },
    { id: 'cortina-alu',  nombre: 'Cortina de enrollar aluminio',modo: 'm2',    precio: 210000 },
    // Una sola casilla "Reja"; al marcarla se pregunta el tipo (familia 'reja').
    { id: 'reja-adic',    nombre: 'Reja de aluminio tipo 1',    modo: 'm2',     precio: 180000, familia: 'reja' },
    { id: 'reja-adic-2',  nombre: 'Reja de aluminio tipo 2',    modo: 'm2',     precio: 200000, familia: 'reja' },
    { id: 'multipunto',   nombre: 'Cierre multipunto',          modo: 'unidad', precio:  95000 }
  ],

  /* El kilo de aluminio extruido no lo publica ninguna API: lo pasa el
     proveedor. Se carga a mano y la app lo convierte con el blue del día. */
  aluminio: {
    precio: 0,
    moneda: 'usd',       // 'usd' o 'ars': la moneda en la que te lo pasan
    actualizado: '',
    blue: 0,             // venta del blue al momento de cargarlo
    historial: []        // [{ precio, moneda, blue, fecha }], para ver cuánto subió
  },

  generales: {
    minM2Global: 0.50,        // piso de m² facturables si la tipología no define uno
    colocacionModo: 'porcentaje', // 'porcentaje' | 'm2' | 'monto' | 'sin'
    colocacionValor: 15,      // 15 % sobre el subtotal
    flete: 0,
    aplicaIva: false,         // presupuesto a consumidor final: precio final
    ivaPct: 21,
    descuentoPct: 0,
    validezDias: 7,
    anticipoPct: 50,
    redondeo: 1000,           // redondea el total de cada ítem a múltiplos de $1.000
    plazoEntrega: '20 a 30 días hábiles desde la seña y la toma de medidas definitiva.',
    formaPago: 'Efectivo o transferencia bancaria.'
  },

  empresa: {
    nombre: 'Alumfer Carpintería de Aluminio',
    slogan: 'Fábrica de aberturas de aluminio a medida',
    direccion: 'Av. San Martín 734, Adrogué, Buenos Aires',
    telefono: '(011) 6336-8643',
    whatsapp: '5491163368643',
    email: 'alumfercarpinteria@gmail.com',
    web: 'alumfer.com.ar'
  }
};
