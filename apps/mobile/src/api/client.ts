import axios from 'axios';
import {config} from '../constants/config';
import {useUserStore} from '../store/userStore';

export const apiClient = axios.create({
  baseURL: config.API_URL,
  timeout: 10000,
  headers: {'Content-Type': 'application/json'},
});

apiClient.interceptors.request.use(req => {
  req.headers['X-Device-ID'] = useUserStore.getState().deviceId;
  return req;
});

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    await apiClient.get(config.HEALTH_PATH, {timeout: 3000});
    return true;
  } catch {
    return false;
  }
};
