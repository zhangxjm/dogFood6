const BASE_URL = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const isJson = options?.body && typeof options.body === 'string';
  const headers: Record<string, string> = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: { ...headers, ...options?.headers as Record<string, string> },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: '请求失败' }));
    throw new Error(error.detail || `请求失败: ${res.status}`);
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }
  return res.json();
}

async function uploadRequest<T>(url: string, formData: FormData): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: '上传失败' }));
    throw new Error(error.detail || `上传失败: ${res.status}`);
  }
  return res.json();
}

export interface Category {
  id: number;
  name: string;
  type: string;
  material_count: number;
}

export interface Material {
  id: number;
  title: string;
  category_id: number;
  description: string | null;
  file_path: string | null;
  file_type: string | null;
  file_size: number;
  created_at: string | null;
}

export interface MaterialList {
  items: Material[];
  total: number;
  page: number;
  page_size: number;
}

export interface CheckinRecord {
  id: number;
  checkin_date: string;
  note: string | null;
  created_at: string | null;
}

export interface CheckinStats {
  total_days: number;
  streak_days: number;
  month_rate: number;
}

export interface Subject {
  id: number;
  name: string;
  progress: number;
  total_hours: number;
}

export interface StudyRecord {
  id: number;
  subject_id: number;
  subject_name: string | null;
  duration: number;
  note: string | null;
  created_at: string | null;
}

export interface StudyStat {
  date: string;
  hours: number;
}

export interface DashboardData {
  total_materials: number;
  total_subjects: number;
  streak_days: number;
  total_hours: number;
  today_checked_in: boolean;
  recent_materials: Material[];
  subjects_progress: Subject[];
}

export function getDashboard() {
  return request<DashboardData>('/dashboard');
}

export function getCategories() {
  return request<Category[]>('/categories');
}

export function getMaterials(params?: { category_id?: number; search?: string; page?: number; page_size?: number }) {
  const query = new URLSearchParams();
  if (params?.category_id) query.set('category_id', String(params.category_id));
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', String(params.page));
  if (params?.page_size) query.set('page_size', String(params.page_size));
  const qs = query.toString();
  return request<MaterialList>(`/materials${qs ? `?${qs}` : ''}`);
}

export function uploadMaterial(formData: FormData) {
  return uploadRequest<Material>('/materials', formData);
}

export function deleteMaterial(id: number) {
  return request<{ message: string }>(`/materials/${id}`, { method: 'DELETE' });
}

export function downloadMaterialUrl(id: number) {
  return `/api/materials/${id}/download`;
}

export function checkin(note?: string) {
  return request<CheckinRecord>('/checkin', {
    method: 'POST',
    body: JSON.stringify({ note: note || '' }),
  });
}

export function getCheckinRecords(year?: number, month?: number) {
  const query = new URLSearchParams();
  if (year) query.set('year', String(year));
  if (month) query.set('month', String(month));
  const qs = query.toString();
  return request<CheckinRecord[]>(`/checkin${qs ? `?${qs}` : ''}`);
}

export function getCheckinStats() {
  return request<CheckinStats>('/checkin/stats');
}

export function getSubjects() {
  return request<Subject[]>('/subjects');
}

export function updateSubjectProgress(id: number, data: { progress: number }) {
  return request<Subject>(`/subjects/${id}/progress`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function addStudyRecord(data: { subject_id: number; duration: number; note?: string }) {
  return request<StudyRecord>('/study-records', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getStudyRecords(days?: number) {
  const query = new URLSearchParams();
  if (days) query.set('days', String(days));
  const qs = query.toString();
  return request<StudyRecord[]>(`/study-records${qs ? `?${qs}` : ''}`);
}

export function getStudyStats(days?: number) {
  const query = new URLSearchParams();
  if (days) query.set('days', String(days));
  const qs = query.toString();
  return request<StudyStat[]>(`/study-stats${qs ? `?${qs}` : ''}`);
}
