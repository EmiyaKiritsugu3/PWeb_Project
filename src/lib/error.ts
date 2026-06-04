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

/**
 * Safely extracts message from an unknown error value.
 * Returns 'Erro desconhecido' for non-Error throws.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Erro desconhecido';
}

export type HandleActionErrorOptions = {
  fallbackMessage?: string;
  zodMessage?: string;
};

export function handleActionError(
  error: unknown,
  options?: HandleActionErrorOptions | string
): { success: false; error: string } {
  const opts: HandleActionErrorOptions =
    typeof options === 'string' ? { fallbackMessage: options } : (options ?? {});

  if (error instanceof Error && error.name === 'ZodError') {
    const zodMessage = getZodError(error)
      ? (opts.zodMessage ?? 'Dados inválidos')
      : 'Dados inválidos';
    return { success: false as const, error: zodMessage };
  }
  return { success: false as const, error: opts.fallbackMessage ?? getErrorMessage(error) };
}
