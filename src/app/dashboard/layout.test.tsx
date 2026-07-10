import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import DashboardLayout from './layout';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: vi.fn() }),
  redirect: vi.fn(),
}));

Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock('@/utils/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({
        data: { user: { id: 'x', email: 'a@b.c', user_metadata: {} } },
        error: null,
      }),
    },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }),
  }),
}));

describe('DashboardLayout', () => {
  it('renders exactly one <main> landmark', async () => {
    const LayoutContent = await DashboardLayout({ children: <div>child</div> });
    const { container } = render(LayoutContent);
    expect(container.querySelectorAll('main')).toHaveLength(1);
  });
});
