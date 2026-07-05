/**
 * logger.ts
 * ---------------------------------------------------------------------------
 * Logger estructurado mínimo, sin dependencias. Emite JSON por consola para
 * que sea fácil de parsear en cualquier pipeline. Inyectable: cualquier objeto
 * que cumpla la interfaz `Logger` puede reemplazarlo.
 */

import type { Logger } from './types.js';

type Level = 'info' | 'warn' | 'error';

function emit(level: Level, message: string, meta?: Record<string, unknown>): void {
  const record = {
    ts: new Date().toISOString(),
    level,
    scope: 'image-generation',
    message,
    ...(meta ?? {}),
  };
  const line = JSON.stringify(record);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

/** Logger por defecto: escribe JSON estructurado en stdout/stderr. */
export const defaultLogger: Logger = {
  info: (message, meta) => emit('info', message, meta),
  warn: (message, meta) => emit('warn', message, meta),
  error: (message, meta) => emit('error', message, meta),
};

/** Logger silencioso, útil para tests. */
export const silentLogger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
};
