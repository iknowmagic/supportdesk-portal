import { LayoutHeader } from '@/components/LayoutHeader';
import { SidebarNav } from '@/components/SidebarNav';
import type { ReactNode } from 'react';

type AppShellProps = {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
};

export function AppShell({ children, header, sidebar }: AppShellProps) {
  const headerContent = header ?? <LayoutHeader>InboxHQ</LayoutHeader>;
  const sidebarContent = sidebar ?? <SidebarNav />;

  return (
    <div className="bg-background text-foreground min-h-screen" data-testid="app-shell">
      <div data-testid="app-shell-header">{headerContent}</div>
      <div className="flex min-h-[calc(100vh-4rem)] flex-col md:flex-row">
        <aside
          className="border-border bg-background w-full border-b p-4 md:w-64 md:border-r md:border-b-0"
          data-testid="app-shell-sidebar"
        >
          {sidebarContent}
        </aside>
        <main className="flex-1 p-6" data-testid="app-shell-main">
          {children}
        </main>
      </div>
    </div>
  );
}
