import { describe, it, expect } from 'vitest';
import { scrub } from './sentry-scrubber';

describe('scrub', () => {
  it('returns primitives unchanged', () => {
    expect(scrub('hello')).toBe('hello');
    expect(scrub(42)).toBe(42);
    expect(scrub(true)).toBe(true);
    expect(scrub(null)).toBeNull();
    expect(scrub(undefined)).toBeUndefined();
  });

  it('returns empty object unchanged', () => {
    expect(scrub({})).toEqual({});
  });

  it('scrubs known PII keys: email, password, token, cpf, etc.', () => {
    const input = {
      email: 'user@test.com',
      password: 'secret123',
      token: 'jwt-abcd',
      cpf: '12345678900',
      rg: '123456',
      biometria: 'hash-abc',
      biometriahash: 'hash-def',
      fotourl: 'http://img.test/photo.jpg',
      telefone: '11999998888',
      matricula: '2020001',
      secret: 'my-secret',
    };

    const result = scrub(input) as Record<string, unknown>;

    for (const key of Object.keys(input)) {
      expect(result[key]).toBe('[SCRUBBED]');
    }
  });

  it('matches PII keys case-insensitively', () => {
    const input = {
      Email: 'a@b.com',
      PASSWORD: 'pass',
      Token: 'abc',
      CPF: '123',
      Secret: 'xyz',
    };

    const result = scrub(input) as Record<string, unknown>;

    expect(result.Email).toBe('[SCRUBBED]');
    expect(result.PASSWORD).toBe('[SCRUBBED]');
    expect(result.Token).toBe('[SCRUBBED]');
    expect(result.CPF).toBe('[SCRUBBED]');
    expect(result.Secret).toBe('[SCRUBBED]');
  });

  it('preserves non-sensitive keys', () => {
    const input = {
      nome: 'João',
      idade: 25,
      ativo: true,
      email: 'a@b.com',
    };

    const result = scrub(input) as Record<string, unknown>;

    expect(result.nome).toBe('João');
    expect(result.idade).toBe(25);
    expect(result.ativo).toBe(true);
    expect(result.email).toBe('[SCRUBBED]');
  });

  it('scrubs sensitive keys in nested objects', () => {
    const input = {
      user: {
        name: 'Test',
        credentials: {
          password: 'secret',
          token: 'jwt-123',
        },
      },
    };

    const result = scrub(input) as {
      user: Record<string, unknown>;
    };

    expect(result.user.name).toBe('Test');
    expect((result.user.credentials as Record<string, unknown>).password).toBe('[SCRUBBED]');
    expect((result.user.credentials as Record<string, unknown>).token).toBe('[SCRUBBED]');
  });

  it('scrubs sensitive keys inside array items', () => {
    const input = [
      { email: 'a@b.com', name: 'A' },
      { password: 'p', name: 'B' },
      'plain string',
      42,
    ];

    const result = scrub(input) as Array<Record<string, unknown> | string | number>;

    expect((result[0] as Record<string, unknown>).email).toBe('[SCRUBBED]');
    expect((result[0] as Record<string, unknown>).name).toBe('A');
    expect((result[1] as Record<string, unknown>).password).toBe('[SCRUBBED]');
    expect(result[2]).toBe('plain string');
    expect(result[3]).toBe(42);
  });

  it('returns [CIRCULAR] for circular references', () => {
    const obj: Record<string, unknown> = { a: 1 };
    obj.self = obj;

    const result = scrub(obj) as Record<string, unknown>;

    expect(result.a).toBe(1);
    expect(result.self).toBe('[CIRCULAR]');
  });

  it('handles deeply nested circular references', () => {
    const inner: Record<string, unknown> = {};
    const obj = { child: { inner } };
    inner.parent = obj;

    const result = scrub(obj) as { child: { inner: Record<string, unknown> } };

    expect(result.child.inner.parent).toBe('[CIRCULAR]');
  });

  it('handles complex nested structure with arrays and objects', () => {
    const input = {
      logs: [
        {
          event: 'login',
          metadata: {
            email: 'user@test.com',
            ip: '1.2.3.4',
          },
        },
        {
          event: 'update',
          token: 'bearer-abc',
          data: ['safe', { password: 'x' }],
        },
      ],
      count: 2,
    };

    const result = scrub(input) as {
      logs: Array<Record<string, unknown>>;
      count: number;
    };

    expect(result.count).toBe(2);
    const meta = result.logs[0].metadata as Record<string, unknown>;
    expect(meta.email).toBe('[SCRUBBED]');
    expect(meta.ip).toBe('1.2.3.4');
    expect(result.logs[1].token).toBe('[SCRUBBED]');
    const arr = result.logs[1].data as unknown[];
    expect(arr[0]).toBe('safe');
    expect((arr[1] as Record<string, unknown>).password).toBe('[SCRUBBED]');
  });

  it('does not mutate the original object', () => {
    const input = { email: 'a@b.com', name: 'Test' };
    scrub(input);

    expect(input.email).toBe('a@b.com');
    expect(input.name).toBe('Test');
  });

  it('scrubs all keys when every key is sensitive', () => {
    const input = { email: 'a', password: 'b', token: 'c' };
    const result = scrub(input) as Record<string, unknown>;

    expect(result.email).toBe('[SCRUBBED]');
    expect(result.password).toBe('[SCRUBBED]');
    expect(result.token).toBe('[SCRUBBED]');
  });
});
