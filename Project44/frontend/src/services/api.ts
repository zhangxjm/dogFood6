import axios from 'axios';
import type {
  SatelliteData,
  SystemStatus,
  DataStatistics,
  RealtimeStats,
  PageResult,
  SimulatorStatus,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const dataApi = {
  getLatestData: (limit = 10): Promise<SatelliteData[]> =>
    api.get(`/data/latest?limit=${limit}`).then((r) => r.data),

  getData: (params: {
    page?: number;
    size?: number;
    satelliteId?: string;
    dataType?: string;
    status?: string;
    startTime?: string;
    endTime?: string;
  }): Promise<PageResult<SatelliteData>> =>
    api.get('/data', { params }).then((r) => r.data),

  getDataById: (id: number): Promise<SatelliteData> =>
    api.get(`/data/${id}`).then((r) => r.data),
};

export const systemApi = {
  getStatus: (): Promise<SystemStatus> =>
    api.get('/system/status').then((r) => r.data),
};

export const statisticsApi = {
  getRealtime: (): Promise<RealtimeStats> =>
    api.get('/statistics/realtime').then((r) => r.data),

  getHistory: (minutes = 30): Promise<DataStatistics[]> =>
    api.get(`/statistics/history?minutes=${minutes}`).then((r) => r.data),
};

export const simulatorApi = {
  start: (): Promise<SimulatorStatus> =>
    api.post('/simulator/start').then((r) => r.data),

  stop: (): Promise<SimulatorStatus> =>
    api.post('/simulator/stop').then((r) => r.data),

  getStatus: (): Promise<SimulatorStatus> =>
    api.get('/simulator/status').then((r) => r.data),
};

export default api;
