import type { DevMessageLevel } from '@/store/devTools/atoms';

interface LogOptions {
  level?: DevMessageLevel;
  details?: unknown;
}

function log(message: string, options?: LogOptions): void;
function log(message: string, details: unknown): void;
function log(message: string, ...rest: unknown[]): void {
  let level: DevMessageLevel = 'info';
  let details: unknown = undefined;

  if (rest.length === 0) {
    // No additional args
    details = undefined;
  } else if (rest.length === 1) {
    const arg = rest[0];
    if (typeof arg === 'object' && arg !== null && !Array.isArray(arg) &&
        ('level' in arg || 'details' in arg)) {
      // It's the LogOptions object
      const options = arg as LogOptions;
      level = options.level ?? 'info';
      details = options.details;
    } else {
      // It's just details
      details = arg;
    }
  } else if (rest.length === 2 &&
             typeof rest[1] === 'object' &&
             rest[1] !== null &&
             !Array.isArray(rest[1]) &&
             ('level' in rest[1] || 'details' in rest[1])) {
    // Second arg is options object, first arg is additional details
    const options = rest[1] as LogOptions;
    level = options.level ?? 'info';
    details = [rest[0], options.details].filter(d => d !== undefined);
  } else {
    // Multiple arguments, treat as details array
    details = rest;
  }

  // Note: For Jotai implementation, we would need to implement an alternative
  // mechanism to access the devTools store from non-React contexts.
  // This requires creating an imperative API which is more complex.
  // For now, we'll rely on the fallback console logging.

  if (!import.meta.env.DEV) {
    return;
  }

  const prefix = `[Noctare:${level.toUpperCase()}]`;
  // eslint-disable-next-line no-console
  console.log(prefix, message, details);
}

export const noctare = {
  log,
  error: (message: string, details?: unknown) => log(message, { level: 'error', details }),
};
