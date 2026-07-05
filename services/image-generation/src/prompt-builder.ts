/**
 * prompt-builder.ts
 * ---------------------------------------------------------------------------
 * Convierte una IDEA de contenido de alto nivel en un PROMPT cinematográfico
 * y fotorrealista listo para el modelo de imagen.
 *
 * Este módulo ES el rol de "Director Creativo": no genera píxeles, escribe la
 * mejor instrucción posible. Toma una frase como "una ventana corrediza
 * premium" y la enriquece con estilo fotográfico, iluminación, lente,
 * composición, arquitectura, calidad y territorio de marca (Alumfer, Zona Sur
 * GBA, aluminio + vidrio premium).
 *
 * El resultado apunta siempre a: photorealistic, commercial/architectural
 * photography, luxury, natural lighting, aluminio y vidrio realistas, calidad
 * de revista, apto para publicidad en Instagram.
 */

import type { ContentIdea, ImageFormat } from './types.js';
import { getSizePreset } from './sizes.js';

/**
 * Cualidades visuales que TODA imagen de Alumfer debe priorizar.
 * Definen el "look" fotográfico de marca (industrial elegante).
 */
export const QUALITY_KEYWORDS: readonly string[] = [
  'photorealistic',
  'commercial photography',
  'architectural photography',
  'luxury',
  'premium',
  'natural lighting',
  'realistic reflections',
  'realistic aluminum frames',
  'realistic glass',
  'magazine quality',
  'ultra detailed',
  'Instagram advertisement',
  'Buenos Aires residential architecture',
  'modern houses',
];

/**
 * Lo que la imagen NUNCA debe contener. Se envía como prompt negativo cuando
 * el proveedor lo soporta y, además, se refuerza en el prompt positivo.
 */
export const NEGATIVE_KEYWORDS: readonly string[] = [
  'cartoon',
  'vector',
  'illustration',
  'obvious CGI',
  '3D render look',
  'deformations',
  'distorted windows',
  'crooked window frames',
  'unrealistic perspective',
  'embedded text',
  'captions',
  'watermarks',
  'logos',
  'low quality',
  'blurry',
];

/**
 * Recetas fotográficas por formato: lente, encuadre y orientación que mejor
 * funcionan para cada canal. Un Director Creativo no encuadra igual un feed
 * cuadrado que un hero panorámico de web.
 */
const FORMAT_RECIPES: Record<
  ImageFormat,
  { lens: string; framing: string; orientation: string }
> = {
  'instagram-feed': {
    lens: 'shot on a 35mm lens',
    framing: 'balanced centered composition, rule of thirds',
    orientation: 'square 1:1 framing',
  },
  'instagram-portrait': {
    lens: 'shot on a 50mm prime lens',
    framing: 'vertical composition with strong foreground depth',
    orientation: 'portrait 4:5 framing',
  },
  stories: {
    lens: 'shot on a 24mm wide lens',
    framing: 'full-height vertical composition, generous negative space at top',
    orientation: 'vertical 9:16 framing',
  },
  tiktok: {
    lens: 'shot on a 24mm wide lens',
    framing: 'dynamic vertical composition, subject slightly off-center',
    orientation: 'vertical 9:16 framing',
  },
  'hero-website': {
    lens: 'shot on a 24mm architectural wide lens, tilt-shift corrected verticals',
    framing: 'wide cinematic composition, strong horizontal lines',
    orientation: 'panoramic 16:9 framing',
  },
};

/**
 * Base de estilo de marca. Es la "firma" fotográfica de Alumfer que se inyecta
 * en todos los prompts. Calibrada con las referencias del brand book:
 * Tadao Ando (luz y materia), arquitectura contemporánea latinoamericana,
 * industrial elegante.
 */
const BRAND_STYLE: readonly string[] = [
  'high-end architectural photography of premium aluminum joinery',
  'crafted aluminum window and door systems with slim sightlines',
  'clean modern residential architecture in Buenos Aires southern suburbs (Zona Sur GBA)',
  'industrial-elegant aesthetic: concrete, steel, warm wood accents',
  'soft natural daylight, golden hour warmth, subtle realistic reflections on glass',
  'true-to-life brushed aluminum texture and crystal-clear glazing',
  'inspired by Tadao Ando light and material sensibility',
];

/** Elimina duplicados preservando el orden de aparición. */
function dedupe(items: string[]): string[] {
  return [...new Set(items.map((s) => s.trim()).filter(Boolean))];
}

/** Une segmentos no vacíos con un separador. */
function join(parts: (string | undefined)[], sep = ', '): string {
  return parts.filter((p): p is string => Boolean(p && p.trim())).join(sep);
}

export interface BuiltPrompt {
  /** Prompt positivo, cinematográfico y completo. */
  prompt: string;
  /** Prompt negativo (qué evitar). */
  negativePrompt: string;
}

/**
 * Construye el prompt cinematográfico final a partir de una idea de contenido.
 *
 * @example
 *   buildPrompt({ objective: 'una ventana corrediza premium' })
 *   // → "Professional photograph of a premium sliding aluminum window ...
 *   //    high-end architectural photography ... shot on a 35mm lens ...
 *   //    photorealistic, commercial photography, natural lighting, ..."
 */
export function buildPrompt(idea: ContentIdea): BuiltPrompt {
  const format = idea.format ?? 'instagram-feed';
  const recipe = FORMAT_RECIPES[format];
  // Valida que el formato exista (lanza con mensaje claro si no).
  getSizePreset(format);

  const subject = idea.subject?.trim() || idea.objective.trim();

  // ── Bloque 1: sujeto + escena ────────────────────────────────────────────
  const scene = join([
    `Professional commercial photograph of ${subject}`,
    idea.setting && `set in ${idea.setting}`,
    idea.mood && `mood: ${idea.mood}`,
  ]);

  // ── Bloque 2: firma de marca ─────────────────────────────────────────────
  const brand = BRAND_STYLE.join(', ');

  // ── Bloque 3: receta fotográfica del formato ─────────────────────────────
  const camera = join([recipe.lens, recipe.framing, recipe.orientation]);

  // ── Bloque 4: detalles forzados por el director creativo ─────────────────
  const extras = idea.extraDetails?.length ? idea.extraDetails.join(', ') : '';

  // ── Bloque 5: cualidades de calidad no negociables ───────────────────────
  const quality = QUALITY_KEYWORDS.join(', ');

  // ── Bloque 6: refuerzo negativo dentro del prompt positivo ───────────────
  const avoid =
    'Avoid any of the following: ' +
    NEGATIVE_KEYWORDS.join(', ') +
    '. No text, no captions, no watermarks, no logos anywhere in the image.';

  const prompt = dedupe([scene, brand, camera, extras, quality, avoid]).join('. ') + '.';

  return {
    prompt,
    negativePrompt: NEGATIVE_KEYWORDS.join(', '),
  };
}
