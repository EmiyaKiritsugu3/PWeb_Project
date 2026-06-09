import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { I18nProvider, useI18n } from './i18n-provider';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

function TestConsumer() {
  const { language, setLanguage, t } = useI18n();
  return (
    <div>
      <span data-testid="language">{language}</span>
      <span data-testid="welcome">{t('common.welcome')}</span>
      <span data-testid="with-param">{t('dashboard.streak', { count: 5 })}</span>
      <span data-testid="missing">{t('nonexistent.key')}</span>
      <button onClick={() => setLanguage('en')}>Switch to EN</button>
      <button onClick={() => setLanguage('pt')}>Switch to PT</button>
    </div>
  );
}

describe('I18nProvider', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('defaults to Portuguese', async () => {
    await act(async () => {
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
    });
    expect(screen.getByTestId('language').textContent).toBe('pt');
  });

  it('translates common.welcome in Portuguese', async () => {
    await act(async () => {
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
    });
    expect(screen.getByTestId('welcome').textContent).toBeTruthy();
  });

  it('handles parameter interpolation', async () => {
    await act(async () => {
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
    });
    expect(screen.getByTestId('with-param').textContent).toContain('5');
  });

  it('returns path when key is missing', async () => {
    await act(async () => {
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
    });
    expect(screen.getByTestId('missing').textContent).toBe('nonexistent.key');
  });

  it('switches language on setLanguage call', async () => {
    await act(async () => {
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
    });
    await act(async () => {
      screen.getByText('Switch to EN').click();
    });
    expect(screen.getByTestId('language').textContent).toBe('en');
  });

  it('persists language to localStorage', async () => {
    await act(async () => {
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
    });
    await act(async () => {
      screen.getByText('Switch to EN').click();
    });
    expect(localStorageMock.getItem('app-language')).toBe('en');
  });
});

describe('useI18n', () => {
  it('throws when used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function BadConsumer() {
      useI18n();
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow('useI18n must be used within an I18nProvider');
    spy.mockRestore();
  });
});
