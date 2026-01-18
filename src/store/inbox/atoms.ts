import { atom } from 'jotai';
import { safeLocalStorage } from '@/store/utils/safeLocalStorage';

export type InboxSearchField = 'all' | 'title' | 'description';
export type InboxSearchStatus = 'all' | 'open' | 'pending' | 'closed';
export type InboxSearchPriority = 'all' | 'low' | 'normal' | 'high' | 'urgent';
export type InboxSearchSuggestionKind = 'title' | 'description' | 'assignee' | 'status' | 'priority';

const STORAGE_KEY = 'inboxhq:search-history';
const MAX_HISTORY = 5;

const loadHistory = () => {
  const stored = safeLocalStorage.getItem(STORAGE_KEY);
  if (!stored) return [] as string[];

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [] as string[];

    return parsed.filter((item) => typeof item === 'string').slice(0, MAX_HISTORY);
  } catch {
    return [] as string[];
  }
};

const saveHistory = (items: string[]) => {
  safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
};

const inboxSearchDraftAtom = atom('');
const inboxSearchQueryAtom = atom('');
const inboxSearchFieldAtom = atom<InboxSearchField>('all');
const inboxAssigneeFilterAtom = atom('');
const inboxStatusFilterAtom = atom<InboxSearchStatus>('all');
const inboxPriorityFilterAtom = atom<InboxSearchPriority>('all');
const inboxSearchPendingHistoryAtom = atom('');
const inboxSearchHistoryAtom = atom<string[]>(loadHistory());

const setInboxSearchDraftAtom = atom(null, (_get, set, value: string) => {
  set(inboxSearchDraftAtom, value);
});

const commitInboxSearchAtom = atom(
  null,
  (get, set, payload?: { value?: string; field?: InboxSearchField }) => {
    const nextValue = (payload?.value ?? get(inboxSearchDraftAtom)).trim();
    const nextField = payload?.field ?? 'all';

    set(inboxSearchQueryAtom, nextValue);
    set(inboxSearchDraftAtom, nextValue);
    set(inboxSearchFieldAtom, nextField);
    set(inboxAssigneeFilterAtom, '');
    set(inboxPriorityFilterAtom, 'all');
    if (nextValue) {
      set(inboxSearchPendingHistoryAtom, nextValue);
    }
  }
);

const applyInboxSearchSuggestionAtom = atom(
  null,
  (_get, set, payload: { kind: InboxSearchSuggestionKind; value: string }) => {
    const displayValue = payload.value.trim();
    if (!displayValue) return;

    set(inboxSearchDraftAtom, displayValue);
    set(inboxSearchPendingHistoryAtom, displayValue);

    if (payload.kind === 'title' || payload.kind === 'description') {
      set(inboxSearchQueryAtom, displayValue);
      set(inboxSearchFieldAtom, payload.kind === 'title' ? 'title' : 'description');
      set(inboxAssigneeFilterAtom, '');
      set(inboxPriorityFilterAtom, 'all');
      return;
    }

    set(inboxSearchQueryAtom, '');
    set(inboxSearchFieldAtom, 'all');

    if (payload.kind === 'assignee') {
      set(inboxAssigneeFilterAtom, displayValue);
      set(inboxPriorityFilterAtom, 'all');
      return;
    }

    if (payload.kind === 'status') {
      set(inboxStatusFilterAtom, displayValue.toLowerCase() as InboxSearchStatus);
      return;
    }

    if (payload.kind === 'priority') {
      set(inboxPriorityFilterAtom, displayValue.toLowerCase() as InboxSearchPriority);
      set(inboxAssigneeFilterAtom, '');
    }
  }
);

const addInboxSearchHistoryAtom = atom(null, (get, set, value: string) => {
  const nextValue = value.trim();
  if (!nextValue) return;

  const existing = get(inboxSearchHistoryAtom);
  const nextHistory = [
    nextValue,
    ...existing.filter((item) => item.toLowerCase() !== nextValue.toLowerCase()),
  ].slice(0, MAX_HISTORY);

  const isSameLength = nextHistory.length === existing.length;
  const isSameOrder = isSameLength && nextHistory.every((item, index) => item === existing[index]);
  if (isSameOrder) return;

  set(inboxSearchHistoryAtom, nextHistory);
  saveHistory(nextHistory);
});

const removeInboxSearchHistoryAtom = atom(null, (get, set, value: string) => {
  const existing = get(inboxSearchHistoryAtom);
  const nextHistory = existing.filter((item) => item !== value);
  set(inboxSearchHistoryAtom, nextHistory);
  saveHistory(nextHistory);
});

const setInboxSearchFieldAtom = atom(null, (_get, set, value: InboxSearchField) => {
  set(inboxSearchFieldAtom, value);
});

const setInboxAssigneeFilterAtom = atom(null, (_get, set, value: string) => {
  set(inboxAssigneeFilterAtom, value.trim());
});

const setInboxStatusFilterAtom = atom(null, (_get, set, value: InboxSearchStatus | string) => {
  const normalized = value.toString().trim().toLowerCase();
  if (['open', 'pending', 'closed', 'all'].includes(normalized)) {
    set(inboxStatusFilterAtom, normalized as InboxSearchStatus);
  }
});

const setInboxPriorityFilterAtom = atom(null, (_get, set, value: InboxSearchPriority | string) => {
  const normalized = value.toString().trim().toLowerCase();
  if (['low', 'normal', 'high', 'urgent', 'all'].includes(normalized)) {
    set(inboxPriorityFilterAtom, normalized as InboxSearchPriority);
  }
});

const clearInboxSearchPendingHistoryAtom = atom(null, (_get, set) => {
  set(inboxSearchPendingHistoryAtom, '');
});

export {
  inboxSearchDraftAtom,
  inboxSearchQueryAtom,
  inboxSearchFieldAtom,
  inboxAssigneeFilterAtom,
  inboxStatusFilterAtom,
  inboxPriorityFilterAtom,
  inboxSearchPendingHistoryAtom,
  inboxSearchHistoryAtom,
  setInboxSearchDraftAtom,
  commitInboxSearchAtom,
  applyInboxSearchSuggestionAtom,
  addInboxSearchHistoryAtom,
  removeInboxSearchHistoryAtom,
  setInboxSearchFieldAtom,
  setInboxAssigneeFilterAtom,
  setInboxStatusFilterAtom,
  setInboxPriorityFilterAtom,
  clearInboxSearchPendingHistoryAtom,
};
