/**
 * midjourney-image-provider.ts
 * ---------------------------------------------------------------------------
 * Implementación de `ImageProvider` sobre un BRIDGE no oficial de MidJourney.
 *
 * ⚠️  IMPORTANTE — LEER ANTES DE USAR
 *     MidJourney NO tiene API oficial. Este proveedor habla con un servicio
 *     "bridge" de terceros (ImaginePro, GoAPI, apiframe, useapi, LinkrAPI…)
 *     que automatiza una cuenta de MidJourney/Discord. Esto:
 *       - Puede violar los Términos de Servicio de MidJourney (riesgo de BAN).
 *       - Suele costar aparte de tu suscripción.
 *       - Es frágil: si el bridge cambia su API, hay que reajustar la config.
 *     Úsalo bajo tu propio criterio y riesgo.
 *
 * Cómo funciona el flujo típico de estos bridges (asíncrono):
 *   1. POST /imagine  con el prompt  → devuelve un messageId.
 *   2. Polling GET /fetch/{messageId} hasta que status === 'DONE'.
 *   3. La respuesta trae la(s) URL(s) de la imagen (grilla 2x2 o imágenes
 *      individuales ya separadas).
 *   4. Se descarga la imagen y se entrega como Buffer (el ImageService la
 *      reescala al tamaño de red exacto, igual que con OpenAI).
 *
 * Todo es CONFIGURABLE por variables de entorno para adaptarse a distintos
 * bridges sin tocar código. Los defaults apuntan a la forma de ImaginePro.
 */

import type {
  ImageGenerationRequest,
  ImageProvider,
  ImageResult,
  Logger,
} from './types.js';
import { defaultLogger } from './logger.js';

/** Relaciones de aspecto soportadas por MidJourney (`--ar`). */
const ASPECT_RATIOS: { ar: string; ratio: number }[] = [
  { ar: '1:1', ratio: 1 },
  { ar: '4:5', ratio: 0.8 },
  { ar: '9:16', ratio: 0.5625 },
  { ar: '2:3', ratio: 0.6667 },
  { ar: '3:2', ratio: 1.5 },
  { ar: '16:9', ratio: 1.7778 },
];

export interface MidjourneyProviderOptions {
  /** API key del bridge. Por defecto `process.env.MIDJOURNEY_API_KEY`. */
  apiKey?: string;
  /** Base URL del bridge. Por defecto `MIDJOURNEY_API_URL` o ImaginePro. */
  baseUrl?: string;
  /** Path del endpoint imagine. Por defecto `MIDJOURNEY_IMAGINE_PATH`. */
  imaginePath?: string;
  /**
   * Path del endpoint de fetch/status. Debe incluir `{id}` como placeholder
   * del messageId. Por defecto `MIDJOURNEY_FETCH_PATH`.
   */
  fetchPath?: string;
  /** Milisegundos entre polls. Por defecto 5000. */
  pollIntervalMs?: number;
  /** Timeout total de la generación en ms. Por defecto 300000 (5 min). */
  timeoutMs?: number;
  /** Reintentos ante errores transitorios al enviar el imagine. Default 3. */
  maxRetries?: number;
  /** Costo estimado por imagen en USD (informativo). `MIDJOURNEY_COST_USD`. */
  costPerImageUsd?: number;
  /** Logger inyectable. */
  logger?: Logger;
  /** Override de `fetch` (para tests). */
  fetchImpl?: typeof fetch;
}

export class MidjourneyImageProvider implements ImageProvider {
  readonly name = 'midjourney';

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly imaginePath: string;
  private readonly fetchPath: string;
  private readonly pollIntervalMs: number;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly costPerImageUsd?: number;
  private readonly logger: Logger;
  private readonly fetchImpl: typeof fetch;

