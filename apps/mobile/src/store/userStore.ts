import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {v4 as uuidv4} from 'uuid';

export type UserRole = 'citizen' | 'operator' | 'incident_commander';

interface UserStore {
  role: UserRole;
  language: 'en' | 'ur';
  reportLanguageHint: 'en' | 'ur' | 'roman_ur';
  subscribedSectors: string[];
  notifyAllSeverities: boolean;
  notifyCommanderApprovals: boolean;
  pushAlertsEnabled: boolean;
  deviceId: string;
  setRole: (role: UserRole) => void;
  setLanguage: (lang: UserStore['language']) => void;
  setReportLanguageHint: (hint: UserStore['reportLanguageHint']) => void;
  setSubscribedSectors: (sectors: string[]) => void;
  toggleNotifyAllSeverities: () => void;
  togglePushAlerts: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      role: 'citizen',
      language: 'en',
      reportLanguageHint: 'roman_ur',
      subscribedSectors: ['G-10', 'I-8', 'F-7'],
      notifyAllSeverities: true,
      notifyCommanderApprovals: true,
      pushAlertsEnabled: true,
      deviceId: uuidv4(),
      setRole: role => set({role}),
      setLanguage: language => set({language}),
      setReportLanguageHint: reportLanguageHint => set({reportLanguageHint}),
      setSubscribedSectors: subscribedSectors => set({subscribedSectors}),
      toggleNotifyAllSeverities: () =>
        set({notifyAllSeverities: !get().notifyAllSeverities}),
      togglePushAlerts: () => set({pushAlertsEnabled: !get().pushAlertsEnabled}),
    }),
    {
      name: 'user_store',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted, current) => {
        const p = persisted as Partial<UserStore> | undefined;
        return {
          ...current,
          ...p,
          deviceId: p?.deviceId || current.deviceId,
        };
      },
    },
  ),
);
