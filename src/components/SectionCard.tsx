import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  wrapperClassName?: string;
  error?: boolean;
  errorText?: string;
}

export function SectionCard({ children, className, wrapperClassName, error, errorText }: SectionCardProps) {
  return (
    <div className={cn('space-y-1', wrapperClassName)}>
      {error && errorText ? <p className="text-destructive dark:text-destructive text-xs font-medium">{errorText}</p> : null}
      <div className={cn('bg-light-sectioncard-bg-muted dark:bg-dark-sectioncard-bg-muted space-y-3 rounded-md border border-border dark:border-border p-3 text-foreground dark:text-foreground', error && 'border-destructive', className)}>
        {children}
      </div>
    </div>
  );
}
