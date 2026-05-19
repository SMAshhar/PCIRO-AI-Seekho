import {config} from '../constants/config';
import {apiClient} from './client';

export const commanderApi = {
  approve: async (eventId: string, note?: string) => {
    if (config.USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 600));
      return {ok: true};
    }
    const {data} = await apiClient.post('/api/commander/approve', {
      eventId,
      note,
    });
    return data;
  },

  reject: async (eventId: string, note?: string, reason?: string) => {
    if (config.USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 600));
      return {ok: true};
    }
    const {data} = await apiClient.post('/api/commander/reject', {
      eventId,
      note,
      reason,
    });
    return data;
  },
};
