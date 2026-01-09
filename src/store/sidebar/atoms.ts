import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { SidebarMode } from "./types";

// Create an atom with storage persistence for the sidebar state
const isOpenAtom = atomWithStorage<boolean>("sidebarOpen", false);

// Create an atom with storage persistence for sidebar mode (collapsed, expand-on-hover, expanded)
const sidebarModeAtom = atomWithStorage<SidebarMode>(
  "sidebarMode",
  "collapsed",
);

// Action to set the sidebar open state
const setOpenAtom = atom(
  null,
  (_get, set, open: boolean) => {
    set(isOpenAtom, open);
  },
);

// Action to set sidebar mode
const setSidebarModeAtom = atom(
  null,
  (_get, set, mode: SidebarMode) => {
    set(sidebarModeAtom, mode);
  },
);

export { isOpenAtom, setOpenAtom, setSidebarModeAtom, sidebarModeAtom };
