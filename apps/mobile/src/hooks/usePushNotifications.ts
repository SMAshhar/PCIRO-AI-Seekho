import {useEffect} from 'react';
import {useUserStore} from '../store/userStore';

/** FCM stub — wire @react-native-firebase/messaging when google-services.json is added */
export const usePushNotifications = () => {
  const deviceId = useUserStore(s => s.deviceId);

  useEffect(() => {
    if (__DEV__) {
      console.log('[PCIRO] FCM registration stub for device', deviceId);
    }
  }, [deviceId]);
};
