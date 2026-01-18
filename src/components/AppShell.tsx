import { LayoutHeader } from '@/components/LayoutHeader';
import type { ReactNode } from 'react';

type AppShellProps = {
  children: ReactNode;
  header?: ReactNode;
};

export function AppShell({ children, header }: AppShellProps) {
  const headerContent = header ?? <LayoutHeader>InboxHQ</LayoutHeader>;

  return (
    <div className="bg-background text-foreground min-h-screen" data-testid="app-shell">
      <div data-testid="app-shell-header">{headerContent}</div>
      <main className="min-h-screen px-4 pt-20 pb-6 sm:px-6" data-testid="app-shell-main">
        {children}
      </main>
    </div>
  );
}
