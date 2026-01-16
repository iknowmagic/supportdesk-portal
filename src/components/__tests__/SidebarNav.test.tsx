import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SidebarNav } from '../SidebarNav';

let currentPath = '/inbox';
const navigateMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
  useRouterState: ({ select }: { select: (state: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: currentPath } }),
}));

describe('SidebarNav', () => {
  it('highlights the active route', () => {
    currentPath = '/inbox';

    render(<SidebarNav />);

    expect(screen.getByTestId('sidebar-nav-inbox').getAttribute('aria-current')).toBe('page');
    expect(screen.getByTestId('sidebar-nav-dashboard').getAttribute('aria-current')).toBe(null);
    expect(screen.getByTestId('sidebar-nav-components').getAttribute('aria-current')).toBe(null);
  });

  it('navigates when a nav item is clicked', async () => {
    currentPath = '/inbox';
    navigateMock.mockClear();
    const user = userEvent.setup();

    render(<SidebarNav />);

    await user.click(screen.getByTestId('sidebar-nav-dashboard'));
    expect(navigateMock).toHaveBeenCalledWith({ to: '/dashboard' });
  });
});
