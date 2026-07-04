import { describe, it, expect } from 'vitest';

describe('NaN guard patterns', () => {
  it('Number.isFinite catches NaN from empty string parseInt', () => {
    const parsed = parseInt('', 10);
    expect(Number.isFinite(parsed)).toBe(false);
  });

  it('Number.isFinite passes for valid number parseInt', () => {
    const parsed = parseInt('3', 10);
    expect(Number.isFinite(parsed)).toBe(true);
  });

  it('NaN passes through nullish coalescing (NaN ?? 0 === NaN)', () => {
    const nan = NaN;
    const result = nan ?? 0;
    expect(Number.isFinite(result)).toBe(false);
  });

  it('|| catches NaN (falsy) where ?? does not', () => {
    const nan = NaN;
    expect(nan || 0).toBe(0);
    expect(nan ?? 0).toBe(NaN); // NaN passes through ??
  });

  it('empty string becomes undefined with ||, not empty string', () => {
    const empty = '';
    expect(empty || undefined).toBeUndefined();
    expect(empty ?? undefined).toBe(''); // '' passes through ??
  });

  it('Number.isFinite returns false for parseInt of non-numeric string', () => {
    const parsed = parseInt('abc', 10);
    expect(Number.isFinite(parsed)).toBe(false);
  });

  it('parseInt with radix 10 works correctly', () => {
    expect(parseInt('10', 10)).toBe(10);
    expect(parseInt('08', 10)).toBe(8);
  });
});
