import noctareLogo from '@/assets/noctare-light.png';
import { Button } from '@/components/ui/button';
import { ResetDemoButton } from '@/components/ResetDemoButton';
import { UserMenu } from '@/components/UserMenu';
import React from 'react';

type LayoutHeaderProps = {
  children?: React.ReactNode;
};

export function LayoutHeader({ children }: LayoutHeaderProps) {
  return (
    <header className="border-light-header-border bg-light-header-bg text-foreground dark:border-dark-header-border dark:bg-dark-header-bg dark:text-foreground flex h-16 items-center justify-between overflow-auto border-b px-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="dark:text-foreground h-9 w-9 rounded-lg" aria-label="App icon">
          <img src={noctareLogo} alt="Noctare" className="h-6 w-6 object-contain dark:invert" />
        </Button>
        <div className="text-foreground dark:text-foreground text-lg font-semibold">{children}</div>
      </div>
      <div className="flex items-center gap-2">
        <div id="header-right-slot" className="flex items-center gap-2">
          <ResetDemoButton />
        </div>
        <UserMenu align="end" side="bottom" />
      </div>
    </header>
  );
}

export default LayoutHeader;
