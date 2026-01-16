import { useAtom, useSetAtom } from 'jotai';
import {
  applyInboxSearchAtom,
  inboxSearchDraftAtom,
  inboxSearchHistoryAtom,
  inboxSearchQueryAtom,
  removeInboxSearchHistoryAtom,
  setInboxSearchDraftAtom,
} from '@/store/inbox/atoms';

export const useInboxSearch = () => {
  const [draft] = useAtom(inboxSearchDraftAtom);
  const [query] = useAtom(inboxSearchQueryAtom);
  const [history] = useAtom(inboxSearchHistoryAtom);

  const setDraft = useSetAtom(setInboxSearchDraftAtom);
  const applySearch = useSetAtom(applyInboxSearchAtom);
  const removeHistory = useSetAtom(removeInboxSearchHistoryAtom);

  return {
    draft,
    query,
    history,
    setDraft,
    applySearch,
    removeHistory,
  };
};
