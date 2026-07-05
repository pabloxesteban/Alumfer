/**
 * types.ts
 * ---------------------------------------------------------------------------
 * Contratos compartidos por todo el módulo de generación de imágenes.
 *
 * La idea rectora: el resto del sistema depende SOLO de estos tipos y de la
 * interfaz `ImageProvider`. Cambiar de proveedor (OpenAI → Flux, Ideogram,
 * Stable Diffusion…) no debe obligar a tocar nada fuera de la carpeta
 * `services/image-generation/`.
 */

/**
 * Formatos de salida soportados por el pipeline de contenido de Alumfer.
 * Cada formato mapea a un tamaño exacto en `SIZE_PRESETS` (ver `sizes.ts`).
 */
export type ImageFormat =
  | 'instagram-feed' // 1080x1080
  | 'instagram-portrait' // 1080x1350
  | 'stories' // 1080x1920
  | 'tiktok' // 1080x1920
  | 'hero-website'; // 1792x1024

/** Dimensiones en píxeles de la imagen final. */
export interface ImageSize {
  width: number;
  height: number;
}

/**
 * Preset completo de un formato: dimensiones finales deseadas + el tamaño
 * nativo más cercano que el proveedor puede generar realmente.
 *
 * Los modelos actuales (gpt-image-1, dall-e-3) solo generan un set fijo de
 * relaciones de aspecto. Generamos en `nativeSize` y, si hace falta, se
 * reescala/recorta a `width`x`height` en post-proceso.
 */
export interface SizePreset extends ImageSize {
  format: ImageFormat;
  /** Etiqueta legible: "Instagram Feed", "Stories"… */
  label: string;
  /** Tamaño nativo que se le pide al proveedor (p. ej. "1024x1024"). */
  nativeSize: string;
}

/** Nivel de calidad solicitado al proveedor. */
export type ImageQuality = 'low' | 'medium' | 'high' | 'auto';

/**
 * Petición de generación normalizada que recibe un `ImageProvider`.
 * Es agnóstica del proveedor: el `prompt` ya viene "cocinado" por el
 * `PromptBuilder`.
 */
export interface ImageGenerationRequest {
  /** Prompt cinematográfico final, listo para enviar al modelo. */
  prompt: string;
  /** Prompt negativo (qué evitar). No todos los proveedores lo soportan. */
  negativePrompt?: string;
  /** Dimensiones finales deseadas. */
  size: ImageSize;
  /** Formato lógico de destino (para logging/metadata). */
  format?: ImageFormat;
  /** Calidad solicitada. Por defecto 'high'. */
  quality?: ImageQuality;
  /** Override del modelo. Si se omite, cada proveedor usa su default. */
  model?: string;
}

/**
 * Resultado crudo devuelto por un `ImageProvider`.
 * Contiene los bytes de la imagen, todavía sin persistir en disco.
 */
export interface ImageResult {
  /** Bytes de la imagen generada. */
  image: Buffer;
  /** Extensión/formato del archivo ('png', 'webp'…). */
  fileExtension: string;
  /** Prompt que el proveedor realmente usó (algunos modelos lo reescriben). */
  revisedPrompt?: string;
  /** Nombre del modelo que generó la imagen. */
  model: string;
  /** Identificador del proveedor ('openai', 'flux'…). */
  provider: string;
  /** Dimensiones nativas con las que respondió el proveedor. */
  width: number;
  height: number;
  /** Tiempo de generación en milisegundos. */
  generationTimeMs: number;
  /** Costo estimado en USD (si el proveedor puede calcularlo). */
  estimatedCostUsd?: number;
}

/**
 * Idea de contenido de alto nivel. Es la ENTRADA del sistema: describe qué
 * se quiere comunicar, no cómo. El `PromptBuilder` la convierte en un prompt
 * cinematográfico rico.
 */
export interface ContentIdea {
  /** Qué se quiere mostrar/comunicar. Ej: "una ventana corrediza premium". */
  objective: string;
  /** Formato de destino. Por defecto 'instagram-feed'. */
  format?: ImageFormat;
  /** Sujeto principal explícito, si difiere del objetivo. */
  subject?: string;
  /** Ambiente/mood deseado. Ej: "atardecer, luz cálida". */
  mood?: string;
  /** Contexto arquitectónico. Ej: "casa moderna en Adrogué". */
  setting?: string;
  /** Detalles extra que el director creativo quiera forzar en el prompt. */
  extraDetails?: string[];
  /** Calidad deseada. */
  quality?: ImageQuality;
}

/**
 * Metadata final que se devuelve al pipeline de contenido tras generar y
 * guardar la imagen. Es el CONTRATO PÚBLICO de `generateMarketingImage`.
 */
export interface MarketingImageResult {
  /** Ruta relativa al repo donde quedó guardada la imagen. */
  imagePath: string;
  /** Prompt que construyó el PromptBuilder y se envió al proveedor. */
  prompt: string;
  /** Prompt reescrito por el modelo (si aplica). */
  revisedPrompt?: string;
  /** Ancho final en píxeles. */
  width: number;
  /** Alto final en píxeles. */
  height: number;
  /** Proveedor usado ('openai'…). */
  provider: string;
  /** Modelo usado. */
  model: string;
  /** Formato lógico de la pieza. */
  format: ImageFormat;
  /** Timestamp ISO-8601 de creación. */
  createdAt: string;
  /** Tiempo total de generación en ms. */
  generationTimeMs: number;
  /** Costo estimado en USD. */
  estimatedCostUsd?: number;
}

/**
 * Contrato que TODO proveedor de imágenes debe implementar.
 *
 * Es el único punto de acoplamiento entre el `ImageService` y el mundo
 * exterior. Agregar Flux/Ideogram/etc. = crear una clase nueva que
 * implemente esta interfaz. Nada más cambia.
 */
export interface ImageProvider {
  /** Identificador estable del proveedor ('openai', 'flux'…). */
  readonly name: string;
  /** Genera una imagen a partir de una petición normalizada. */
  generateImage(request: ImageGenerationRequest): Promise<ImageResult>;
}

/** Firma mínima de un logger inyectable. */
export interface Logger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}
