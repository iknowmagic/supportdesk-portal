import { useAtom, useSetAtom } from 'jotai';
import {
  addInboxSearchHistoryAtom,
  commitInboxSearchAtom,
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
  const commitSearch = useSetAtom(commitInboxSearchAtom);
  const addHistory = useSetAtom(addInboxSearchHistoryAtom);
  const removeHistory = useSetAtom(removeInboxSearchHistoryAtom);

  return {
    draft,
    query,
    history,
    setDraft,
    commitSearch,
    addHistory,
    removeHistory,
  };
};
