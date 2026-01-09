import { useAtom, useSetAtom } from 'jotai';
import {
  messagesAtom,
  unreadCountAtom,
  addMessageAtom,
  clearMessagesAtom,
  markAllReadAtom,
  devToolsOpenAtom,
  setDevToolsOpenAtom,
  activeTabAtom,
  setActiveTabAtom,
} from './atoms';
import type { DevMessage, DevToolsTab } from './atoms';

export interface UseDevToolsReturn {
  messages: DevMessage[];
  unreadCount: number;
  addMessage: (message: Omit<DevMessage, 'id' | 'timestamp' | 'read'>) => void;
  clearMessages: () => void;
  markAllRead: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  activeTab: DevToolsTab;
  setActiveTab: (tab: DevToolsTab) => void;
}

export const useDevTools = (): UseDevToolsReturn => {
  const [messages] = useAtom(messagesAtom);
  const [unreadCount] = useAtom(unreadCountAtom);
  const [open] = useAtom(devToolsOpenAtom);
  const [activeTab] = useAtom(activeTabAtom);
  
  const addMessage = useSetAtom(addMessageAtom);
  const clearMessages = useSetAtom(clearMessagesAtom);
  const markAllRead = useSetAtom(markAllReadAtom);
  const setOpen = useSetAtom(setDevToolsOpenAtom);
  const setActiveTab = useSetAtom(setActiveTabAtom);

  return {
    messages,
    unreadCount,
    addMessage,
    clearMessages,
    markAllRead,
    open,
    setOpen,
    activeTab,
    setActiveTab,
  };
};
