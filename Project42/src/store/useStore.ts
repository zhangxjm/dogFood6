import { create } from 'zustand';
import {
  getDashboard,
  getCategories,
  getMaterials,
  deleteMaterial as apiDeleteMaterial,
  uploadMaterial as apiUploadMaterial,
  checkin as apiCheckin,
  getCheckinRecords,
  getCheckinStats,
  getSubjects,
  updateSubjectProgress as apiUpdateSubjectProgress,
  addStudyRecord as apiAddStudyRecord,
  getStudyRecords,
  getStudyStats,
  type DashboardData,
  type Material,
  type Category,
  type CheckinRecord,
  type CheckinStats,
  type Subject,
  type StudyRecord,
  type StudyStat,
} from '@/utils/api';

interface AppState {
  dashboard: DashboardData | null;
  materials: Material[];
  materialsTotal: number;
  materialsPage: number;
  materialsPageSize: number;
  categories: Category[];
  checkinRecords: CheckinRecord[];
  checkinStats: CheckinStats | null;
  subjects: Subject[];
  studyRecords: StudyRecord[];
  studyStats: StudyStat[];

  loading: Record<string, boolean>;
  error: Record<string, string | null>;

  fetchDashboard: () => Promise<void>;
  fetchMaterials: (params?: { category_id?: number; search?: string; page?: number; page_size?: number }) => Promise<void>;
  fetchCategories: () => Promise<void>;
  uploadMaterial: (formData: FormData) => Promise<void>;
  deleteMaterial: (id: number) => Promise<void>;
  checkin: (note?: string) => Promise<void>;
  fetchCheckinRecords: (year?: number, month?: number) => Promise<void>;
  fetchCheckinStats: () => Promise<void>;
  fetchSubjects: () => Promise<void>;
  updateSubjectProgress: (id: number, data: { progress: number }) => Promise<void>;
  addStudyRecord: (data: { subject_id: number; duration: number; note?: string }) => Promise<void>;
  fetchStudyRecords: (days?: number) => Promise<void>;
  fetchStudyStats: (days?: number) => Promise<void>;
}

const setLoading = (loading: Record<string, boolean>, key: string) => ({ ...loading, [key]: true });
const setError = (error: Record<string, string | null>, key: string, msg: string | null) => ({ ...error, [key]: msg });
const clearLoading = (loading: Record<string, boolean>, key: string) => ({ ...loading, [key]: false });

