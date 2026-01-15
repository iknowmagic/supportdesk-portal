import { Button } from '@/components/ui/button';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Beaker, Inbox, LayoutDashboard } from 'lucide-react';

type NavItem = {
  id: string;
  label: string;
  to: '/' | '/dashboard' | '/components';
  icon: typeof Inbox;
  isActive: (path: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    id: 'inbox',
    label: 'Inbox',
    to: '/',
    icon: Inbox,
    isActive: (path) => path === '/',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
    isActive: (path) => path.startsWith('/dashboard'),
  },
  {
    id: 'components',
    label: 'Components',
    to: '/components',
    icon: Beaker,
    isActive: (path) => path.startsWith('/components'),
  },
];

export function SidebarNav() {
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <nav className="space-y-1" aria-label="Primary">
      {NAV_ITEMS.map((item) => {
        const isActive = item.isActive(pathname);
        const Icon = item.icon;

        return (
          <Button
            key={item.id}
            variant={isActive ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => navigate({ to: item.to })}
            aria-current={isActive ? 'page' : undefined}
            data-testid={`sidebar-nav-${item.id}`}
          >
            <Icon className="mr-2 size-4" />
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
}
