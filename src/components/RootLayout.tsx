import { PageTransition } from '@/components/PageTransition';
import { Outlet, useRouterState } from '@tanstack/react-router';

export function RootLayout() {
  const transitionKey = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <PageTransition transitionKey={transitionKey}>
      <Outlet />
    </PageTransition>
  );
}
