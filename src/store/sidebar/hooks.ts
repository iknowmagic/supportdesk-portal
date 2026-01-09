import { useAtom, useSetAtom } from "jotai";
import {
  isOpenAtom,
  setOpenAtom,
  setSidebarModeAtom,
  sidebarModeAtom,
} from "./atoms";
import type { SidebarMode } from "./types";

export interface UseSidebarReturn {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  mode: SidebarMode;
  setMode: (mode: SidebarMode) => void;
}

export const useSidebar = (): UseSidebarReturn => {
  const [isOpen] = useAtom(isOpenAtom);
  const setOpen = useSetAtom(setOpenAtom);
  const [mode] = useAtom(sidebarModeAtom);
  const setMode = useSetAtom(setSidebarModeAtom);

  return {
    isOpen,
    setOpen,
    mode,
    setMode,
  };
};
