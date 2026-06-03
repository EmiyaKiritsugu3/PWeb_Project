/**
 * Safely extracts message from an unknown error value.
 * Returns 'Erro desconhecido' for non-Error throws.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Erro desconhecido';
}
