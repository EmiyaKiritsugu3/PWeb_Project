/**
 * Safely extracts message from an unknown error value.
 * Returns 'Erro desconhecido' for non-Error throws.
 */
interface ZodErrorLike {
  name?: string;
  flatten?: () => { fieldErrors: unknown };
}

export function getZodError(error: unknown): { fieldErrors: unknown } | null {
  if (
    error instanceof Error &&
    error.name === 'ZodError' &&
    typeof (error as ZodErrorLike).flatten === 'function'
  ) {
    return (error as ZodErrorLike).flatten!();
  }
  return null;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Erro desconhecido';
}
