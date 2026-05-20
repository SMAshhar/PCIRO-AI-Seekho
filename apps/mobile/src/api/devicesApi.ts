import {config} from '../constants/config';
import {apiClient} from './client';
import {useUserStore} from '../store/userStore';

export const devicesApi = {
  register: async (): Promise<void> => {
    if (config.USE_MOCK_DATA) {
      return;
    }
    const {deviceId, subscribedSectors, role} = useUserStore.getState();
    await apiClient.post('/api/devices/register', {
      device_id: deviceId,
      sectors: subscribedSectors,
      role,
    });
  },
};