export const useStore = create<AppState>((set, get) => ({
  dashboard: null,
  materials: [],
  materialsTotal: 0,
  materialsPage: 1,
  materialsPageSize: 12,
  categories: [],
  checkinRecords: [],
  checkinStats: null,
  subjects: [],
  studyRecords: [],
  studyStats: [],
  loading: {},
  error: {},

  fetchDashboard: async () => {
    set((s) => ({ loading: setLoading(s.loading, 'dashboard'), error: setError(s.error, 'dashboard', null) }));
    try {
      const data = await getDashboard();
      set({ dashboard: data, loading: clearLoading(get().loading, 'dashboard') });
    } catch (e: any) {
      set((s) => ({ loading: clearLoading(s.loading, 'dashboard'), error: setError(s.error, 'dashboard', e.message) }));
    }
  },

  fetchMaterials: async (params) => {
    set((s) => ({ loading: setLoading(s.loading, 'materials'), error: setError(s.error, 'materials', null) }));
    try {
      const data = await getMaterials(params);
      set({
        materials: data.items,
        materialsTotal: data.total,
        materialsPage: data.page,
        materialsPageSize: data.page_size,
        loading: clearLoading(get().loading, 'materials'),
      });
    } catch (e: any) {
      set((s) => ({ loading: clearLoading(s.loading, 'materials'), error: setError(s.error, 'materials', e.message) }));
    }
  },

  fetchCategories: async () => {
    set((s) => ({ loading: setLoading(s.loading, 'categories'), error: setError(s.error, 'categories', null) }));
    try {
      const data = await getCategories();
      set({ categories: data, loading: clearLoading(get().loading, 'categories') });
    } catch (e: any) {
      set((s) => ({ loading: clearLoading(s.loading, 'categories'), error: setError(s.error, 'categories', e.message) }));
    }
  },

  uploadMaterial: async (formData) => {
    set((s) => ({ loading: setLoading(s.loading, 'upload'), error: setError(s.error, 'upload', null) }));
    try {
      await apiUploadMaterial(formData);
      set({ loading: clearLoading(get().loading, 'upload') });
      get().fetchMaterials();
    } catch (e: any) {
      set((s) => ({ loading: clearLoading(s.loading, 'upload'), error: setError(s.error, 'upload', e.message) }));
    }
  },

  deleteMaterial: async (id) => {
    set((s) => ({ loading: setLoading(s.loading, 'deleteMaterial'), error: setError(s.error, 'deleteMaterial', null) }));
    try {
      await apiDeleteMaterial(id);
      set((s) => ({
        materials: s.materials.filter((m) => m.id !== id),
        loading: clearLoading(get().loading, 'deleteMaterial'),
      }));
    } catch (e: any) {
      set((s) => ({ loading: clearLoading(s.loading, 'deleteMaterial'), error: setError(s.error, 'deleteMaterial', e.message) }));
    }
  },

  checkin: async (note) => {
    set((s) => ({ loading: setLoading(s.loading, 'checkin'), error: setError(s.error, 'checkin', null) }));
    try {
      await apiCheckin(note);
      set({ loading: clearLoading(get().loading, 'checkin') });
      get().fetchCheckinStats();
      get().fetchDashboard();
    } catch (e: any) {
      set((s) => ({ loading: clearLoading(s.loading, 'checkin'), error: setError(s.error, 'checkin', e.message) }));
    }
  },

  fetchCheckinRecords: async (year, month) => {
    set((s) => ({ loading: setLoading(s.loading, 'checkinRecords'), error: setError(s.error, 'checkinRecords', null) }));
    try {
      const data = await getCheckinRecords(year, month);
      set({ checkinRecords: data, loading: clearLoading(get().loading, 'checkinRecords') });
    } catch (e: any) {
      set((s) => ({ loading: clearLoading(s.loading, 'checkinRecords'), error: setError(s.error, 'checkinRecords', e.message) }));
    }
  },

  fetchCheckinStats: async () => {
    set((s) => ({ loading: setLoading(s.loading, 'checkinStats'), error: setError(s.error, 'checkinStats', null) }));
    try {
      const data = await getCheckinStats();
      set({ checkinStats: data, loading: clearLoading(get().loading, 'checkinStats') });
    } catch (e: any) {
      set((s) => ({ loading: clearLoading(s.loading, 'checkinStats'), error: setError(s.error, 'checkinStats', e.message) }));
    }
  },

  fetchSubjects: async () => {
    set((s) => ({ loading: setLoading(s.loading, 'subjects'), error: setError(s.error, 'subjects', null) }));
    try {
      const data = await getSubjects();
      set({ subjects: data, loading: clearLoading(get().loading, 'subjects') });
    } catch (e: any) {
      set((s) => ({ loading: clearLoading(s.loading, 'subjects'), error: setError(s.error, 'subjects', e.message) }));
    }
  },

  updateSubjectProgress: async (id, data) => {
    set((s) => ({ loading: setLoading(s.loading, 'updateSubject'), error: setError(s.error, 'updateSubject', null) }));
    try {
      const updated = await apiUpdateSubjectProgress(id, data);
      set((s) => ({
        subjects: s.subjects.map((sub) => (sub.id === id ? updated : sub)),
        loading: clearLoading(get().loading, 'updateSubject'),
      }));
    } catch (e: any) {
      set((s) => ({ loading: clearLoading(s.loading, 'updateSubject'), error: setError(s.error, 'updateSubject', e.message) }));
    }
  },

  addStudyRecord: async (data) => {
    set((s) => ({ loading: setLoading(s.loading, 'addStudyRecord'), error: setError(s.error, 'addStudyRecord', null) }));
    try {
      await apiAddStudyRecord(data);
      set({ loading: clearLoading(get().loading, 'addStudyRecord') });
      get().fetchStudyRecords(30);
      get().fetchStudyStats(7);
      get().fetchSubjects();
    } catch (e: any) {
      set((s) => ({ loading: clearLoading(s.loading, 'addStudyRecord'), error: setError(s.error, 'addStudyRecord', e.message) }));
    }
  },

  fetchStudyRecords: async (days) => {
    set((s) => ({ loading: setLoading(s.loading, 'studyRecords'), error: setError(s.error, 'studyRecords', null) }));
    try {
      const data = await getStudyRecords(days);
      set({ studyRecords: data, loading: clearLoading(get().loading, 'studyRecords') });
    } catch (e: any) {
      set((s) => ({ loading: clearLoading(s.loading, 'studyRecords'), error: setError(s.error, 'studyRecords', e.message) }));
    }
  },

  fetchStudyStats: async (days) => {
    set((s) => ({ loading: setLoading(s.loading, 'studyStats'), error: setError(s.error, 'studyStats', null) }));
    try {
      const data = await getStudyStats(days);
      set({ studyStats: data, loading: clearLoading(get().loading, 'studyStats') });
    } catch (e: any) {
      set((s) => ({ loading: clearLoading(s.loading, 'studyStats'), error: setError(s.error, 'studyStats', e.message) }));
    }
  },
}));
