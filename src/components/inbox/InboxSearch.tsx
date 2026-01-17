import { Button } from '@/components/ui/button';
import { Command, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { listTicketSuggestions } from '@/lib/api/tickets';
import { queryKeys } from '@/lib/queryKeys';
import { cn } from '@/lib/utils';
import { useInboxSearch } from '@/store/inbox/hooks';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const STOP_MOUSE_DOWN: React.MouseEventHandler = (event) => {
  event.preventDefault();
};

const STOP_BUTTON_SELECT: React.PointerEventHandler<HTMLButtonElement> = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

export function InboxSearch() {
  const { draft, history, setDraft, commitSearch, removeHistory } = useInboxSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const normalizedDraft = draft.trim();

  const { data: suggestions = [] } = useQuery({
    queryKey: queryKeys.ticketSuggestions(normalizedDraft),
    queryFn: () => listTicketSuggestions(normalizedDraft),
    enabled: isOpen && normalizedDraft.length > 0,
    retry: false,
  });

  const showHistory = isOpen && normalizedDraft.length === 0 && history.length > 0;
  const showSuggestions = isOpen && normalizedDraft.length > 0 && suggestions.length > 0;
  const activeItems = showSuggestions ? suggestions : showHistory ? history : [];

  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1);
      return;
    }

    if (activeItems.length === 0) {
      setActiveIndex(-1);
      return;
    }

    if (activeIndex >= activeItems.length) {
      setActiveIndex(activeItems.length - 1);
    }
  }, [activeIndex, activeItems.length, isOpen]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    commitSearch();
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleSelectValue = (value: string) => {
    commitSearch(value);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleRemoveHistory = (value: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    removeHistory(value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.currentTarget.blur();
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!isOpen || activeItems.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1 >= activeItems.length ? 0 : prev + 1));
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? activeItems.length - 1 : prev - 1));
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      const selected = activeItems[activeIndex];
      const value = typeof selected === 'string' ? selected : selected.subject;
      handleSelectValue(value);
    }
  };

  const renderHighlightedText = useMemo(
    () => (subject: string, matchStart: number, matchLength: number) => {
      if (matchStart < 0 || matchLength <= 0) {
        return subject;
      }

      const safeStart = Math.min(matchStart, subject.length);
      const safeEnd = Math.min(safeStart + matchLength, subject.length);
      const before = subject.slice(0, safeStart);
      const match = subject.slice(safeStart, safeEnd);
      const after = subject.slice(safeEnd);

      return (
        <>
          {before}
          <strong className="text-foreground font-extrabold">{match}</strong>
          {after}
        </>
      );
    },
    []
  );

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
            onChange={(event) => {
              setDraft(event.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            className="pl-9"
            data-testid="ticket-search-input"
            aria-activedescendant={
              activeIndex >= 0 && (showHistory || showSuggestions) ? `ticket-search-option-${activeIndex}` : undefined
            }
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

      {showHistory && (
        <div className="absolute top-full right-0 left-0 z-30 mt-2" data-testid="ticket-search-history">
          <Command shouldFilter={false} className="rounded-md border shadow-md">
            <CommandList onMouseDown={STOP_MOUSE_DOWN}>
              {history.map((item, index) => (
                <CommandItem
                  key={`${item}-${index}`}
                  value={item}
                  onSelect={() => handleSelectValue(item)}
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

      {showSuggestions && (
        <div className="absolute top-full right-0 left-0 z-30 mt-2" data-testid="ticket-search-suggestions">
          <Command shouldFilter={false} className="rounded-md border shadow-md">
            <CommandList onMouseDown={STOP_MOUSE_DOWN}>
              {suggestions.map((item, index) => (
                <CommandItem
                  key={`${item.subject}-${index}`}
                  value={item.subject}
                  onSelect={() => handleSelectValue(item.subject)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2',
                    activeIndex === index && 'bg-accent text-accent-foreground'
                  )}
                  aria-selected={activeIndex === index}
                  id={`ticket-search-option-${index}`}
                  data-testid={`ticket-search-suggestion-${index}`}
                >
                  <Search className="text-muted-foreground size-4" />
                  <span className="text-foreground truncate font-medium">
                    {renderHighlightedText(item.subject, item.matchStart, item.matchLength)}
                  </span>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
