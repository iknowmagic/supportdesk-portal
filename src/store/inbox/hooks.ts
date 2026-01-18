import { useAtom, useSetAtom } from 'jotai';
import {
  addInboxSearchHistoryAtom,
  applyInboxSearchSuggestionAtom,
  clearInboxSearchPendingHistoryAtom,
  commitInboxSearchAtom,
  inboxAssigneeFilterAtom,
  inboxSearchDraftAtom,
  inboxSearchFieldAtom,
  inboxSearchHistoryAtom,
  inboxSearchPendingHistoryAtom,
  inboxPriorityFilterAtom,
  inboxSearchQueryAtom,
  inboxStatusFilterAtom,
  removeInboxSearchHistoryAtom,
  setInboxAssigneeFilterAtom,
  setInboxPriorityFilterAtom,
  setInboxSearchDraftAtom,
  setInboxSearchFieldAtom,
  setInboxStatusFilterAtom,
} from '@/store/inbox/atoms';

export const useInboxSearch = () => {
  const [draft] = useAtom(inboxSearchDraftAtom);
  const [query] = useAtom(inboxSearchQueryAtom);
  const [field] = useAtom(inboxSearchFieldAtom);
  const [assigneeFilter] = useAtom(inboxAssigneeFilterAtom);
  const [statusFilter] = useAtom(inboxStatusFilterAtom);
  const [priorityFilter] = useAtom(inboxPriorityFilterAtom);
  const [pendingHistoryEntry] = useAtom(inboxSearchPendingHistoryAtom);
  const [history] = useAtom(inboxSearchHistoryAtom);

  const setDraft = useSetAtom(setInboxSearchDraftAtom);
  const commitSearch = useSetAtom(commitInboxSearchAtom);
  const addHistory = useSetAtom(addInboxSearchHistoryAtom);
  const applySuggestion = useSetAtom(applyInboxSearchSuggestionAtom);
  const removeHistory = useSetAtom(removeInboxSearchHistoryAtom);
  const setField = useSetAtom(setInboxSearchFieldAtom);
  const setAssigneeFilter = useSetAtom(setInboxAssigneeFilterAtom);
  const setStatusFilter = useSetAtom(setInboxStatusFilterAtom);
  const setPriorityFilter = useSetAtom(setInboxPriorityFilterAtom);
  const clearPendingHistoryEntry = useSetAtom(clearInboxSearchPendingHistoryAtom);

  return {
    draft,
    query,
    field,
    assigneeFilter,
    statusFilter,
    priorityFilter,
    pendingHistoryEntry,
    history,
    setDraft,
    commitSearch,
    addHistory,
    applySuggestion,
    removeHistory,
    setField,
    setAssigneeFilter,
    setStatusFilter,
    setPriorityFilter,
    clearPendingHistoryEntry,
  };
};
