import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell } from '../AppShell';

describe('AppShell', () => {
  it('renders the header, sidebar, and main slots', () => {
    render(
      <AppShell
        header={<div data-testid="custom-header">Header</div>}
        sidebar={<div data-testid="custom-sidebar">Nav</div>}
      >
        <div data-testid="custom-main">Content</div>
      </AppShell>
    );

    expect(screen.getByTestId('app-shell')).toBeTruthy();
    const headerSlot = screen.getByTestId('app-shell-header');
    const sidebarSlot = screen.getByTestId('app-shell-sidebar');
    const mainSlot = screen.getByTestId('app-shell-main');

    expect(headerSlot.contains(screen.getByTestId('custom-header'))).toBe(true);
    expect(sidebarSlot.contains(screen.getByTestId('custom-sidebar'))).toBe(true);
    expect(mainSlot.contains(screen.getByTestId('custom-main'))).toBe(true);
  });
});
