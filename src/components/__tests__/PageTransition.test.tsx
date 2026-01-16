import { PageTransition } from '@/components/PageTransition';
import { render, screen } from '@testing-library/react';

describe('PageTransition', () => {
  it('exposes the provided transition key for route-aware animations', () => {
    render(
      <PageTransition transitionKey="tickets">
        <div>Content</div>
      </PageTransition>,
    );

    const container = screen.getByTestId('page-transition');
    expect(container.getAttribute('data-transition-key')).toBe('tickets');
    expect(screen.getByText('Content')).toBeTruthy();
  });
});
