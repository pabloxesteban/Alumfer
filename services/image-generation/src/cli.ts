/**
 * cli.ts
 * ---------------------------------------------------------------------------
 * Interfaz de línea de comandos para pedir una imagen y obtenerla en un paso.
 *
 * Uso:
 *   node dist/cli.js "una ventana corrediza premium en un living moderno" \
 *     --format instagram-feed \
 *     --setting "casa en Adrogué, Zona Sur GBA" \
 *     --mood "atardecer, luz cálida" \
 *     --quality high
 *
 * La clave se lee de la variable de entorno OPENAI_API_KEY (o de un archivo
 * .env en services/image-generation/, que este CLI carga automáticamente).
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { generateMarketingImage } from './index.js';
import type { ContentIdea, ImageFormat, ImageQuality } from './types.js';

const FORMATS: ImageFormat[] = [
  'instagram-feed',
  'instagram-portrait',
  'stories',
  'tiktok',
  'hero-website',
];

/** Carga un .env simple (KEY=VALUE) si existe, sin pisar variables ya seteadas. */
function loadDotEnv(): void {
  const path = resolve(new URL('../.env', import.meta.url).pathname);
  let content: string;
  try {
    content = readFileSync(path, 'utf8');
  } catch {
    return; // No hay .env: se usan las variables del entorno tal cual.
  }
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    // Saca comillas envolventes si las hay.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

interface ParsedArgs {
  idea: ContentIdea;
  help: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  const positionals: string[] = [];
  const flags: Record<string, string> = {};
  let help = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      help = true;
    } else if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = 'true';
      }
    } else if (arg === '-f') {
      flags.format = argv[++i] ?? '';
    } else {
      positionals.push(arg);
    }
  }

  const objective = positionals.join(' ').trim();
  const format = (flags.format as ImageFormat) || 'instagram-feed';

  if (!help && !objective) {
    throw new Error('Falta la idea de contenido (el primer argumento).');
  }
  if (!help && !FORMATS.includes(format)) {
    throw new Error(`Formato inválido: "${format}". Válidos: ${FORMATS.join(', ')}.`);
  }

  const idea: ContentIdea = {
    objective,
    format,
    setting: flags.setting,
    mood: flags.mood,
    subject: flags.subject,
    quality: flags.quality as ImageQuality | undefined,
    extraDetails: flags.details ? flags.details.split(';').map((s) => s.trim()) : undefined,
  };

  return { idea, help };
}

function printHelp(): void {
  console.log(`
Alumfer · Generador de imágenes (OpenAI GPT Image)

Uso:
  node dist/cli.js "<idea de contenido>" [opciones]

Opciones:
  --format, -f   Formato: ${FORMATS.join(' | ')}   (default: instagram-feed)
  --setting      Contexto arquitectónico. Ej: "casa en Adrogué, Zona Sur GBA"
  --mood         Ambiente. Ej: "atardecer, luz cálida natural"
  --subject      Sujeto principal explícito (si difiere de la idea)
  --quality      low | medium | high | auto   (default: high)
  --details      Detalles extra separados por ";"
  --help, -h     Muestra esta ayuda

Requisitos:
  OPENAI_API_KEY definida en el entorno o en services/image-generation/.env

Ejemplo:
  node dist/cli.js "una ventana corrediza premium en un living moderno" \\
    --format instagram-feed --mood "atardecer, luz cálida"
`);
}

async function main(): Promise<void> {
  loadDotEnv();
  const { idea, help } = parseArgs(process.argv.slice(2));

  if (help) {
    printHelp();
    return;
  }

  console.log('🎬 Director Creativo: construyendo el prompt y pidiendo la imagen…\n');
  const result = await generateMarketingImage(idea);

  console.log('\n✅ Imagen lista:\n');
  console.log(`   Archivo:  ${result.imagePath}`);
  console.log(`   Tamaño:   ${result.width}x${result.height} (${result.format})`);
  console.log(`   Modelo:   ${result.provider}/${result.model}`);
  console.log(`   Tiempo:   ${(result.generationTimeMs / 1000).toFixed(1)}s`);
  if (result.estimatedCostUsd !== undefined) {
    console.log(`   Costo≈:   US$${result.estimatedCostUsd}`);
  }
  console.log(`\n   Prompt enviado:\n   ${result.prompt}\n`);
}

main().catch((err) => {
  console.error('\n❌ Error:', err instanceof Error ? err.message : String(err));
  console.error('\nProbá "node dist/cli.js --help" para ver el uso.');
  process.exit(1);
});
