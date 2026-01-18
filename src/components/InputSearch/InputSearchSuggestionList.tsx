import { Command, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { renderHighlightedText } from './InputSearchHighlight';
import type { TicketSuggestion } from '@/lib/api/tickets';

const STOP_MOUSE_DOWN: React.MouseEventHandler = (event) => {
  event.preventDefault();
};

const SUGGESTION_LABELS: Record<TicketSuggestion['kind'], string> = {
  title: 'Title',
  description: 'Description',
  assignee: 'Assignee',
  status: 'Status',
  priority: 'Priority',
};

type InputSearchSuggestionListProps = {
  items: TicketSuggestion[];
  activeIndex: number;
  onSelect: (item: TicketSuggestion) => void;
};

export function InputSearchSuggestionList({
  items,
  activeIndex,
  onSelect,
}: InputSearchSuggestionListProps) {
  return (
    <div className="absolute top-full right-0 left-0 z-30 mt-2" data-testid="ticket-search-suggestions">
      <Command shouldFilter={false} className="rounded-md border shadow-md">
        <CommandList onMouseDown={STOP_MOUSE_DOWN}>
          {items.map((item, index) => (
            <CommandItem
              key={`${item.kind}-${item.value}-${index}`}
              value={item.value}
              onSelect={() => onSelect(item)}
              onClick={() => onSelect(item)}
              className={cn(
                'flex cursor-pointer items-center gap-2',
                activeIndex === index && 'bg-accent text-accent-foreground'
              )}
              aria-selected={activeIndex === index}
              id={`ticket-search-option-${index}`}
              data-testid={`ticket-search-suggestion-${index}`}
            >
              <Search className="text-muted-foreground size-4" />
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                {SUGGESTION_LABELS[item.kind]}:
              </span>
              <span className="text-foreground truncate font-medium">
                {renderHighlightedText(item.value, item.matchStart, item.matchLength)}
              </span>
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  );
}
