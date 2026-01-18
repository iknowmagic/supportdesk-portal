import { Button } from '@/components/ui/button';
import { Command, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const STOP_MOUSE_DOWN: React.MouseEventHandler = (event) => {
  event.preventDefault();
};

const STOP_BUTTON_SELECT: React.PointerEventHandler<HTMLButtonElement> = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

type InputSearchHistoryListProps = {
  items: string[];
  activeIndex: number;
  onSelect: (value: string) => void;
  onRemove: (value: string) => void;
};

export function InputSearchHistoryList({ items, activeIndex, onSelect, onRemove }: InputSearchHistoryListProps) {
  return (
    <div className="absolute top-full right-0 left-0 z-30 mt-2" data-testid="ticket-search-history">
      <Command shouldFilter={false} className="rounded-md border shadow-md">
        <CommandList onMouseDown={STOP_MOUSE_DOWN}>
          {items.map((item, index) => (
            <CommandItem
              key={`${item}-${index}`}
              value={item}
              onSelect={() => onSelect(item)}
              onClick={() => onSelect(item)}
              className={cn(
                'flex cursor-pointer items-center justify-between',
                activeIndex === index && 'bg-accent text-accent-foreground'
              )}
              aria-selected={activeIndex === index}
              id={`ticket-search-option-${index}`}
              data-testid={`ticket-search-history-item-${index}`}
            >
              <span className="text-foreground truncate font-medium">{item}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onPointerDownCapture={STOP_BUTTON_SELECT}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onRemove(item);
                }}
                aria-label={`Remove ${item}`}
                data-testid={`ticket-search-history-remove-${index}`}
              >
                <X className="size-4" />
              </Button>
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  );
}
