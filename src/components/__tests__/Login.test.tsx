import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LoginPage from '../Login';

vi.mock('@/lib/AuthProvider', () => ({
  useAuth: () => ({
    session: null,
    loading: false,
  }),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

describe('LoginPage', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('prefills demo credentials from VITE env vars', () => {
    vi.stubEnv('VITE_DEMO_USER_EMAIL', 'demo@example.com');
    vi.stubEnv('VITE_DEMO_USER_PASSWORD', 'test-password');

    render(<LoginPage />);

    const emailInput = screen.getByTestId('login-email') as HTMLInputElement;
    const passwordInput = screen.getByTestId('login-password') as HTMLInputElement;

    expect(emailInput.value).toBe('demo@example.com');
    expect(passwordInput.value).toBe('test-password');
  });

  it('leaves inputs empty when env vars are missing', () => {
    vi.stubEnv('VITE_DEMO_USER_EMAIL', '');
    vi.stubEnv('VITE_DEMO_USER_PASSWORD', '');

    render(<LoginPage />);

    const emailInput = screen.getByTestId('login-email') as HTMLInputElement;
    const passwordInput = screen.getByTestId('login-password') as HTMLInputElement;

    expect(emailInput.value).toBe('');
    expect(passwordInput.value).toBe('');
  });

  it('shows an hourly reset countdown message', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 10, 45, 0));

    render(<LoginPage />);

    const message = screen.getByTestId('login-reset-message');
    const countdown = screen.getByTestId('reset-countdown');

    expect(message.textContent).toContain('reset in');
    expect(countdown.textContent).toBe('15');
  });
});
