import request from '@/utils/request'

export interface LoginData {
  username: string
  password: string
}

export interface User {
  id: number
  username: string
  name: string
  role: string
  age: number
  gender: string
  diagnosis: string
  created_at: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface TrainingCommand {
  id: number
  code: string
  name: string
  description: string
  category: string
  difficulty: number
}

export interface TrainingSession {
  id: number
  user_id: number
  user_name: string
  type: string
  command: string
  start_time: string
  end_time?: string
  duration: number
  success_rate: number
  avg_accuracy: number
  status: string
  created_at: string
}

export interface ProgressSummary {
  user_id: number
  total_sessions: number
  total_duration: number
  avg_success_rate: number
  avg_accuracy: number
  weekly_sessions: number
  streak_days: number
  improvement_rate: number
}

export interface EEGSignal {
  id: number
  session_id: number
  user_id: number
  timestamp: string
  ch1: number
  ch2: number
  ch3: number
  ch4: number
  ch5: number
  ch6: number
  ch7: number
  ch8: number
  signal_quality: number
  command: string
  processed: boolean
}

export interface DashboardStats {
  total_patients: number
  total_users: number
  total_sessions: number
  active_sessions: number
  avg_accuracy: number
  avg_success_rate: number
  recent_sessions: TrainingSession[]
  role: string
}

export interface DailyData {
  date: string
  sessions: number
  duration: number
  avg_accuracy: number
  success_rate: number
}

export interface CommandStats {
  command: string
  command_name: string
  count: number
  avg_accuracy: number
  total_time: number
}

export interface CategoryStats {
  category: string
  category_name: string
  count: number
  avg_accuracy: number
}

export interface AnalyticsData {
  daily_data: DailyData[]
  command_stats: CommandStats[]
  category_stats: CategoryStats[]
}

export const authAPI = {
  login: (data: LoginData): Promise<LoginResponse> =>
    request.post('/login', data),
  
  getCurrentUser: (): Promise<User> =>
    request.get('/user/me'),
  
  updateProfile: (data: Partial<User>): Promise<any> =>
    request.put('/user/profile', data),
  
  changePassword: (oldPassword: string, newPassword: string): Promise<any> =>
    request.post('/user/password', { old_password: oldPassword, new_password: newPassword })
}

export const userAPI = {
  getPatients: (): Promise<User[]> =>
    request.get('/patients')
}

export const commandAPI = {
  getCommands: (category?: string, difficulty?: number): Promise<TrainingCommand[]> => {
    const params: any = {}
    if (category) params.category = category
    if (difficulty) params.difficulty = difficulty
    return request.get('/commands', { params })
  }
}

export const sessionAPI = {
  create: (data: { user_id?: number; type: string; command: string }): Promise<TrainingSession> =>
    request.post('/sessions', data),
  
  list: (user_id?: number, limit?: number): Promise<TrainingSession[]> => {
    const params: any = {}
    if (user_id) params.user_id = user_id
    if (limit) params.limit = limit
    return request.get('/sessions', { params })
  },
  
  end: (id: number): Promise<any> =>
    request.put(`/sessions/${id}/end`),
  
  getEEGData: (sessionId: number, limit?: number): Promise<EEGSignal[]> => {
    const params: any = {}
    if (limit) params.limit = limit
    return request.get(`/sessions/${sessionId}/eeg`, { params })
  }
}

export const progressAPI = {
  getProgress: (user_id?: number): Promise<ProgressSummary> => {
    const params: any = {}
    if (user_id) params.user_id = user_id
    return request.get('/progress', { params })
  },
  
  getAnalytics: (user_id?: number, days?: number): Promise<AnalyticsData> => {
    const params: any = {}
    if (user_id) params.user_id = user_id
    if (days) params.days = days
    return request.get('/analytics', { params })
  },
  
  getDashboard: (): Promise<DashboardStats> =>
    request.get('/dashboard')
}

export const planAPI = {
  list: (user_id?: number): Promise<any[]> => {
    const params: any = {}
    if (user_id) params.user_id = user_id
    return request.get('/plans', { params })
  },
  
  create: (data: any): Promise<any> =>
    request.post('/plans', data)
}

export const healthAPI = {
  check: (): Promise<any> =>
    request.get('/health')
}
