import imgLogo from '@/assets/inboxhq-logo.png';
import { ResetCountdown } from '@/components/ResetCountdown';
import { ResetDemoButton } from '@/components/ResetDemoButton';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/UserMenu';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Inbox, LayoutDashboard } from 'lucide-react';
import React from 'react';

type LayoutHeaderProps = {
  children?: React.ReactNode;
};

type NavItem = {
  id: 'inbox' | 'dashboard';
  label: string;
  to: '/inbox' | '/dashboard';
  icon: typeof Inbox;
  isActive: (path: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    id: 'inbox',
    label: 'Inbox',
    to: '/inbox',
    icon: Inbox,
    isActive: (path) => path === '/inbox' || path === '/',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
    isActive: (path) => path.startsWith('/dashboard'),
  },
];

export function LayoutHeader({ children }: LayoutHeaderProps) {
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <header className="border-light-header-border bg-light-header-bg text-foreground dark:border-dark-header-border dark:bg-dark-header-bg dark:text-foreground flex h-16 items-center justify-between overflow-auto border-b px-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="dark:text-foreground h-9 w-9 rounded-lg" aria-label="App icon">
          <img src={imgLogo} alt="Noctare" className="h-6 w-6 object-contain dark:invert" />
        </Button>
        <div className="text-foreground dark:text-foreground text-lg font-semibold">{children}</div>
        <nav className="flex items-center gap-1" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const isActive = item.isActive(pathname);
            const Icon = item.icon;

            return (
              <Button
                key={item.id}
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                className="h-9 gap-2"
                onClick={() => navigate({ to: item.to })}
                aria-current={isActive ? 'page' : undefined}
                data-testid={`header-nav-${item.id}`}
              >
                <Icon className="size-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <div id="header-right-slot" className="flex items-center gap-2">
          <div
            className="text-muted-foreground hidden items-center gap-1 text-xs font-medium tabular-nums sm:flex"
            data-testid="header-reset-countdown"
          >
            <span>Reset in</span>
            <ResetCountdown />
          </div>
          <ResetDemoButton />
        </div>
        <UserMenu align="end" side="bottom" />
      </div>
    </header>
  );
}

export default LayoutHeader;
