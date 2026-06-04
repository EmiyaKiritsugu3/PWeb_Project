import { describe, it, expect } from 'vitest';
import { handleActionError } from '../error';

describe('handleActionError', () => {
  it('returns zodMessage option when error is ZodError', () => {
    const zodErr = new Error('validation failed');
    zodErr.name = 'ZodError';
    Object.defineProperty(zodErr, 'flatten', {
      value: () => ({ fieldErrors: { nome: ['Required'] } }),
    });

    const result = handleActionError(zodErr, { zodMessage: 'Dados inválidos' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Dados inválidos');
  });

  it('returns fallbackMessage for generic errors', () => {
    const result = handleActionError(new Error('internal error'), {
      fallbackMessage: 'Erro ao salvar. Tente novamente.',
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro ao salvar. Tente novamente.');
  });

  it('backward compatible: string second arg treated as fallbackMessage', () => {
    const result = handleActionError(new Error('x'), 'Mensagem customizada');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Mensagem customizada');
  });

  it('returns default messages when no options provided', () => {
    const zodErr = new Error('x');
    zodErr.name = 'ZodError';
    Object.defineProperty(zodErr, 'flatten', {
      value: () => ({ fieldErrors: {} }),
    });

    const zodResult = handleActionError(zodErr);
    expect(zodResult.error).toBe('Dados inválidos');

    const genericResult = handleActionError(new Error('erro'));
    expect(genericResult.error).toBe('erro');
  });
});
