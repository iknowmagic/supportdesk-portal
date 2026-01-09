import { PageTransition } from '@/components/PageTransition';
import ComponentsShowcasePage from '@/pages/ComponentsShowcase';
import DashboardPage from '@/pages/Dashboard';
import type { Session } from '@supabase/supabase-js';
import { Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import LoginPage from './components/Login.tsx';
import VerifyOtpPage from './components/VerifyOtp.tsx';

const rootRoute = createRootRoute({
  component: () => (
    <PageTransition>
      <Outlet />
    </PageTransition>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const componentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/components',
  component: ComponentsShowcasePage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const verifyOtpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login/verify',
  component: VerifyOtpPage,
});

const routeTree = rootRoute.addChildren([dashboardRoute, componentsRoute, loginRoute, verifyOtpRoute]);

const router = createRouter({
  routeTree,
  context: {
    auth: {
      session: null as Session | null,
      loading: true,
    },
  },
});

export { router };
