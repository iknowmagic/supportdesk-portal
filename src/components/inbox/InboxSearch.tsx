import {
  Command,
  CommandList,
  CommandItem,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useInboxSearch } from '@/store/inbox/hooks';
import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

const STOP_MOUSE_DOWN: React.MouseEventHandler = (event) => {
  event.preventDefault();
};

const STOP_BUTTON_SELECT: React.PointerEventHandler<HTMLButtonElement> = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

export function InboxSearch() {
  const { draft, history, setDraft, applySearch, removeHistory } = useInboxSearch();
  const [isOpen, setIsOpen] = useState(false);

  const normalizedDraft = draft.trim();

  const visibleHistory = useMemo(() => {
    if (normalizedDraft.length === 0) return history;

    return history.filter((item) => item.toLowerCase().includes(normalizedDraft.toLowerCase()));
  }, [history, normalizedDraft]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applySearch();
    setIsOpen(false);
  };

  const handleSelectHistory = (value: string) => {
    applySearch(value);
    setIsOpen(false);
  };

  const handleRemoveHistory = (value: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    removeHistory(value);
  };

  return (
    <div className="relative flex-1" data-testid="ticket-search">
      <form
        className="flex w-full items-center gap-2"
        onSubmit={handleSubmit}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search tickets..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="pl-9"
            data-testid="ticket-search-input"
          />
        </div>
        <Button
          type="submit"
          variant="secondary"
          className="h-10 px-4"
          aria-label="Search tickets"
          data-testid="ticket-search-submit"
        >
          <Search className="size-4" />
        </Button>
      </form>

      {isOpen && visibleHistory.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2" data-testid="ticket-search-history">
          <Command shouldFilter={false} className="rounded-md border shadow-md">
            <CommandList onMouseDown={STOP_MOUSE_DOWN}>
              {visibleHistory.map((item, index) => (
                <CommandItem
                  key={`${item}-${index}`}
                  value={item}
                  onSelect={() => handleSelectHistory(item)}
                  className="flex items-center justify-between"
                  data-testid={`ticket-search-history-item-${index}`}
                >
                  <span className="truncate font-medium text-foreground">{item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onPointerDownCapture={STOP_BUTTON_SELECT}
                      onClick={(event) => handleRemoveHistory(item, event)}
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
      )}
    </div>
  );
}
