import { useAtom, useSetAtom } from "jotai";
import { isNewTicketModalOpenAtom, setNewTicketModalOpenAtom } from "./atoms";

export interface UseNewTicketModalReturn {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export const useNewTicketModal = (): UseNewTicketModalReturn => {
  const [isOpen] = useAtom(isNewTicketModalOpenAtom);
  const setOpen = useSetAtom(setNewTicketModalOpenAtom);

  return {
    isOpen,
    setOpen,
  };
};
