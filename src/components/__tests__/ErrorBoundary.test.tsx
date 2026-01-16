import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorBoundary } from '../ErrorBoundary';

describe('ErrorBoundary', () => {
  it('renders fallback UI when a child throws', () => {
    const Broken = () => {
      throw new Error('Boom');
    };

    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-boundary')).toBeTruthy();
    expect(screen.getByTestId('error-boundary-retry')).toBeTruthy();
  });
});
