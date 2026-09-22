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
  revision: 1,              // sube con cada cambio: detecta presupuestos calculados con precios viejos
  actualizado: '2026-09-22',
  moneda: 'ARS',

  /* Factor multiplicador sobre el precio por m² de cada tipología. */
  lineas: [
    { id: 'herrero', nombre: 'Herrero',    factor: 1.00, ayuda: 'la más económica' },
    { id: 'rotonda', nombre: 'Rotonda',    factor: 1.12, ayuda: 'económica reforzada' },
    { id: 'a30',     nombre: 'A30 New',    factor: 1.30, ayuda: 'intermedia, acepta DVH' },
    { id: 'modena',  nombre: 'Módena',     factor: 1.55, ayuda: 'premium, la que más aísla' }
  ],

  /* precioM2: aluminio + herrajes + mano de obra de fábrica, SIN vidrio.
     minM2:    superficie mínima que se factura aunque la abertura sea menor.
     sinVidrio: la tipología no lleva vidrio (mosquiteros, rejas, postigones). */
  tipologias: [
    // ── Ventanas ───────────────────────────────────────────
    { id: 'vent-corr-2',  grupo: 'Ventanas', nombre: 'Ventana corrediza 2 hojas',  precioM2: 240000, minM2: 0.70, lineas: ['herrero','rotonda','a30','modena'] },
    { id: 'vent-corr-3',  grupo: 'Ventanas', nombre: 'Ventana corrediza 3 hojas',  precioM2: 265000, minM2: 1.20, lineas: ['herrero','rotonda','a30','modena'] },
    { id: 'vent-corr-4',  grupo: 'Ventanas', nombre: 'Ventana corrediza 4 hojas',  precioM2: 285000, minM2: 1.80, lineas: ['herrero','rotonda','a30','modena'] },
    { id: 'vent-abrir-1', grupo: 'Ventanas', nombre: 'Ventana de abrir 1 hoja',    precioM2: 275000, minM2: 0.50, lineas: ['herrero','rotonda','a30','modena'] },
    { id: 'vent-abrir-2', grupo: 'Ventanas', nombre: 'Ventana de abrir 2 hojas',   precioM2: 290000, minM2: 0.80, lineas: ['herrero','rotonda','a30','modena'] },
    { id: 'banderola',    grupo: 'Ventanas', nombre: 'Banderola / ventiluz',       precioM2: 300000, minM2: 0.36, lineas: ['herrero','rotonda','a30','modena'] },
    { id: 'oscilo',       grupo: 'Ventanas', nombre: 'Ventana oscilobatiente',     precioM2: 420000, minM2: 0.60, lineas: ['a30','modena'] },
    { id: 'pano-fijo',    grupo: 'Ventanas', nombre: 'Paño fijo',                  precioM2: 165000, minM2: 0.40, lineas: ['herrero','rotonda','a30','modena'] },

    // ── Puertas ────────────────────────────────────────────
    { id: 'puerta-abrir',     grupo: 'Puertas', nombre: 'Puerta de abrir 1 hoja',            precioM2: 330000, minM2: 1.60, lineas: ['herrero','rotonda','a30','modena'] },
    { id: 'puerta-doble',     grupo: 'Puertas', nombre: 'Puerta doble de abrir',             precioM2: 350000, minM2: 2.80, lineas: ['herrero','rotonda','a30','modena'] },
    { id: 'puerta-tablero',   grupo: 'Puertas', nombre: 'Puerta de tablero / inyectada',     precioM2: 390000, minM2: 1.60, lineas: ['herrero','rotonda','a30','modena'] },
    { id: 'pbalcon-corr-2',   grupo: 'Puertas', nombre: 'Puerta balcón corrediza 2 hojas',   precioM2: 280000, minM2: 1.80, lineas: ['herrero','rotonda','a30','modena'] },
    { id: 'pbalcon-corr-3',   grupo: 'Puertas', nombre: 'Puerta balcón corrediza 3 hojas',   precioM2: 300000, minM2: 2.60, lineas: ['herrero','rotonda','a30','modena'] },
    { id: 'pbalcon-abrir',    grupo: 'Puertas', nombre: 'Puerta balcón de abrir',            precioM2: 340000, minM2: 1.60, lineas: ['herrero','rotonda','a30','modena'] },

    // ── Cerramientos y obra ────────────────────────────────
    { id: 'cerramiento',  grupo: 'Cerramientos', nombre: 'Cerramiento de quincho / galería', precioM2: 260000, minM2: 2.00, lineas: ['herrero','rotonda','a30','modena'] },
    { id: 'baranda',      grupo: 'Cerramientos', nombre: 'Baranda de aluminio y vidrio',     precioM2: 310000, minM2: 1.00, lineas: ['herrero','rotonda','a30','modena'] },
    { id: 'techo-policarb',grupo:'Cerramientos', nombre: 'Techo de policarbonato (estructura)', precioM2: 195000, minM2: 2.00, lineas: ['herrero','rotonda','a30','modena'] },
    { id: 'porton-corr',  grupo: 'Cerramientos', nombre: 'Portón corredizo',                 precioM2: 420000, minM2: 4.00, lineas: ['herrero','rotonda','a30','modena'] },
    { id: 'porton-levad', grupo: 'Cerramientos', nombre: 'Portón levadizo',                  precioM2: 480000, minM2: 4.00, lineas: ['herrero','rotonda','a30','modena'] },
    { id: 'bajo-mesada',  grupo: 'Cerramientos', nombre: 'Bajo mesada de aluminio',          precioM2: 210000, minM2: 0.80, lineas: ['herrero','rotonda','a30','modena'] },

    // ── Complementos (sin vidrio) ──────────────────────────
    { id: 'mosq-corr',  grupo: 'Complementos', nombre: 'Mosquitero corredizo',  precioM2:  95000, minM2: 0.50, lineas: ['herrero','rotonda','a30','modena'], sinVidrio: true },
    { id: 'mosq-fijo',  grupo: 'Complementos', nombre: 'Mosquitero fijo',       precioM2:  75000, minM2: 0.40, lineas: ['herrero','rotonda','a30','modena'], sinVidrio: true },
    { id: 'postigon',   grupo: 'Complementos', nombre: 'Postigón de aluminio',  precioM2: 230000, minM2: 0.80, lineas: ['herrero','rotonda','a30','modena'], sinVidrio: true },
    { id: 'reja',       grupo: 'Complementos', nombre: 'Reja de seguridad',     precioM2: 180000, minM2: 0.70, lineas: ['herrero','rotonda','a30','modena'], sinVidrio: true }
  ],

  /* Precio por m² del vidrio (o del policarbonato en techos). */
  vidrios: [
    { id: 'sin',        nombre: 'Sin vidrio',                  precioM2: 0 },
    { id: 'float3',     nombre: 'Float 3 mm',                  precioM2: 36000, ayuda: 'el más fino' },
    { id: 'float4',     nombre: 'Float 4 mm',                  precioM2: 44000, ayuda: 'el más usado' },
    { id: 'float5',     nombre: 'Float 5 mm',                  precioM2: 58000, ayuda: 'para paños grandes' },
    { id: 'float6',     nombre: 'Float 6 mm',                  precioM2: 72000, ayuda: 'para paños muy grandes' },
    { id: 'esmerilado', nombre: 'Esmerilado / satinado 4 mm',  precioM2: 62000, ayuda: 'no se ve a través (baños)' },
    { id: 'espejado',   nombre: 'Reflectivo espejado 5 mm',    precioM2: 86000, ayuda: 'espeja de afuera, da sombra' },
    { id: 'lam33',      nombre: 'Laminado 3+3 (seguridad)',    precioM2: 118000, ayuda: 'no se astilla, antirrobo' },
    { id: 'lam44',      nombre: 'Laminado 4+4 (seguridad)',    precioM2: 145000, ayuda: 'seguridad reforzada' },
    { id: 'dvh494',     nombre: 'DVH 4/9/4',                   precioM2: 168000, ayuda: 'doble vidrio: frío y ruido' },
    { id: 'dvh-lam',    nombre: 'DVH con laminado 3+3',        precioM2: 245000, ayuda: 'doble vidrio + seguridad' },
    { id: 'policarb-alv',  nombre: 'Policarbonato alveolar 6 mm', precioM2: 78000, ayuda: 'para techos, liviano' },
    { id: 'policarb-comp', nombre: 'Policarbonato compacto 4 mm', precioM2: 165000, ayuda: 'para techos, resistente' }
  ],

  /* Recargo sobre el aluminio (no sobre el vidrio), en tanto por uno. */
  colores: [
    { id: 'natural',      nombre: 'Aluminio natural',      recargo: 0.00 },
    { id: 'blanco',       nombre: 'Blanco',                recargo: 0.08 },
    { id: 'gris',         nombre: 'Gris / grafito',        recargo: 0.15 },
    { id: 'bronce',       nombre: 'Bronce (anolok)',       recargo: 0.22 },
    { id: 'negro',        nombre: 'Negro',                 recargo: 0.20 },
    { id: 'simil-madera', nombre: 'Símil madera',          recargo: 0.38 }
  ],

  /* modo: 'm2' (× m² facturables) | 'ml' (× perímetro) | 'unidad' (× cantidad). */
  adicionales: [
    { id: 'mosquitero',   nombre: 'Mosquitero',                 modo: 'm2',     precio:  95000 },
    { id: 'premarco',     nombre: 'Premarco de chapa',          modo: 'ml',     precio:  22000 },
    { id: 'contramarco',  nombre: 'Contramarco / tapajuntas',   modo: 'ml',     precio:  18000 },
    { id: 'refuerzo',     nombre: 'Refuerzo de hierro',         modo: 'ml',     precio:  15000 },
    { id: 'cortina-pvc',  nombre: 'Cortina de enrollar PVC',    modo: 'm2',     precio: 145000 },
    { id: 'cortina-alu',  nombre: 'Cortina de enrollar aluminio',modo: 'm2',    precio: 210000 },
    { id: 'reja-adic',    nombre: 'Reja de seguridad',          modo: 'm2',     precio: 180000 },
    { id: 'multipunto',   nombre: 'Cierre multipunto',          modo: 'unidad', precio:  95000 },
    { id: 'cierrapuertas',nombre: 'Cierrapuertas hidráulico',   modo: 'unidad', precio:  85000 },
    { id: 'zocalo',       nombre: 'Zócalo inyectado',           modo: 'unidad', precio:  45000 }
  ],

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
    plazoEntrega: '20 a 30 días hábiles desde la seña y la toma de medidas definitiva.'
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
