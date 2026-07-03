import { describe, it, expect } from 'vitest';
import { getZodError, getErrorMessage, handleActionError } from './error';

describe('getZodError', () => {
  it('returns null for non-Error input', () => {
    expect(getZodError('string')).toBeNull();
  });

  it('returns null for Error without ZodError name', () => {
    expect(getZodError(new Error('regular'))).toBeNull();
  });

  it('returns null for ZodError without flatten function', () => {
    const e = new Error('zod');
    e.name = 'ZodError';
    expect(getZodError(e)).toBeNull();
  });

  it('returns flattened errors for valid ZodError', () => {
    const e = new Error('zod');
    e.name = 'ZodError';
    (e as { flatten?: () => { fieldErrors: unknown } }).flatten = () => ({
      fieldErrors: { name: ['Required'] },
    });
    const result = getZodError(e);
    expect(result).toEqual({ fieldErrors: { name: ['Required'] } });
  });
});

describe('getErrorMessage', () => {
  it('returns message for Error instance', () => {
    expect(getErrorMessage(new Error('test error'))).toBe('test error');
  });

  it('returns the string itself for string input', () => {
    expect(getErrorMessage('erro string')).toBe('erro string');
  });

  it('returns default for unknown input', () => {
    expect(getErrorMessage(42)).toBe('Erro desconhecido');
    expect(getErrorMessage(null)).toBe('Erro desconhecido');
  });
});

describe('handleActionError', () => {
  it('handles regular Error', () => {
    const result = handleActionError(new Error('msg'));
    expect(result).toEqual({ success: false, error: 'msg' });
  });

  it('handles string options', () => {
    const result = handleActionError(new Error('msg'), 'fallback');
    expect(result).toEqual({ success: false, error: 'fallback' });
  });

  it('handles ZodError with getZodError returning data', () => {
    const e = new Error('zod');
    e.name = 'ZodError';
    (e as { flatten?: () => { fieldErrors: unknown } }).flatten = () => ({
      fieldErrors: { name: ['Required'] },
    });
    const result = handleActionError(e, { zodMessage: 'Campos inválidos' });
    expect(result).toEqual({ success: false, error: 'Campos inválidos' });
  });

  it('handles ZodError with getZodError null and no zodMessage', () => {
    const e = new Error('zod');
    e.name = 'ZodError';
    const result = handleActionError(e);
    expect(result).toEqual({ success: false, error: 'Dados inválidos' });
  });

  it('handles Error with fallbackMessage', () => {
    const result = handleActionError(new Error('msg'), { fallbackMessage: 'fb' });
    expect(result).toEqual({ success: false, error: 'fb' });
  });

  it('returns default for unknown input', () => {
    const result = handleActionError(null);
    expect(result).toEqual({ success: false, error: 'Erro desconhecido' });
  });
});
