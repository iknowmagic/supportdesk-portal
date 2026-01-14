import { PageTransition } from '@/components/PageTransition';
import { redirectIfAuthenticated, requireAuth } from '@/lib/authGuard';
import ComponentsShowcasePage from '@/pages/ComponentsShowcase';
import DashboardPage from '@/pages/Dashboard';
import InboxPage from '@/pages/Inbox';
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

const inboxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: requireAuth,
  component: InboxPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: requireAuth,
  component: DashboardPage,
});

const componentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/components',
  beforeLoad: requireAuth,
  component: ComponentsShowcasePage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: redirectIfAuthenticated,
  component: LoginPage,
});

const verifyOtpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login/verify',
  beforeLoad: redirectIfAuthenticated,
  component: VerifyOtpPage,
});

const routeTree = rootRoute.addChildren([inboxRoute, dashboardRoute, componentsRoute, loginRoute, verifyOtpRoute]);

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
