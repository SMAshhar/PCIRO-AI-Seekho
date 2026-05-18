import {config} from '../constants/config';
import {ReportPayload} from '../types/models';
import {apiClient} from './client';

export const reportApi = {
  submitReport: async (
    payload: ReportPayload,
  ): Promise<{report_id: string}> => {
    if (config.USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 800));
      return {report_id: `RPT-${Date.now()}`};
    }
    const {data} = await apiClient.post<{report_id: string}>(
      '/api/reports',
      payload,
    );
    return data;
  },

  uploadPhoto: async (_uri: string): Promise<{photo_url: string}> => {
    if (config.USE_MOCK_DATA) {
      return {photo_url: 'https://example.com/photo.jpg'};
    }
    const form = new FormData();
    const {data} = await apiClient.post<{photo_url: string}>(
      '/api/reports/upload',
      form,
      {headers: {'Content-Type': 'multipart/form-data'}},
    );
    return data;
  },
};
