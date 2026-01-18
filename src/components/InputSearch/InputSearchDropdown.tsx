import { Command, CommandList } from '@/components/ui/command';
import type { ReactNode } from 'react';

const STOP_MOUSE_DOWN: React.MouseEventHandler = (event) => {
  event.preventDefault();
};

type InputSearchDropdownProps = {
  testId: string;
  children: ReactNode;
};

export function InputSearchDropdown({ testId, children }: InputSearchDropdownProps) {
  return (
    <div className="absolute top-full right-0 left-0 z-30 mt-2" data-testid={testId}>
      <Command shouldFilter={false} className="rounded-md border shadow-md">
        <CommandList onMouseDown={STOP_MOUSE_DOWN}>{children}</CommandList>
      </Command>
    </div>
  );
}
