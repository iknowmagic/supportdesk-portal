import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { listTicketSuggestions, type TicketSuggestion } from '@/lib/api/tickets';
import { queryKeys } from '@/lib/queryKeys';
import { useInboxSearch } from '@/store/inbox/hooks';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { InputSearchHistoryList } from './InputSearchHistoryList';
import { InputSearchSuggestionList } from './InputSearchSuggestionList';

export function InputSearch() {
  const { draft, history, setDraft, commitSearch, applySuggestion, removeHistory } = useInboxSearch();
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
  const activeItems: Array<string | TicketSuggestion> = showSuggestions
    ? suggestions
    : showHistory
      ? history
      : [];

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

  const handleSelectHistory = (value: string) => {
    commitSearch({ value });
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleSelectSuggestion = (item: TicketSuggestion) => {
    applySuggestion({ kind: item.kind, value: item.value });
    setIsOpen(false);
    setActiveIndex(-1);
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
      if (typeof selected === 'string') {
        handleSelectHistory(selected);
      } else {
        handleSelectSuggestion(selected);
      }
    }
  };

  const activeDescendant = useMemo(() => {
    if (activeIndex < 0 || (!showHistory && !showSuggestions)) return undefined;
    return `ticket-search-option-${activeIndex}`;
  }, [activeIndex, showHistory, showSuggestions]);

  return (
    <div className="relative flex-1" data-testid="ticket-search">
      <form className="flex w-full items-center gap-2" onSubmit={handleSubmit}>
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search tickets..."
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            onKeyDown={handleKeyDown}
            className="pl-9"
            data-testid="ticket-search-input"
            aria-activedescendant={activeDescendant}
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
        <InputSearchHistoryList
          items={history}
          activeIndex={activeIndex}
          onSelect={handleSelectHistory}
          onRemove={removeHistory}
        />
      )}

      {showSuggestions && (
        <InputSearchSuggestionList
          items={suggestions}
          activeIndex={activeIndex}
          onSelect={handleSelectSuggestion}
        />
      )}
    </div>
  );
}
