import {Platform} from 'react-native';
import {config} from '../constants/config';
import {ReportPayload, ReportSubmitResponse} from '../types/models';
import {apiClient} from './client';

export const reportApi = {
  submitReport: async (
    payload: ReportPayload,
  ): Promise<ReportSubmitResponse> => {
    if (config.USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 800));
      const id = `RPT-${Date.now()}`;
      return {report_id: id, event_id: id, status: 'ok'};
    }
    const {data} = await apiClient.post<ReportSubmitResponse>(
      '/api/reports',
      payload,
    );
    return data;
  },

  /** Field name `file` must match FastAPI `UploadFile` parameter. */
  uploadPhoto: async (uri: string): Promise<{photo_url: string}> => {
    if (config.USE_MOCK_DATA) {
      return {photo_url: 'https://example.com/photo.jpg'};
    }
    const name = uri.split('/').pop() || 'photo.jpg';
    const ext = name.split('.').pop()?.toLowerCase();
    const type =
      ext === 'png'
        ? 'image/png'
        : ext === 'heic'
          ? 'image/heic'
          : 'image/jpeg';

    const form = new FormData();
    form.append('file', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: name.endsWith('.') ? 'photo.jpg' : name,
      type,
    } as unknown as Blob);

    const {data} = await apiClient.post<{photo_url: string}>(
      '/api/reports/upload',
      form,
    );
    return data;
  },
};
