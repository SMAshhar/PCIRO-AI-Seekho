import {create} from 'zustand';

interface NotificationStore {
  pendingApprovals: number;
  lastNotificationCrisisId: string | null;
  incrementPending: () => void;
  decrementPending: () => void;
  setLastNotificationCrisisId: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>(set => ({
  pendingApprovals: 0,
  lastNotificationCrisisId: null,
  incrementPending: () =>
    set(s => ({pendingApprovals: s.pendingApprovals + 1})),
  decrementPending: () =>
    set(s => ({pendingApprovals: Math.max(0, s.pendingApprovals - 1)})),
  setLastNotificationCrisisId: id => set({lastNotificationCrisisId: id}),
}));
