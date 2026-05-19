import {useCallback, useEffect, useState} from 'react';
import Geolocation from '@react-native-community/geolocation';
import {PermissionsAndroid, Platform} from 'react-native';

const ISLAMABAD_DEFAULT = {
  lat: 33.6844,
  lon: 73.0479,
  sector: 'G-10, Islamabad',
};

const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'CIRO_Mobile_App/1.0',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
    );
    if (!res.ok) return 'Unknown Area';
    const data = await res.json();
    const addr = data.address;
    if (!addr) return 'Unknown Area';

    const localArea =
      addr.suburb || addr.neighbourhood || addr.residential || addr.road || '';
    const city = addr.city || addr.town || addr.county || '';

    if (localArea && city) return `${localArea}, ${city}`;
    if (city) return city;
    return localArea || 'Unknown Area';
  } catch (err) {
    return 'Unknown Area';
  }
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
      async pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const sector = await reverseGeocode(lat, lon);
        setLocation({lat, lon, sector});
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
