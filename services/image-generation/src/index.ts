/**
 * index.ts
 * ---------------------------------------------------------------------------
 * API pública del módulo de generación de imágenes de Alumfer.
 *
 * Uso mínimo:
 *
 *   import { generateMarketingImage } from './services/image-generation/src/index.js';
 *
 *   const result = await generateMarketingImage({
 *     objective: 'una ventana corrediza premium en un living moderno',
 *     format: 'instagram-feed',
 *   });
 *
 *   console.log(result.imagePath); // generated/images/alumfer-...png
 *
 * Rol de Claude: DIRECTOR CREATIVO. Escribe la idea/prompt; GPT Image genera
 * los píxeles. Claude nunca "dibuja" la imagen: solo dirige.
 */

import type { ContentIdea, ImageProvider, Logger, MarketingImageResult } from './types.js';
import { registerProvider, resolveProvider } from './image-provider.js';
import { OpenAIImageProvider } from './openai-image-provider.js';
import { ImageService } from './image-service.js';
import { defaultLogger } from './logger.js';

// ── Registro de proveedores disponibles ────────────────────────────────────
// Para sumar Flux/Ideogram/etc. en el futuro:
//   registerProvider('flux', () => new FluxImageProvider());
registerProvider('openai', () => new OpenAIImageProvider());

export interface GenerateOptions {
  /** Proveedor a usar. Por defecto `process.env.IMAGE_PROVIDER` o 'openai'. */
  provider?: string;
  /** Instancia de proveedor ya construida (tiene prioridad sobre `provider`). */
  providerInstance?: ImageProvider;
  /** Carpeta de salida. Por defecto `<repo>/generated/images`. */
  outputDir?: string;
  /** Logger inyectable. */
  logger?: Logger;
}

/**
 * FUNCIÓN PÚBLICA PRINCIPAL.
 *
 * Convierte una idea de contenido en una imagen fotorrealista guardada en
 * `/generated/images/` y devuelve su metadata.
 *
 * @param contentIdea  Idea de alto nivel (qué comunicar, formato, mood…).
 * @param options      Selección de proveedor / salida / logger (opcional).
 * @returns  Metadata: { imagePath, prompt, revisedPrompt, width, height,
 *           provider, model, format, createdAt, generationTimeMs,
 *           estimatedCostUsd }.
 */
export async function generateMarketingImage(
  contentIdea: ContentIdea,
  options: GenerateOptions = {},
): Promise<MarketingImageResult> {
  const logger = options.logger ?? defaultLogger;
  const provider =
    options.providerInstance ??
    resolveProvider(options.provider ?? process.env.IMAGE_PROVIDER ?? 'openai');

  const service = new ImageService({
    provider,
    outputDir: options.outputDir,
    logger,
  });

  return service.generate(contentIdea);
}

// ── Re-exports para consumidores avanzados / extensibilidad ─────────────────
export { ImageService } from './image-service.js';
export { OpenAIImageProvider } from './openai-image-provider.js';
export { buildPrompt, QUALITY_KEYWORDS, NEGATIVE_KEYWORDS } from './prompt-builder.js';
export { SIZE_PRESETS, getSizePreset } from './sizes.js';
export {
  registerProvider,
  resolveProvider,
  listProviders,
} from './image-provider.js';
export { defaultLogger, silentLogger } from './logger.js';
export type {
  ContentIdea,
  ImageFormat,
  ImageProvider,
  ImageGenerationRequest,
  ImageResult,
  ImageSize,
  ImageQuality,
  MarketingImageResult,
  SizePreset,
  Logger,
} from './types.js';
