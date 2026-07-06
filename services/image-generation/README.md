# Image Generation Service

Motor de generación de imágenes fotorrealistas para el pipeline de contenido de
**Alumfer**. Integra la API de **OpenAI GPT Image** (`gpt-image-1`) detrás de una
interfaz de proveedor intercambiable.

> **Claude no genera imágenes.** Claude actúa como **Director Creativo**: analiza
> el objetivo, escribe el mejor prompt posible y se lo envía a GPT Image. GPT
> Image genera los píxeles; este módulo los guarda y devuelve su metadata, lista
> para Canva / Figma / CapCut.

---

## Flujo

```
Idea de contenido
      ↓  Prompt Builder (Director Creativo)
Prompt cinematográfico
      ↓  OpenAI GPT Image API
Imagen (bytes nativos)
      ↓  resize/crop a tamaño de red exacto (sharp, opcional)
      ↓  guardar en /generated/images/
Metadata (MarketingImageResult)
```

---

## Estructura

```
services/image-generation/
├── src/
│   ├── types.ts                  Contratos e interfaz ImageProvider
│   ├── image-provider.ts         Registro/factory de proveedores
│   ├── openai-image-provider.ts  Implementación OpenAI GPT Image
│   ├── prompt-builder.ts         Idea → prompt cinematográfico de marca
│   ├── image-service.ts          Orquestador (prompt → imagen → disco)
│   ├── logger.ts                 Logging estructurado (JSON)
│   ├── sizes.ts                  Presets de tamaño por formato
│   ├── example.ts                Ejemplo ejecutable
│   └── index.ts                  API pública: generateMarketingImage()
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## Pedir una imagen en 3 pasos

```bash
cd services/image-generation

# 1) Configurar la clave (una sola vez)
cp .env.example .env          # y pegá tu OPENAI_API_KEY dentro

# 2) Instalar dependencias (una sola vez)
npm install

# 3) Pedir la imagen
npm run generate -- "una ventana corrediza premium en un living moderno" \
  --format instagram-feed \
  --mood "atardecer, luz cálida natural"
```

Al terminar imprime la ruta del archivo (en `generated/images/`), el tamaño, el
modelo, el tiempo y el **costo estimado**. Ver todas las opciones con:

```bash
npm run generate -- --help
```

## ¿Es gratis?

**No.** La API de OpenAI GPT Image se cobra por imagen. Necesitás una cuenta de
OpenAI con **billing activado** y una `OPENAI_API_KEY` con crédito. Costo
aproximado por imagen (puede cambiar):

| Calidad         | Costo aprox. |
|-----------------|--------------|
| `low`           | ~US$0.01     |
| `medium`        | ~US$0.04     |
| `high` (default)| ~US$0.17     |

Cada generación reporta su `estimatedCostUsd` en el log y en la salida del CLI.
Para abaratar pruebas, usá `--quality low`.

## Configuración

Copiá `.env.example` a `.env` y completá:

```env
OPENAI_API_KEY=sk-...
OPENAI_IMAGE_MODEL=gpt-image-1
IMAGE_PROVIDER=openai        # opcional
```

Ninguna clave se hardcodea: todo sale del entorno.

Instalación de dependencias de build (y `sharp` opcional para recorte exacto):

```bash
cd services/image-generation
npm install
```

`sharp` es una **peer dependency opcional**. Sin ella el módulo funciona igual,
pero guarda la imagen en su tamaño nativo del modelo (sin recorte al tamaño de
red exacto), avisando por log.

---

## Uso

```ts
import { generateMarketingImage } from './services/image-generation/src/index.js';

const result = await generateMarketingImage({
  objective: 'una ventana corrediza de aluminio premium en un living moderno',
  format: 'instagram-feed',
  setting: 'casa contemporánea en Adrogué, Zona Sur GBA',
  mood: 'atardecer, luz cálida natural',
});

console.log(result);
// {
//   imagePath: 'generated/images/alumfer-instagram-feed-openai-....png',
//   prompt: 'Professional commercial photograph of ...',
//   revisedPrompt: '...',
//   width: 1080, height: 1080,
//   provider: 'openai', model: 'gpt-image-1',
//   format: 'instagram-feed',
//   createdAt: '2026-07-05T...Z',
//   generationTimeMs: 8421,
//   estimatedCostUsd: 0.167
// }
```

Ejemplo ejecutable:

```bash
export OPENAI_API_KEY=sk-...
npm run build && node dist/example.js
```

---

## Tamaños soportados

| Formato              | Tamaño final | Tamaño nativo generado |
|----------------------|--------------|------------------------|
| `instagram-feed`     | 1080×1080    | 1024×1024              |
| `instagram-portrait` | 1080×1350    | 1024×1536              |
| `stories`            | 1080×1920    | 1024×1536              |
| `tiktok`             | 1080×1920    | 1024×1536              |
| `hero-website`       | 1792×1024    | 1536×1024              |

Los modelos generan un set fijo de relaciones de aspecto; el tamaño final exacto
se obtiene por recorte/reescalado con `sharp`.

---

## Calidad visual (built-in en el Prompt Builder)

Todas las imágenes priorizan: *photorealistic, commercial/architectural
photography, luxury, natural lighting, realistic aluminum & glass, magazine
quality, ultra detailed, Buenos Aires residential architecture*.

Y evitan: *cartoon, vector, illustration, CGI evidente, deformaciones, ventanas
torcidas, perspectivas irreales, texto incrustado, watermarks*.

Ver `prompt-builder.ts` → `QUALITY_KEYWORDS` / `NEGATIVE_KEYWORDS`.

---

## Agregar un proveedor nuevo (Flux, Ideogram, SD, Midjourney…)

Todo el sistema depende **solo** de la interfaz `ImageProvider`. Para sumar un
proveedor:

1. Crear `src/flux-image-provider.ts`:

   ```ts
   import type { ImageProvider, ImageGenerationRequest, ImageResult } from './types.js';

   export class FluxImageProvider implements ImageProvider {
     readonly name = 'flux';
     async generateImage(req: ImageGenerationRequest): Promise<ImageResult> {
       // ... llamar a la API de Flux ...
     }
   }
   ```

2. Registrarlo en `index.ts`:

   ```ts
   registerProvider('flux', () => new FluxImageProvider());
   ```

3. Usarlo:

   ```ts
   await generateMarketingImage(idea, { provider: 'flux' });
   ```

Nada más del sistema cambia.

---

## Logging

El logger estructurado (`logger.ts`) registra en JSON:

- prompt enviado (preview) y cantidad de caracteres
- modelo utilizado
- tiempo de generación (ms)
- costo estimado en USD (best-effort)
- reintentos y errores
