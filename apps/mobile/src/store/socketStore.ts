import {create} from 'zustand';

interface SocketStore {
  connected: boolean;
  lastPing: number | null;
  setConnected: (v: boolean) => void;
  setLastPing: (ts: number) => void;
}

export const useSocketStore = create<SocketStore>(set => ({
  connected: false,
  lastPing: null,
  setConnected: v => set({connected: v}),
  setLastPing: ts => set({lastPing: ts}),
}));
