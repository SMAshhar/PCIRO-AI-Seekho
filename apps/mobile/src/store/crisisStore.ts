import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {CrisisEvent} from '../types/models';

interface CrisisStore {
  activeCrises: CrisisEvent[];
  selectedCrisisId: string | null;
  lastSyncedAt: string | null;
  setCrises: (crises: CrisisEvent[]) => void;
  addOrUpdateCrisis: (crisis: CrisisEvent) => void;
  removeCrisis: (crisisId: string) => void;
  selectCrisis: (id: string | null) => void;
  getCrisisById: (id: string) => CrisisEvent | undefined;
  updateScore: (crisisId: string, score: number) => void;
  setLastSyncedAt: (ts: string) => void;
}

const sortCrises = (crises: CrisisEvent[]) =>
  [...crises].sort((a, b) => {
    if (b.corroboration_score !== a.corroboration_score) {
      return b.corroboration_score - a.corroboration_score;
    }
    return (
      new Date(b.ingest_timestamp).getTime() -
      new Date(a.ingest_timestamp).getTime()
    );
  });

export const useCrisisStore = create<CrisisStore>()(
  persist(
    (set, get) => ({
      activeCrises: [],
      selectedCrisisId: null,
      lastSyncedAt: null,
      setCrises: crises =>
        set({activeCrises: sortCrises(crises), lastSyncedAt: new Date().toISOString()}),
      addOrUpdateCrisis: crisis =>
        set(state => {
          const idx = state.activeCrises.findIndex(
            c => c.event_id === crisis.event_id,
          );
          const next =
            idx >= 0
              ? state.activeCrises.map((c, i) => (i === idx ? crisis : c))
              : [crisis, ...state.activeCrises];
          return {activeCrises: sortCrises(next)};
        }),
      removeCrisis: crisisId =>
        set(state => ({
          activeCrises: state.activeCrises.filter(c => c.event_id !== crisisId),
        })),
      selectCrisis: id => set({selectedCrisisId: id}),
      getCrisisById: id =>
        get().activeCrises.find((c: CrisisEvent) => c.event_id === id),
      updateScore: (crisisId, score) =>
        set(state => ({
          activeCrises: sortCrises(
            state.activeCrises.map(c =>
              c.event_id === crisisId ? {...c, corroboration_score: score} : c,
            ),
          ),
        })),
      setLastSyncedAt: ts => set({lastSyncedAt: ts}),
    }),
    {
      name: 'crisis_store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: s => ({
        activeCrises: s.activeCrises,
        lastSyncedAt: s.lastSyncedAt,
      }),
    },
  ),
);
