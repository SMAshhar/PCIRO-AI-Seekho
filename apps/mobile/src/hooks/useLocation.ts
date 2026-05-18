import {useCallback, useEffect, useState} from 'react';
import Geolocation from '@react-native-community/geolocation';
import {PermissionsAndroid, Platform} from 'react-native';

const ISLAMABAD_DEFAULT = {
  lat: 33.6844,
  lon: 73.0479,
  sector: 'G-10',
};

export const useLocation = () => {
  const [location, setLocation] = useState(ISLAMABAD_DEFAULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const ok = await requestPermission();
    if (!ok) {
      setLocation(ISLAMABAD_DEFAULT);
      setError('Location permission denied');
      setLoading(false);
      return;
    }

    Geolocation.getCurrentPosition(
      pos => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          sector: 'G-10',
        });
        setLoading(false);
      },
      () => {
        setLocation(ISLAMABAD_DEFAULT);
        setError('Could not get GPS — using default sector');
        setLoading(false);
      },
      {enableHighAccuracy: true, timeout: 12000, maximumAge: 60000},
    );
  }, [requestPermission]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {location, loading, error, refresh, setSector: (sector: string) =>
    setLocation(l => ({...l, sector}))};
};
