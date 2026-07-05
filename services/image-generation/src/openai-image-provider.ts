/**
 * openai-image-provider.ts
 * ---------------------------------------------------------------------------
 * Implementación de `ImageProvider` sobre la API de Imágenes de OpenAI
 * (gpt-image-1 por defecto; compatible también con dall-e-3).
 *
 * - Usa `fetch` nativo (Node 18+): cero dependencias de SDK.
 * - La clave se lee de `OPENAI_API_KEY`; el modelo de `OPENAI_IMAGE_MODEL`.
 * - Reintentos con backoff exponencial ante errores transitorios (429 / 5xx).
 * - Estimación de costo best-effort y logging estructurado.
 */

import type {
  ImageGenerationRequest,
  ImageProvider,
  ImageResult,
  ImageQuality,
  Logger,
} from './types.js';
import { defaultLogger } from './logger.js';

const OPENAI_IMAGES_ENDPOINT = 'https://api.openai.com/v1/images/generations';
const DEFAULT_MODEL = 'gpt-image-1';

/** Tamaños nativos que cada familia de modelos puede generar. */
const NATIVE_SIZES: Record<string, { square: string; landscape: string; portrait: string }> = {
  'gpt-image-1': { square: '1024x1024', landscape: '1536x1024', portrait: '1024x1536' },
  'dall-e-3': { square: '1024x1024', landscape: '1792x1024', portrait: '1024x1792' },
};

/**
 * Tabla de costos aproximados en USD por imagen (best-effort; los precios
 * reales pueden cambiar). Se usa solo para logging/estimación, no para
 * facturación.
 */
const COST_TABLE: Record<string, Partial<Record<ImageQuality | 'standard' | 'hd', number>>> = {
  'gpt-image-1': { low: 0.011, medium: 0.042, high: 0.167, auto: 0.042 },
  'dall-e-3': { standard: 0.04, hd: 0.08, auto: 0.04 },
};

export interface OpenAIProviderOptions {
  /** Clave de API. Por defecto `process.env.OPENAI_API_KEY`. */
  apiKey?: string;
  /** Modelo. Por defecto `process.env.OPENAI_IMAGE_MODEL` o 'gpt-image-1'. */
  model?: string;
  /** Cantidad de reintentos ante errores transitorios. Por defecto 3. */
  maxRetries?: number;
  /** Timeout por request en ms. Por defecto 120000. */
  timeoutMs?: number;
  /** Logger inyectable. */
  logger?: Logger;
  /** Override del `fetch` (útil para tests). */
  fetchImpl?: typeof fetch;
}

export class OpenAIImageProvider implements ImageProvider {
  readonly name = 'openai';

  private readonly apiKey: string;
  private readonly model: string;
  private readonly maxRetries: number;
  private readonly timeoutMs: number;
  private readonly logger: Logger;
  private readonly fetchImpl: typeof fetch;