  constructor(options: MidjourneyProviderOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.MIDJOURNEY_API_KEY ?? '';
    this.baseUrl = (
      options.baseUrl ??
      process.env.MIDJOURNEY_API_URL ??
      'https://api.imaginepro.ai'
    ).replace(/\/+$/, '');
    this.imaginePath =
      options.imaginePath ?? process.env.MIDJOURNEY_IMAGINE_PATH ?? '/api/v1/nova/imagine';
    this.fetchPath =
      options.fetchPath ??
      process.env.MIDJOURNEY_FETCH_PATH ??
      '/api/v1/message/fetch/{id}';
    this.pollIntervalMs =
      options.pollIntervalMs ?? numEnv('MIDJOURNEY_POLL_INTERVAL_MS', 5000);
    this.timeoutMs = options.timeoutMs ?? numEnv('MIDJOURNEY_TIMEOUT_MS', 300_000);
    this.maxRetries = options.maxRetries ?? 3;
    this.costPerImageUsd =
      options.costPerImageUsd ?? optNumEnv('MIDJOURNEY_COST_USD');
    this.logger = options.logger ?? defaultLogger;
    this.fetchImpl = options.fetchImpl ?? fetch;

    if (!this.apiKey) {
      throw new Error(
        'MIDJOURNEY_API_KEY no está configurada. Definí la clave de tu bridge de MidJourney en el entorno (.env).',
      );
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageResult> {
    const ar = pickAspectRatio(request.size.width, request.size.height);
    const prompt = this.composePrompt(request, ar);

    this.logger.info('Enviando prompt a MidJourney (bridge)', {
      provider: this.name,
      baseUrl: this.baseUrl,
      aspectRatio: ar,
      promptChars: prompt.length,
      promptPreview: prompt.slice(0, 240),
    });

    const started = Date.now();

    // 1) Enviar imagine y obtener el messageId (con reintentos).
    const messageId = await this.submitImagine(prompt);

    // 2) Poll hasta DONE.
    const done = await this.pollUntilDone(messageId, started);

    // 3) Elegir la URL de imagen (individual si el bridge la separó; si no, la grilla).
    const imageUrl = pickImageUrl(done);
    if (!imageUrl) {
      throw new Error('El bridge de MidJourney no devolvió ninguna URL de imagen.');
    }

    // 4) Descargar la imagen.
    const image = await this.download(imageUrl);
    const generationTimeMs = Date.now() - started;

    this.logger.info('Imagen generada por MidJourney (bridge)', {
      provider: this.name,
      messageId,
      generationTimeMs,
      estimatedCostUsd: this.costPerImageUsd,
      imageUrl,
    });

    return {
      image,
      fileExtension: guessExtension(imageUrl),
      // MidJourney no expone las dimensiones exactas; el ImageService reescala
      // al tamaño de red. Reportamos el tamaño solicitado como referencia.
      width: request.size.width,
      height: request.size.height,
      model: 'midjourney',
      provider: this.name,
      revisedPrompt: prompt,
      generationTimeMs,
      estimatedCostUsd: this.costPerImageUsd,
    };
  }

  // ── Internos ─────────────────────────────────────────────────────────────

  /** Arma el prompt final con parámetros nativos de MidJourney (--ar, --no). */
  private composePrompt(request: ImageGenerationRequest, ar: string): string {
    let prompt = request.prompt.trim();
    // MidJourney maneja negativos con `--no`, no con prosa.
    const negatives = (request.negativePrompt ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .join(', ');
    prompt += ` --ar ${ar}`;
    if (negatives) prompt += ` --no ${negatives}`;
    return prompt;
  }

  /** POST al endpoint imagine; devuelve el messageId. Reintenta transitorios. */
  private async submitImagine(prompt: string): Promise<string> {
    const url = `${this.baseUrl}${this.imaginePath}`;
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = Math.min(2 ** attempt * 1000, 16_000);
        this.logger.warn('Reintentando imagine a MidJourney', {
          provider: this.name,
          attempt,
          delayMs: delay,
        });
        await sleep(delay);
      }
      try {
        const res = await this.fetchImpl(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, ref: `alumfer-${Date.now()}` }),
        });
        if (!res.ok) {
          const body = await safeText(res);
          if (res.status !== 429 && res.status < 500) {
            throw new Error(`Bridge respondió ${res.status}: ${body}`);
          }
          lastError = new Error(`Bridge respondió ${res.status}: ${body}`);
          continue;
        }
        const json: any = await res.json();
        const messageId = json.messageId ?? json.message_id ?? json.task_id ?? json.id;
        if (!messageId) {
          throw new Error(
            `La respuesta del imagine no trae messageId. Ajustá el mapeo para tu bridge. Respuesta: ${JSON.stringify(
              json,
            ).slice(0, 300)}`,
          );
        }
        this.logger.info('MidJourney aceptó el imagine', {
          provider: this.name,
          messageId,
        });
        return String(messageId);
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  /** Poll del endpoint de fetch hasta status DONE (o timeout). */
  private async pollUntilDone(messageId: string, started: number): Promise<any> {
    const url = `${this.baseUrl}${this.fetchPath.replace('{id}', encodeURIComponent(messageId))}`;

    while (Date.now() - started < this.timeoutMs) {
      await sleep(this.pollIntervalMs);
      let json: any;
      try {
        const res = await this.fetchImpl(url, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        });
        if (!res.ok) {
          this.logger.warn('Fetch de estado devolvió error; reintentando', {
            provider: this.name,
            status: res.status,
          });
          continue;
        }
        json = await res.json();
      } catch (err) {
        this.logger.warn('Error transitorio en el polling; reintentando', {
          provider: this.name,
          error: String(err),
        });
        continue;
      }

      const status = String(json.status ?? '').toUpperCase();
      const progress = json.progress ?? '';
      this.logger.info('Estado de MidJourney', {
        provider: this.name,
        messageId,
        status,
        progress,
      });

      if (status === 'DONE' || status === 'COMPLETED' || status === 'SUCCESS') {
        return json;
      }
      if (status === 'FAIL' || status === 'FAILED' || status === 'ERROR') {
        throw new Error(
          `MidJourney falló la generación: ${json.error ?? json.failReason ?? 'sin detalle'}`,
        );
      }
      // Cualquier otro estado (PROCESSING, IN_PROGRESS, QUEUED…) → seguir esperando.
    }

    throw new Error(
      `Timeout esperando a MidJourney (${this.timeoutMs} ms). El bridge puede estar lento o saturado.`,
    );
  }

