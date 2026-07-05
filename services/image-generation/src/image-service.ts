/**
 * image-service.ts
 * ---------------------------------------------------------------------------
 * Orquestador del flujo completo:
 *
 *   Idea de contenido
 *        ↓  PromptBuilder (Director Creativo)
 *   Prompt cinematográfico
 *        ↓  ImageProvider (OpenAI GPT Image / futuro Flux, Ideogram…)
 *   Imagen (bytes nativos)
 *        ↓  resizeToExact (post-proceso a tamaño de red exacto)
 *   Imagen final
 *        ↓  persistencia
 *   /generated/images/<archivo>.png
 *        ↓
 *   MarketingImageResult (metadata)
 *
 * El servicio NO conoce a OpenAI: depende solo de la interfaz `ImageProvider`.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join as pathJoin, relative, resolve } from 'node:path';

import type {
  ContentIdea,
  ImageProvider,
  Logger,
  MarketingImageResult,
} from './types.js';
import { buildPrompt } from './prompt-builder.js';
import { getSizePreset } from './sizes.js';
import { defaultLogger } from './logger.js';

/** Raíz del repo (services/image-generation/src → ../../..). */
const REPO_ROOT = resolve(new URL('../../..', import.meta.url).pathname);
const DEFAULT_OUTPUT_DIR = pathJoin(REPO_ROOT, 'generated', 'images');

export interface ImageServiceOptions {
  /** Proveedor concreto de imágenes. */
  provider: ImageProvider;
  /** Carpeta de salida. Por defecto `<repo>/generated/images`. */
  outputDir?: string;
  /** Logger inyectable. */
  logger?: Logger;
}

/**
 * Servicio de alto nivel. Encapsula el flujo idea → imagen guardada.
 * Es agnóstico del proveedor.
 */
export class ImageService {
  private readonly provider: ImageProvider;
  private readonly outputDir: string;
  private readonly logger: Logger;

  constructor(options: ImageServiceOptions) {
    this.provider = options.provider;
    this.outputDir = options.outputDir ?? DEFAULT_OUTPUT_DIR;
    this.logger = options.logger ?? defaultLogger;
  }

  /**
   * Genera una imagen de marketing a partir de una idea de contenido y la
   * deja guardada en disco, lista para Canva/Figma/CapCut.
   */
  async generate(idea: ContentIdea): Promise<MarketingImageResult> {
    const format = idea.format ?? 'instagram-feed';
    const preset = getSizePreset(format);

    // 1) Director Creativo: idea → prompt cinematográfico.
    const { prompt, negativePrompt } = buildPrompt(idea);

    // 2) Proveedor: prompt → imagen nativa.
    const result = await this.provider.generateImage({
      prompt,
      negativePrompt,
      size: { width: preset.width, height: preset.height },
      format,
      quality: idea.quality ?? 'high',
    });

    // 3) Post-proceso: reescalar/recortar al tamaño exacto de red.
    const { buffer, width, height } = await resizeToExact(
      result.image,
      preset.width,
      preset.height,
      this.logger,
    );

    // 4) Persistir en /generated/images/.
    const fileName = buildFileName(format, result.provider);
    await mkdir(this.outputDir, { recursive: true });
    const absPath = pathJoin(this.outputDir, fileName);
    await writeFile(absPath, buffer);

    const imagePath = relative(REPO_ROOT, absPath);
    const createdAt = new Date().toISOString();

    this.logger.info('Imagen de marketing guardada', {
      imagePath,
      format,
      width,
      height,
      provider: result.provider,
      model: result.model,
      generationTimeMs: result.generationTimeMs,
      estimatedCostUsd: result.estimatedCostUsd,
    });

    return {
      imagePath,
      prompt,
      revisedPrompt: result.revisedPrompt,
      width,
      height,
      provider: result.provider,
      model: result.model,
      format,
      createdAt,
      generationTimeMs: result.generationTimeMs,
      estimatedCostUsd: result.estimatedCostUsd,
    };
  }
}

/**
 * Reescala/recorta la imagen a dimensiones exactas usando `sharp` SI está
 * instalado. Si no lo está, devuelve el buffer nativo tal cual y avisa por log
 * (el módulo sigue funcionando sin dependencias de imagen).
 */
async function resizeToExact(
  input: Buffer,
  width: number,
  height: number,
  logger: Logger,
): Promise<{ buffer: Buffer; width: number; height: number }> {
  try {
    // Import dinámico opcional: sharp es una dependencia peer, no obligatoria.
    // El specifier se computa para que TS no exija sus tipos en build.
    const sharpModule = 'sharp';
    const mod: any = await import(sharpModule).catch(() => null);
    if (!mod) {
      logger.warn(
        'sharp no está instalado: se guarda la imagen en su tamaño nativo (sin recorte exacto).',
        { requestedWidth: width, requestedHeight: height },
      );
      return { buffer: input, width, height };
    }
    const sharp = mod.default ?? mod;
    const buffer = await sharp(input)
      .resize(width, height, { fit: 'cover', position: 'attention' })
      .png()
      .toBuffer();
    return { buffer, width, height };
  } catch (err) {
    logger.warn('Falló el reescalado con sharp; se guarda el tamaño nativo.', {
      error: String(err),
    });
    return { buffer: input, width, height };
  }
}

/** Nombre de archivo único y descriptivo, en minúsculas. */
function buildFileName(format: string, provider: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const rand = Math.random().toString(36).slice(2, 8);
  return `alumfer-${format}-${provider}-${stamp}-${rand}.png`;
}
