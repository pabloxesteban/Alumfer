/**
 * generate-alumfer-textures.mjs
 * ---------------------------------------------------------------------------
 * Genera las imágenes de apoyo (texturas/materia) del carrusel
 * "Tu quincho no está terminado" usando el servicio de imágenes del repo
 * (OpenAI gpt-image-1). Claude DIRIGE el prompt; GPT Image genera los píxeles.
 *
 * Requisitos:
 *   - OPENAI_API_KEY seteada en el entorno (NUNCA hardcodeada).
 *   - Haber corrido: npm install && npm run build   (en services/image-generation)
 *
 * Uso:
 *   node services/image-generation/generate-alumfer-textures.mjs
 *
 * Salida: generated/images/alumfer-instagram-feed-openai-*.png + log en consola.
 *
 * NOTA DE MARCA: estas imágenes son APOYO (fondos/texturas). Las fotos reales
 * de obra propia (bajomesada1 en slide 2, bajomesada2 en slide 5) NO se
 * reemplazan por imágenes IA.
 */

import { generateMarketingImage } from './dist/index.js';

if (!process.env.OPENAI_API_KEY) {
  console.error(
    '\n✗ OPENAI_API_KEY no está seteada en el entorno.\n' +
      '  Cargala como variable de entorno del environment de Claude Code y reintentá.\n',
  );
  process.exit(1);
}

// Prompts espejados desde package/assets.json → optional_ai_images.generation_prompts
const IDEAS = [
  {
    name: 'slide-bg-textura-cemento-aluminio',
    objective:
      'Fondo abstracto de cemento alisado gris carbón (#141619) con una fina línea de ' +
      'aluminio anodizado negro cruzando en diagonal y un sutil destello azul acero, ' +
      'luz lateral suave, estética arquitectónica minimalista premium, superficie mate, ' +
      'mucho espacio negativo para poner texto encima.',
    format: 'instagram-feed',
    mood: 'industrial elegante, oscuro, sobrio, editorial',
    setting: 'detalle arquitectónico, estudio de diseño',
    extraDetails: [
      'sin ningún texto ni tipografía en la imagen',
      'sin logos ni marcas de agua',
      'sin personas',
      'composición con aire en la mitad inferior para sobreimprimir titulares',
    ],
    quality: 'high',
  },
  {
    name: 'slide4-materia-bajomesada-aluminio-negro',
    objective:
      'Primer plano macro de una puerta de bajomesada de aluminio negro con listones ' +
      'horizontales, textura mate anodizada, junto al calor de una parrilla encendida ' +
      'fuera de foco a un costado, luz cálida rasante que resbala sobre el metal, ' +
      'fotografía de producto arquitectónico premium, muy alto detalle.',
    format: 'instagram-feed',
    mood: 'premium, materia y luz, cálido, alto detalle',
    setting: 'quincho / parrilla en una casa de Zona Sur GBA',
    extraDetails: [
      'aluminio negro realista, sin deformaciones',
      'sin texto, sin watermark',
      'brasas cálidas desenfocadas como fuente de luz lateral',
    ],
    quality: 'high',
  },
];

const run = async () => {
  console.log('▶ Generando imágenes de apoyo con GPT Image (gpt-image-1)…\n');
  for (const idea of IDEAS) {
    const { name, ...contentIdea } = idea;
    try {
      const r = await generateMarketingImage(contentIdea);
      console.log(`✓ ${name}`);
      console.log(`   archivo: ${r.imagePath}`);
      console.log(`   modelo:  ${r.model}  ·  ${r.width}x${r.height}  ·  ~US$${r.estimatedCostUsd ?? '?'}`);
      console.log(`   tiempo:  ${r.generationTimeMs}ms\n`);
    } catch (err) {
      console.error(`✗ ${name} — falló:`, err instanceof Error ? err.message : err, '\n');
    }
  }
  console.log('Listo. Revisá generated/images/. Recordá: apoyo, no reemplaza obra propia.');
};

run().catch((e) => {
  console.error('Error fatal:', e);
  process.exit(1);
});
