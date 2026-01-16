import { RootLayout } from '@/components/RootLayout';
import { redirectIfAuthenticated, requireAuth } from '@/lib/authGuard';
import ComponentsShowcasePage from '@/pages/ComponentsShowcase';
import DashboardPage from '@/pages/Dashboard';
import InboxPage from '@/pages/Inbox';
import TicketDetailPage from '@/pages/TicketDetail';
import type { Session } from '@supabase/supabase-js';
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';
import LoginPage from './components/Login.tsx';
import VerifyOtpPage from './components/VerifyOtp.tsx';

type RouterContext = {
  auth: {
    session: Session | null;
    loading: boolean;
  };
};

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: (opts) => {
    requireAuth(opts);
    throw redirect({ to: '/inbox' });
  },
});

const inboxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inbox',
  beforeLoad: requireAuth,
  component: InboxPage,
});

const ticketDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tickets/$ticketId',
  beforeLoad: requireAuth,
  component: TicketDetailPage,
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

const routeTree = rootRoute.addChildren([
  homeRoute,
  inboxRoute,
  ticketDetailRoute,
  dashboardRoute,
  componentsRoute,
  loginRoute,
  verifyOtpRoute,
]);

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
