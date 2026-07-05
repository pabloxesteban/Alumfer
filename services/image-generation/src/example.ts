/**
 * example.ts
 * ---------------------------------------------------------------------------
 * Ejemplo ejecutable del flujo completo. Requiere OPENAI_API_KEY en el entorno.
 *
 *   export OPENAI_API_KEY=sk-...
 *   npm run build && node dist/example.js
 *   # o, sin build (Node 22+):  node --experimental-strip-types src/example.ts
 *
 * Genera una imagen a partir de una idea de contenido y muestra la metadata.
 */

import { generateMarketingImage } from './index.js';

async function main(): Promise<void> {
  const result = await generateMarketingImage({
    objective: 'una ventana corrediza de aluminio premium en un living moderno',
    format: 'instagram-feed',
    setting: 'casa contemporánea en Adrogué, Zona Sur GBA',
    mood: 'atardecer, luz cálida natural entrando por el vidrio',
    extraDetails: ['vista a un patio con deck de madera', 'perfil de aluminio negro mate'],
  });

  console.log('\n✅ Imagen generada:\n');
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error('\n❌ Falló la generación:', err);
  process.exit(1);
});
