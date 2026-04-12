/**
 * Utility to scrub PII from Sentry events.
 * Implements case-insensitive matching and circular reference protection.
 */

const sensitiveKeys = [
  'cpf',
  'rg',
  'email',
  'password',
  'biometria',
  'biometriahash',
  'fotourl',
  'telefone',
  'matricula',
  'token',
  'secret',
];

/**
 * Deeply sanitizes an object by replacing sensitive keys with [SCRUBBED].
 */
export const scrub = (obj: unknown, cache = new WeakSet()): unknown => {
  // Specialist Guard: Primitive/Null early exit
  if (!obj || typeof obj !== 'object') return obj;

  // Specialist Guard: Circular reference detection
  if (cache.has(obj)) return '[CIRCULAR]';
  cache.add(obj);

  if (Array.isArray(obj)) {
    return obj.map((item) => scrub(item, cache));
  }

  const newObj = { ...(obj as Record<string, unknown>) };
  for (const key in newObj) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      newObj[key] = '[SCRUBBED]';
    } else {
      newObj[key] = scrub(newObj[key], cache);
    }
  }
  return newObj;
};
