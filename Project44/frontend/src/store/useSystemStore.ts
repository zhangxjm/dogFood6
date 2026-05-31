import { create } from 'zustand';
import type { SystemStatus, RealtimeStats, DataStatistics, SimulatorStatus } from '../types';
import { systemApi, statisticsApi, simulatorApi } from '../services/api';

interface SystemStore {
  systemStatus: SystemStatus | null;
  realtimeStats: RealtimeStats | null;
  historyStats: DataStatistics[];
  simulatorStatus: SimulatorStatus | null;
  loading: boolean;
  error: string | null;
  refreshInterval: number | null;

  fetchSystemStatus: () => Promise<void>;
  fetchRealtimeStats: () => Promise<void>;
  fetchHistoryStats: (minutes?: number) => Promise<void>;
  fetchSimulatorStatus: () => Promise<void>;
  startSimulator: () => Promise<void>;
  stopSimulator: () => Promise<void>;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
}

export const useSystemStore = create<SystemStore>((set, get) => ({
  systemStatus: null,
  realtimeStats: null,
  historyStats: [],
  simulatorStatus: null,
  loading: false,
  error: null,
  refreshInterval: null,

  fetchSystemStatus: async () => {
    try {
      const data = await systemApi.getStatus();
      set({ systemStatus: data, error: null });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  fetchRealtimeStats: async () => {
    try {
      const data = await statisticsApi.getRealtime();
      set({ realtimeStats: data, error: null });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  fetchHistoryStats: async (minutes = 30) => {
    try {
      const data = await statisticsApi.getHistory(minutes);
      set({ historyStats: data, error: null });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  fetchSimulatorStatus: async () => {
    try {
      const data = await simulatorApi.getStatus();
      set({ simulatorStatus: data, error: null });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  startSimulator: async () => {
    try {
      set({ loading: true });
      const data = await simulatorApi.start();
      set({ simulatorStatus: data, loading: false, error: null });
    } catch (e: any) {
      set({ loading: false, error: e.message });
    }
  },

  stopSimulator: async () => {
    try {
      set({ loading: true });
      const data = await simulatorApi.stop();
      set({ simulatorStatus: data, loading: false, error: null });
    } catch (e: any) {
      set({ loading: false, error: e.message });
    }
  },

  startAutoRefresh: () => {
    const current = get().refreshInterval;
    if (current) return;

    const interval = window.setInterval(() => {
      get().fetchSystemStatus();
      get().fetchRealtimeStats();
    }, 3000);

    set({ refreshInterval: interval });
  },

  stopAutoRefresh: () => {
    const interval = get().refreshInterval;
    if (interval) {
      clearInterval(interval);
      set({ refreshInterval: null });
    }
  },
}));
