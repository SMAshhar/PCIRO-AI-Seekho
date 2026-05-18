import {useCallback, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {crisisApi} from '../api/crisisApi';
import {useCrisisStore} from '../store/crisisStore';
import {CrisisEvent} from '../types/models';

const cacheKey = (id: string) => `crisis_detail:${id}`;

export const useCrisisDetail = (crisisId: string) => {
  const cached = useCrisisStore(s =>
    s.activeCrises.find(c => c.event_id === crisisId),
  );
  const [crisis, setCrisis] = useState<CrisisEvent | undefined>(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await crisisApi.getCrisisById(crisisId);
      if (data) {
        setCrisis(data);
        useCrisisStore.getState().addOrUpdateCrisis(data);
        await AsyncStorage.setItem(cacheKey(crisisId), JSON.stringify(data));
      }
    } catch (e) {
      const raw = await AsyncStorage.getItem(cacheKey(crisisId));
      if (raw) {
        setCrisis(JSON.parse(raw));
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load crisis');
      }
    } finally {
      setLoading(false);
    }
  }, [crisisId]);

  useEffect(() => {
    load();
  }, [load]);

  return {crisis, loading, error, refresh: load};
};
