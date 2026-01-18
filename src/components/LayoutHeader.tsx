import imgLogo from '@/assets/inboxhq-logo.png';
import { ResetCountdown } from '@/components/ResetCountdown';
import { ResetDemoButton } from '@/components/ResetDemoButton';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenu } from '@/components/UserMenu';
import { cn } from '@/lib/utils';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Inbox, LayoutDashboard, Menu } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

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
  const [isPinned, setIsPinned] = useState(true);
  const lastScrollYRef = useRef(0);
  const isPinnedRef = useRef(true);

  useEffect(() => {
    isPinnedRef.current = isPinned;
  }, [isPinned]);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY ?? 0;
      const delta = currentY - lastScrollYRef.current;

      if (currentY <= 8) {
        if (!isPinnedRef.current) {
          setIsPinned(true);
        }
        lastScrollYRef.current = currentY;
        return;
      }

      if (delta > 8 && isPinnedRef.current) {
        setIsPinned(false);
      } else if (delta < -8 && !isPinnedRef.current) {
        setIsPinned(true);
      }

      lastScrollYRef.current = currentY;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'border-light-header-border bg-light-header-bg text-foreground dark:border-dark-header-border dark:bg-dark-header-bg dark:text-foreground fixed top-0 right-0 left-0 z-40 mx-auto h-16 w-full max-w-5xl border-b transition-transform duration-200 ease-out lg:border-x',
        isPinned ? 'translate-y-0' : '-translate-y-full'
      )}
      data-pinned={isPinned ? 'true' : 'false'}
    >
      <div className="flex h-full w-full items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Button variant="ghost" size="icon" className="dark:text-foreground h-9 w-9 rounded-lg" aria-label="App icon">
            <img src={imgLogo} alt="Noctare" className="h-6 w-6 object-contain dark:invert" />
          </Button>
          <div className="text-foreground dark:text-foreground truncate text-base font-semibold sm:text-lg">
            {children}
          </div>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const isActive = item.isActive(pathname);
              const Icon = item.icon;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    'relative h-9 gap-2',
                    isActive && 'after:bg-primary after:absolute after:right-2 after:bottom-1 after:left-2 after:h-0.5'
                  )}
                  onClick={() => navigate({ to: item.to })}
                  aria-current={isActive ? 'page' : undefined}
                  data-active={isActive ? 'true' : 'false'}
                  data-testid={`header-nav-${item.id}`}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation menu"
                data-testid="header-nav-menu"
              >
                <Menu className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {NAV_ITEMS.map((item) => {
                const isActive = item.isActive(pathname);
                const Icon = item.icon;

                return (
                  <DropdownMenuItem
                    key={item.id}
                    onSelect={() => navigate({ to: item.to })}
                    className={cn(isActive && 'bg-accent text-accent-foreground font-semibold')}
                    data-testid={`header-nav-menu-${item.id}`}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex shrink-0 items-center gap-2">
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
      </div>
    </header>
  );
}

export default LayoutHeader;
