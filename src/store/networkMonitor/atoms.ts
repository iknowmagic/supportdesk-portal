import { atom } from 'jotai';
import { 
  initNetworkCapture, 
  setNetworkCaptureHandler, 
  type RawNetworkCall 
} from '@/lib/networkCapture';

export interface NetworkCall extends RawNetworkCall {
  id: string;
}

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// Base atoms
const capturingAtom = atom(false);
const callsAtom = atom<NetworkCall[]>([]);

// Actions
const addCallAtom = atom(
  null,
  (get, set, call: RawNetworkCall) => {
    if (!get(capturingAtom)) return;

    const entry: NetworkCall = {
      ...call,
      id: createId(),
    };

    const calls = [entry, ...get(callsAtom)].slice(0, 200);
    set(callsAtom, calls);
  }
);

const clearCallsAtom = atom(
  null,
  (_get, set) => {
    set(callsAtom, []);
  }
);

const removeCallAtom = atom(
  null,
  (get, set, id: string) => {
    const calls = get(callsAtom).filter((call) => call.id !== id);
    set(callsAtom, calls);
  }
);

const startCaptureAtom = atom(
  null,
  (get, set) => {
    if (get(capturingAtom)) return;
    if (typeof window === 'undefined') return;
    
    initNetworkCapture();
    setNetworkCaptureHandler((entry) => {
      // Access the store state to call addCall
      const currentCalls = get(callsAtom);
      const capturing = get(capturingAtom);
      
      if (capturing) {
        const newEntry: NetworkCall = {
          ...entry,
          id: createId(),
        };
        const updatedCalls = [newEntry, ...currentCalls].slice(0, 200);
        set(callsAtom, updatedCalls);
      }
    });
    set(capturingAtom, true);
  }
);

const stopCaptureAtom = atom(
  null,
  (get, set) => {
    if (!get(capturingAtom)) return;
    setNetworkCaptureHandler(null);
    set(capturingAtom, false);
  }
);

export {
  capturingAtom,
  callsAtom,
  addCallAtom,
  clearCallsAtom,
  removeCallAtom,
  startCaptureAtom,
  stopCaptureAtom,
};