/**
 * image-provider.ts
 * ---------------------------------------------------------------------------
 * Capa de abstracción de proveedores. Define el contrato `ImageProvider`
 * (re-exportado desde `types`) y un REGISTRO/FACTORY que permite elegir el
 * proveedor en runtime por su nombre.
 *
 * Agregar un proveedor nuevo (Flux, Ideogram, Stable Diffusion, Midjourney…)
 * se reduce a:
 *   1. Crear `flux-image-provider.ts` implementando `ImageProvider`.
 *   2. Registrarlo con `registerProvider('flux', () => new FluxImageProvider())`.
 * El `ImageService` y el resto del sistema no se enteran del cambio.
 */

import type { ImageProvider } from './types.js';

export type { ImageProvider } from './types.js';

/** Fábrica perezosa de un proveedor (se instancia solo cuando se usa). */
export type ProviderFactory = () => ImageProvider;

const registry = new Map<string, ProviderFactory>();

/**
 * Registra (o reemplaza) la fábrica de un proveedor bajo un nombre estable.
 * @param name  Identificador, ej: 'openai', 'flux'.
 * @param factory  Función que devuelve una instancia del proveedor.
 */
export function registerProvider(name: string, factory: ProviderFactory): void {
  registry.set(name.toLowerCase(), factory);
}

/** Devuelve los nombres de todos los proveedores registrados. */
export function listProviders(): string[] {
  return [...registry.keys()];
}

/**
 * Resuelve un proveedor por nombre. Lanza un error claro si no existe.
 * @param name  Identificador del proveedor. Por defecto 'openai'.
 */
export function resolveProvider(name = 'openai'): ImageProvider {
  const factory = registry.get(name.toLowerCase());
  if (!factory) {
    const available = listProviders().join(', ') || '(ninguno registrado)';
    throw new Error(
      `Proveedor de imágenes desconocido: "${name}". Disponibles: ${available}.`,
    );
  }
  return factory();
}
