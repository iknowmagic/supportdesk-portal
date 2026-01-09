import { useAtom, useSetAtom } from 'jotai';
import {
  capturingAtom,
  callsAtom,
  addCallAtom,
  clearCallsAtom,
  removeCallAtom,
  startCaptureAtom,
  stopCaptureAtom,
} from './atoms';
import { type RawNetworkCall } from '@/lib/networkCapture';
import type { NetworkCall } from './atoms';

export interface UseNetworkMonitorReturn {
  capturing: boolean;
  calls: NetworkCall[];
  startCapture: () => void;
  stopCapture: () => void;
  clearCalls: () => void;
  removeCall: (id: string) => void;
  addCall: (call: RawNetworkCall) => void;
}

export const useNetworkMonitor = (): UseNetworkMonitorReturn => {
  const [capturing] = useAtom(capturingAtom);
  const [calls] = useAtom(callsAtom);
  
  const addCall = useSetAtom(addCallAtom);
  const clearCalls = useSetAtom(clearCallsAtom);
  const removeCall = useSetAtom(removeCallAtom);
  const startCapture = useSetAtom(startCaptureAtom);
  const stopCapture = useSetAtom(stopCaptureAtom);

  return {
    capturing,
    calls,
    startCapture,
    stopCapture,
    clearCalls,
    removeCall,
    addCall,
  };
};