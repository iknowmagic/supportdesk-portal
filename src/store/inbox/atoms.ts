import { atom } from 'jotai';
import { safeLocalStorage } from '@/store/utils/safeLocalStorage';

const STORAGE_KEY = 'inboxhq:search-history';
const MAX_HISTORY = 8;

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
const inboxSearchHistoryAtom = atom<string[]>(loadHistory());

const setInboxSearchDraftAtom = atom(null, (_get, set, value: string) => {
  set(inboxSearchDraftAtom, value);
});

const applyInboxSearchAtom = atom(null, (get, set, value?: string) => {
  const nextValue = (value ?? get(inboxSearchDraftAtom)).trim();
  set(inboxSearchQueryAtom, nextValue);
  set(inboxSearchDraftAtom, nextValue);

  if (!nextValue) return;

  const existing = get(inboxSearchHistoryAtom);
  const nextHistory = [
    nextValue,
    ...existing.filter((item) => item.toLowerCase() !== nextValue.toLowerCase()),
  ].slice(0, MAX_HISTORY);

  set(inboxSearchHistoryAtom, nextHistory);
  saveHistory(nextHistory);
});

const removeInboxSearchHistoryAtom = atom(null, (get, set, value: string) => {
  const existing = get(inboxSearchHistoryAtom);
  const nextHistory = existing.filter((item) => item !== value);
  set(inboxSearchHistoryAtom, nextHistory);
  saveHistory(nextHistory);
});

export {
  inboxSearchDraftAtom,
  inboxSearchQueryAtom,
  inboxSearchHistoryAtom,
  setInboxSearchDraftAtom,
  applyInboxSearchAtom,
  removeInboxSearchHistoryAtom,
};
