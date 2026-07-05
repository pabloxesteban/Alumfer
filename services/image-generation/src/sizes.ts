/**
 * sizes.ts
 * ---------------------------------------------------------------------------
 * Catálogo de tamaños soportados por el pipeline de contenido.
 *
 * Cada formato lógico define:
 *  - `width`/`height`: las dimensiones EXACTAS que necesita Canva/Figma/CapCut.
 *  - `nativeSize`: la relación de aspecto más cercana que el modelo puede
 *    generar de forma nativa. Se genera ahí y luego se reescala/recorta al
 *    tamaño exacto (ver `image-service.ts` → `resizeToExact`).
 *
 * Por qué esta indirección: gpt-image-1 y dall-e-3 solo aceptan un set fijo
 * de tamaños (1024², 1536×1024, 1024×1536, 1792×1024, 1024×1792). Los tamaños
 * de redes (1080×1080, 1080×1350, 1080×1920) NO son nativos, así que se
 * derivan por post-proceso manteniendo la relación de aspecto correcta.
 */

import type { ImageFormat, SizePreset } from './types.js';

export const SIZE_PRESETS: Record<ImageFormat, SizePreset> = {
  'instagram-feed': {
    format: 'instagram-feed',
    label: 'Instagram Feed',
    width: 1080,
    height: 1080,
    nativeSize: '1024x1024', // 1:1
  },
  'instagram-portrait': {
    format: 'instagram-portrait',
    label: 'Instagram Portrait',
    width: 1080,
    height: 1350,
    nativeSize: '1024x1536', // 4:5 → se genera 2:3 y se recorta al 4:5
  },
  stories: {
    format: 'stories',
    label: 'Instagram Stories',
    width: 1080,
    height: 1920,
    nativeSize: '1024x1536', // 9:16 → se genera 2:3 y se recorta al 9:16
  },
  tiktok: {
    format: 'tiktok',
    label: 'TikTok',
    width: 1080,
    height: 1920,
    nativeSize: '1024x1536', // 9:16
  },
  'hero-website': {
    format: 'hero-website',
    label: 'Hero Website',
    width: 1792,
    height: 1024,
    nativeSize: '1536x1024', // 3:2 landscape (gpt-image-1); ~16:9 tras recorte
  },
};

/** Resuelve un preset de tamaño a partir del formato. */
export function getSizePreset(format: ImageFormat): SizePreset {
  const preset = SIZE_PRESETS[format];
  if (!preset) {
    throw new Error(
      `Formato de imagen no soportado: "${format}". ` +
        `Válidos: ${Object.keys(SIZE_PRESETS).join(', ')}.`,
    );
  }
  return preset;
}
