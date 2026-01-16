import { atom } from "jotai";

const isNewTicketModalOpenAtom = atom(false);

const setNewTicketModalOpenAtom = atom(
  null,
  (_get, set, open: boolean) => {
    set(isNewTicketModalOpenAtom, open);
  },
);

export { isNewTicketModalOpenAtom, setNewTicketModalOpenAtom };
