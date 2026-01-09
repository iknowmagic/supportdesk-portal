'use client';

import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type ComboboxOption = {
  value: string;
  label: string;
  /**
   * Optional label used in the closed trigger
   * when this option is selected.
   * Falls back to `label` if not provided.
   */
  selectionLabel?: string;
};

type ComboboxProps = {
  items: ComboboxOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
};

const stopWheelPropagation: React.WheelEventHandler<HTMLDivElement> = (event) => {
  event.stopPropagation();
};

const stopTouchPropagation: React.TouchEventHandler<HTMLDivElement> = (event) => {
  event.stopPropagation();
};

export default function Combobox({
  items,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedItem = items.find((item) => item.value === value) || null;
  const triggerLabel = selectedItem?.selectionLabel || selectedItem?.label || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between text-foreground dark:text-foreground', className)}
        >
          <span className={cn('truncate text-foreground dark:text-foreground', !selectedItem && 'text-muted-foreground dark:text-muted-foreground')}>{triggerLabel}</span>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 dark:bg-card dark:text-foreground">
        <Command onWheel={stopWheelPropagation} onTouchMove={stopTouchPropagation}>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-64 overflow-y-auto">
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.label}
                  onSelect={() => {
                    const nextValue = item.value === value ? null : item.value;
                    onChange(nextValue);
                    setOpen(false);
                  }}
                >
                  <CheckIcon className={cn('mr-2 h-4 w-4', value === item.value ? 'opacity-100' : 'opacity-0')} />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
