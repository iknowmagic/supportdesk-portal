import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ResetCountdown } from '../ResetCountdown';

describe('ResetCountdown', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows minutes remaining until the next hour', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 10, 30, 15));

    render(<ResetCountdown />);

    const value = screen.getByTestId('reset-countdown');
    expect(value.textContent).toBe('29');
  });
});
