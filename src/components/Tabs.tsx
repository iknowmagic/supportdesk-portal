import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

import { cn } from '@/lib/utils';

export function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root className={cn('flex flex-col gap-4', className)} {...props} />;
}

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'border-border bg-background text-foreground dark:border-border dark:bg-background flex w-full border-b',
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <div className="relative">
      <TabsPrimitive.Trigger
        className={cn(
          'border-border bg-muted/20 text-muted-foreground relative -mb-px inline-flex items-center gap-2 border px-4 py-2 text-sm font-medium transition',
          '-ml-px first:ml-0',
          'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border-b-background',
          'dark:bg-card/40 dark:data-[state=active]:border-b-background dark:data-[state=active]:bg-background',
          'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          'disabled:pointer-events-none disabled:opacity-50',
          'before-content-[""] before:absolute before:-top-1 before:-left-px before:block before:w-[calc(100%+2px)] data-[state=active]:before:border-2',
          className
        )}
        {...props}
      />
    </div>
  );
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('outline-none', className)} {...props} />;
}