  constructor(options: OpenAIProviderOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.OPENAI_API_KEY ?? '';
    this.model = options.model ?? process.env.OPENAI_IMAGE_MODEL ?? DEFAULT_MODEL;
    this.maxRetries = options.maxRetries ?? 3;
    this.timeoutMs = options.timeoutMs ?? 120_000;
    this.logger = options.logger ?? defaultLogger;
    this.fetchImpl = options.fetchImpl ?? fetch;

    if (!this.apiKey) {
      throw new Error(
        'OPENAI_API_KEY no está configurada. Definila en el entorno (.env) antes de generar imágenes.',
      );
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageResult> {
    const model = request.model ?? this.model;
    const nativeSize = this.pickNativeSize(model, request.size.width, request.size.height);
    const quality = this.mapQuality(model, request.quality ?? 'high');
    const body = this.buildRequestBody(model, request.prompt, nativeSize, quality);

    this.logger.info('Enviando prompt a OpenAI', {
      provider: this.name,
      model,
      nativeSize,
      quality,
      promptChars: request.prompt.length,
      promptPreview: request.prompt.slice(0, 240),
    });

    const started = Date.now();
    const json = await this.requestWithRetries(body, model);
    const generationTimeMs = Date.now() - started;

    const first = json?.data?.[0];
    if (!first?.b64_json && !first?.url) {
      throw new Error('La respuesta de OpenAI no contiene imagen (b64_json/url ausentes).');
    }

    const image = first.b64_json
      ? Buffer.from(first.b64_json, 'base64')
      : await this.downloadImage(first.url as string);

    const [w, h] = nativeSize.split('x').map(Number);
    const estimatedCostUsd = this.estimateCost(model, request.quality ?? 'high');

    this.logger.info('Imagen generada por OpenAI', {
      provider: this.name,
      model,
      generationTimeMs,
      estimatedCostUsd,
      revisedPrompt: first.revised_prompt?.slice(0, 240),
    });

    return {
      image,
      fileExtension: 'png',
      revisedPrompt: first.revised_prompt,
      model,
      provider: this.name,
      width: w,
      height: h,
      generationTimeMs,
      estimatedCostUsd,
    };
  }

  // ── Internos ───────────────────────────────────────────────────────────

  /** Arma el body según la familia de modelo (gpt-image-1 vs dall-e-3). */
  private buildRequestBody(
    model: string,
    prompt: string,
    size: string,
    quality: string,
  ): Record<string, unknown> {
    const base: Record<string, unknown> = { model, prompt, size, n: 1, quality };
    // dall-e-3 necesita response_format explícito para recibir base64.
    if (model.startsWith('dall-e')) base.response_format = 'b64_json';
    return base;
  }

  /** Elige el tamaño nativo más cercano según la relación de aspecto. */
  private pickNativeSize(model: string, width: number, height: number): string {
    const table = NATIVE_SIZES[model] ?? NATIVE_SIZES[DEFAULT_MODEL];
    const ratio = width / height;
    if (ratio > 1.15) return table.landscape;
    if (ratio < 0.87) return table.portrait;
    return table.square;
  }

  /** Traduce nuestra escala de calidad a la del modelo destino. */
  private mapQuality(model: string, quality: ImageQuality): string {
    if (model.startsWith('dall-e')) {
      return quality === 'high' ? 'hd' : 'standard';
    }
    // gpt-image-1 acepta low | medium | high | auto de forma nativa.
    return quality;
  }

  /** Estima el costo en USD (best-effort). */
  private estimateCost(model: string, quality: ImageQuality): number | undefined {
    const table = COST_TABLE[model];
    if (!table) return undefined;
    const key = model.startsWith('dall-e')
      ? quality === 'high'
        ? 'hd'
        : 'standard'
      : quality;
    return table[key as keyof typeof table] ?? table.auto;
  }

  /** POST con reintentos + backoff exponencial ante 429/5xx/red. */
  private async requestWithRetries(
    body: Record<string, unknown>,
    model: string,
  ): Promise<any> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = Math.min(2 ** attempt * 1000, 16_000);
        this.logger.warn('Reintentando request a OpenAI', {
          provider: this.name,
          model,
          attempt,
          delayMs: delay,
        });
        await sleep(delay);
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const res = await this.fetchImpl(OPENAI_IMAGES_ENDPOINT, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (res.ok) return await res.json();

        const errText = await safeText(res);
        // 4xx (salvo 429) no se reintenta: es un error del request.
        if (res.status !== 429 && res.status < 500) {
          throw new Error(`OpenAI respondió ${res.status}: ${errText}`);
        }
        lastError = new Error(`OpenAI respondió ${res.status}: ${errText}`);
      } catch (err) {
        lastError = err;
        // AbortError o error de red → reintentable.
      } finally {
        clearTimeout(timer);
      }
    }

    this.logger.error('OpenAI falló tras agotar reintentos', {
      provider: this.name,
      model,
      maxRetries: this.maxRetries,
      error: String(lastError),
    });
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  /** Descarga una imagen desde una URL (fallback si el modelo devuelve url). */
  private async downloadImage(url: string): Promise<Buffer> {
    const res = await this.fetchImpl(url);
    if (!res.ok) throw new Error(`No se pudo descargar la imagen: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 500);
  } catch {
    return '(cuerpo ilegible)';
  }
}
