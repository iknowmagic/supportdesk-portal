import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';

loadEnv({ path: resolve(process.cwd(), '.env') });

let currentPath = '/inbox';
const navigateMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
  useRouterState: ({ select }: { select: (state: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: currentPath } }),
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('LayoutHeader', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders the reset countdown before the reset button', async () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      throw new Error('Missing Supabase env vars for LayoutHeader tests');
    }

    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', supabaseUrl);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', anonKey);

    const [{ LayoutHeader }, { AuthProvider }] = await Promise.all([
      import('../LayoutHeader'),
      import('../../lib/AuthProvider'),
    ]);

    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });

    render(
      <AuthProvider>
        <LayoutHeader>InboxHQ</LayoutHeader>
      </AuthProvider>,
      { wrapper: createWrapper(queryClient) }
    );

    const countdown = await screen.findByTestId('header-reset-countdown');
    const resetButton = screen.getByTestId('reset-demo-button');

    expect(countdown.textContent).toContain('Reset in');
    expect(countdown.compareDocumentPosition(resetButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('highlights the active route and navigates from the header', async () => {
    currentPath = '/inbox';
    navigateMock.mockClear();

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      throw new Error('Missing Supabase env vars for LayoutHeader tests');
    }

    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', supabaseUrl);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', anonKey);

    const [{ LayoutHeader }, { AuthProvider }] = await Promise.all([
      import('../LayoutHeader'),
      import('../../lib/AuthProvider'),
    ]);

    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });

    render(
      <AuthProvider>
        <LayoutHeader>InboxHQ</LayoutHeader>
      </AuthProvider>,
      { wrapper: createWrapper(queryClient) }
    );

    const inboxNav = await screen.findByTestId('header-nav-inbox');
    const header = inboxNav.closest('header');
    const dashboardNav = screen.getByTestId('header-nav-dashboard');
    const mobileMenu = screen.getByTestId('header-nav-menu');

    expect(header?.className).toContain('fixed');
    expect(header?.className).toContain('max-w-5xl');
    expect(mobileMenu.className).toContain('md:hidden');
    expect(inboxNav.getAttribute('aria-current')).toBe('page');
    expect(dashboardNav.getAttribute('aria-current')).toBe(null);
    expect(inboxNav.className).toContain('after:bg-primary');

    const user = userEvent.setup();
    await user.click(dashboardNav);
    expect(navigateMock).toHaveBeenCalledWith({ to: '/dashboard' });
  });
});
