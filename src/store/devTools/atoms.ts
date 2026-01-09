import { atom } from 'jotai';

export type DevMessageLevel = 'info' | 'warn' | 'error';

export interface DevMessage {
  id: string;
  level: DevMessageLevel;
  message: string;
  timestamp: string;
  details?: unknown;
  read: boolean;
}

export type DevToolsTab = 'tasks' | 'stores' | 'messages' | 'network';

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// Base atoms
const messagesAtom = atom<DevMessage[]>([]);
const unreadCountAtom = atom(0);
const devToolsOpenAtom = atom(false);
const activeTabAtom = atom<DevToolsTab>('tasks');

// Derived atom to calculate unread count
const unreadCountDerivedAtom = atom((_get) => {
  return _get(messagesAtom).filter((msg) => !msg.read).length;
});

// Actions
const addMessageAtom = atom(
  null,
  (get, set, messageData: Omit<DevMessage, 'id' | 'timestamp' | 'read'>) => {
    const nextMessage: DevMessage = {
      id: createId(),
      level: messageData.level,
      message: messageData.message,
      details: messageData.details,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    // Add new message to the beginning of the array and limit to 200 messages
    const messages = [nextMessage, ...get(messagesAtom)].slice(0, 200);
    
    set(messagesAtom, messages);
    set(unreadCountAtom, messages.filter((msg) => !msg.read).length);
  }
);

const clearMessagesAtom = atom(
  null,
  (_get, set) => {
    set(messagesAtom, []);
    set(unreadCountAtom, 0);
  }
);

const markAllReadAtom = atom(
  null,
  (get, set) => {
    const messages = get(messagesAtom).map((msg) => ({ ...msg, read: true }));
    set(messagesAtom, messages);
    set(unreadCountAtom, 0);
  }
);

const setDevToolsOpenAtom = atom(
  null,
  (_get, set, open: boolean) => {
    set(devToolsOpenAtom, open);
  }
);

const setActiveTabAtom = atom(
  null,
  (_get, set, tab: DevToolsTab) => {
    set(activeTabAtom, tab);
  }
);

export {
  messagesAtom,
  unreadCountAtom,
  unreadCountDerivedAtom,
  devToolsOpenAtom,
  activeTabAtom,
  addMessageAtom,
  clearMessagesAtom,
  markAllReadAtom,
  setDevToolsOpenAtom,
  setActiveTabAtom,
};