  /** Descarga la imagen final desde su URL. */
  private async download(url: string): Promise<Buffer> {
    const res = await this.fetchImpl(url);
    if (!res.ok) throw new Error(`No se pudo descargar la imagen (${res.status}): ${url}`);
    return Buffer.from(await res.arrayBuffer());
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────

/** Elige la relación de aspecto de MidJourney más cercana a las dimensiones. */
function pickAspectRatio(width: number, height: number): string {
  const target = width / height;
  let best = ASPECT_RATIOS[0];
  let bestDiff = Infinity;
  for (const candidate of ASPECT_RATIOS) {
    const diff = Math.abs(candidate.ratio - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = candidate;
    }
  }
  return best.ar;
}

/**
 * Extrae la URL de imagen de la respuesta del bridge. Prioriza imágenes
 * individuales (ya separadas de la grilla 2x2); si no hay, usa la grilla.
 */
function pickImageUrl(response: any): string | undefined {
  const images = response.images ?? response.image_urls ?? response.imageUrls;
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    return typeof first === 'string' ? first : first?.url;
  }
  return response.uri ?? response.imageUrl ?? response.image_url ?? response.url;
}

/** Deduce la extensión del archivo a partir de la URL. */
function guessExtension(url: string): string {
  const match = /\.(png|jpe?g|webp)(?:$|\?)/i.exec(url);
  return match ? match[1].toLowerCase().replace('jpeg', 'jpg') : 'png';
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

function numEnv(key: string, fallback: number): number {
  const raw = process.env[key];
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function optNumEnv(key: string): number | undefined {
  const raw = process.env[key];
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}
