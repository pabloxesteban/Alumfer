/**
 * generate-carousel.ts
 * ---------------------------------------------------------------------------
 * Genera las imágenes fotorrealistas del carrusel "La ventana barata no existe"
 * (Alumfer) usando el servicio de imágenes (OpenAI GPT Image).
 *
 * Requiere OPENAI_API_KEY en el entorno. Uso:
 *   node --experimental-strip-types --env-file=services/image-generation/.env \
 *        services/image-generation/src/generate-carousel.ts
 *
 * Cada imagen se guarda con nombre estable en generated/images/<id>.png,
 * lista para que Claude (Director de Arte) la monte como fondo de cada slide.
 */

import { renameSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateMarketingImage } from './index.js';
import type { ContentIdea } from './types.js';

interface SlideImage {
  id: string; // nombre de archivo final (sin extensión)
  label: string; // para logging
  idea: ContentIdea;
}

// Dirección de arte común de marca (Claude dirige; GPT Image genera)
const SETTING = 'vivienda residencial contemporánea del Gran Buenos Aires, Argentina';

const SLIDES: SlideImage[] = [
  {
    id: 'slide-1-hero',
    label: 'Hook — ventana premium',
    idea: {
      objective:
        'una ventana corrediza de aluminio negro antracita premium, marco delgado y elegante, vidrio grande reflejando luz',
      setting: 'living moderno y sobrio',
      mood: 'luz natural cálida de atardecer, atmósfera premium',
      extraDetails: ['perfil de aluminio negro mate', 'vidrio limpio con reflejos sutiles'],
    },
  },
  {
    id: 'slide-2a-aluminio',
    label: 'Aluminio (buena)',
    idea: {
      objective:
        'una ventana de aluminio moderna impecable, marco fino de aluminio oscuro, vidrio reflejando un cielo despejado',
      setting: 'fachada de casa contemporánea',
      mood: 'día claro, luz limpia, aspecto nuevo y prolijo',
      extraDetails: ['líneas rectas y precisas', 'sellado perfecto'],
    },
  },
  {
    id: 'slide-2b-madera',
    label: 'Madera (mala)',
    idea: {
      objective:
        'una ventana de madera vieja y deteriorada, pintura descascarada, marco hinchado y algo podrido, grilla colonial de vidrios pequeños',
      setting: 'pared antigua desgastada',
      mood: 'luz plana, aspecto envejecido, descuidado, húmedo',
      extraDetails: ['pintura saltada', 'madera agrietada', 'bisagras oxidadas'],
    },
  },
  {
    id: 'slide-3-frio',
    label: 'El frío (invierno)',
    idea: {
      objective:
        'vista interior de una ventana de aluminio en invierno, primer plano del marco y el burlete de sellado perimetral',
      setting: 'ambiente interior en un día frío',
      mood: 'luz fría y azulada entrando desde afuera, sensación de invierno',
      extraDetails: ['detalle del contacto marco-pared', 'burlete de goma visible'],
    },
  },
  {
    id: 'slide-4-ruido',
    label: 'El ruido (calle)',
    idea: {
      objective:
        'vista interior desde un living hacia una ventana de aluminio que da a una calle residencial tranquila del Gran Buenos Aires, con autos estacionados de forma prolija y una vereda arbolada vista a través del vidrio',
      setting: 'living de una casa sobre una calle residencial',
      mood: 'día claro y realista, calle ordenada, escena creíble y cotidiana',
      extraDetails: [
        'autos estacionados en posiciones realistas y correctas',
        'vereda con árboles y casas bajas',
        'sin autos flotando ni deformados, perspectiva de calle correcta',
      ],
    },
  },
  {
    id: 'slide-5-humedad',
    label: 'La humedad',
    idea: {
      objective:
        'primer plano de una ventana con condensación intensa de gotas de agua en el vidrio y una mancha de moho en la esquina del marco',
      setting: 'ambiente interior húmedo',
      mood: 'luz fría, atmósfera húmeda, problema visible',
      extraDetails: ['gotas de condensación nítidas', 'moho oscuro en la esquina inferior'],
    },
  },
  {
    id: 'slide-6-segunda-ventana',
    label: 'La segunda ventana',
    idea: {
      objective:
        'una pared de una casa con una ventana vieja de aluminio deteriorada a la izquierda y una ventana nueva de aluminio negro impecable a la derecha, mostrando el reemplazo de una abertura vieja por una nueva',
      setting: 'exterior de una casa, comparación lado a lado en la misma pared',
      mood: 'día claro, concepto de antes y después, prolijo, sin obra rota',
      extraDetails: [
        'sin personas en la escena',
        'la pared intacta, sin escombros ni rotura',
        'contraste claro entre la ventana vieja y la nueva de aluminio',
      ],
    },
  },
  {
    id: 'slide-7-taller',
    label: 'El giro (fabricación propia)',
    idea: {
      objective:
        'primer plano de una esquina de un marco de ventana de aluminio negro con una unión a inglete de 45 grados perfecta, perfiles de aluminio prolijamente apoyados sobre una mesa de taller',
      setting: 'mesa de trabajo de un taller de aberturas de aluminio',
      mood: 'luz cálida y sobria, foco en la precisión y la calidad de fabricación',
      extraDetails: [
        'sin personas en la escena',
        'unión a inglete de 45° impecable y bien visible',
        'perfiles de aluminio negro mate, calidad premium',
      ],
    },
  },
  {
    id: 'slide-8-cta',
    label: 'CTA — obra terminada',
    idea: {
      objective:
        'una ventana de aluminio hermosa y perfectamente terminada instalada en un living moderno luminoso',
      setting: 'living contemporáneo con luz natural abundante',
      mood: 'luz natural brillante, resultado premium, aspiracional',
      extraDetails: ['ambiente ordenado y cálido', 'vista agradable a través del vidrio'],
    },
  },
];

async function main(): Promise<void> {
  const outDir = resolve(process.cwd(), 'generated/images');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const only = process.argv.slice(2);
  const slides = only.length ? SLIDES.filter((s) => only.some((o) => s.id.includes(o))) : SLIDES;
  console.log(`\n🎬 Generando ${slides.length} imágenes del carrusel (formato retrato 1080x1350)...\n`);
  const done: string[] = [];
  const failed: string[] = [];
  let totalCost = 0;

  for (const slide of slides) {
    try {
      console.log(`→ ${slide.id}  (${slide.label})`);
      const result = await generateMarketingImage(
        { ...slide.idea, format: 'instagram-portrait', quality: 'high' },
        { outputDir: outDir },
      );
      const finalPath = resolve(outDir, `${slide.id}.png`);
      renameSync(resolve(process.cwd(), result.imagePath), finalPath);
      totalCost += result.estimatedCostUsd ?? 0;
      console.log(
        `  ✓ ${slide.id}.png  (${result.width}x${result.height}, ${result.generationTimeMs}ms, ~$${(result.estimatedCostUsd ?? 0).toFixed(3)})`,
      );
      done.push(`${slide.id}.png`);
    } catch (err) {
      console.error(`  ✗ ${slide.id} FALLÓ:`, err instanceof Error ? err.message : err);
      failed.push(slide.id);
    }
  }

  console.log(`\n─────────────────────────────`);
  console.log(`OK: ${done.length}/${SLIDES.length}   ·   costo estimado total: ~$${totalCost.toFixed(2)}`);
  if (failed.length) console.log(`Fallaron: ${failed.join(', ')}`);
  console.log(`Imágenes en: generated/images/`);
}

main().catch((err) => {
  console.error('\n❌ Error general:', err);
  process.exit(1);
});
