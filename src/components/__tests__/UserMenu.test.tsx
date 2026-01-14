import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UserMenu } from '../UserMenu';

const mockNavigate = vi.fn();
const mockLogout = vi.fn().mockResolvedValue(true);

vi.mock('@/hooks/useSupabaseLogout', () => ({
  useSupabaseLogout: () => ({
    logout: mockLogout,
    isLoggingOut: false,
  }),
}));

vi.mock('@/lib/AuthProvider', () => ({
  useAuth: () => ({
    user: {
      email: 'demo@example.com',
      user_metadata: {
        full_name: 'Demo User',
      },
    },
  }),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

describe('UserMenu', () => {
  it('redirects to login after logout', async () => {
    render(<UserMenu />);

    const user = userEvent.setup();
    await user.click(screen.getByTestId('user-menu-trigger'));

    const logoutItem = await screen.findByTestId('user-menu-logout');
    await user.click(logoutItem);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' });
    });
  });
});
