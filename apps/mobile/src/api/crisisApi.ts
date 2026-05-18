import {config} from '../constants/config';
import {MOCK_CRISES} from '../constants/mockData';
import {CrisisEvent} from '../types/models';
import {apiClient} from './client';

export const crisisApi = {
  getActiveCrises: async (): Promise<CrisisEvent[]> => {
    if (config.USE_MOCK_DATA) {
      return MOCK_CRISES;
    }
    const {data} = await apiClient.get<CrisisEvent[]>('/api/crises');
    return data;
  },

  getCrisisById: async (id: string): Promise<CrisisEvent | undefined> => {
    if (config.USE_MOCK_DATA) {
      return MOCK_CRISES.find(c => c.event_id === id);
    }
    const {data} = await apiClient.get<CrisisEvent>(`/api/crises/${id}`);
    return data;
  },

  getTrace: async (id: string): Promise<string> => {
    if (config.USE_MOCK_DATA) {
      const crisis = MOCK_CRISES.find(c => c.event_id === id);
      return JSON.stringify(crisis?.agent_trace ?? [], null, 2);
    }
    const {data} = await apiClient.get<string>(`/api/crises/${id}/trace`);
    return data;
  },

  getSimulation: async (id: string) => {
    if (config.USE_MOCK_DATA) {
      const crisis = MOCK_CRISES.find(c => c.event_id === id);
      return crisis?.simulation_metrics ?? [];
    }
    const {data} = await apiClient.get(`/api/crises/${id}/simulation`);
    return data;
  },
};
