export interface SpaService {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  status: 'active' | 'inactive';
}

export interface Appointment {
  id: number;
  memberId: number;
  memberName: string;
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  duration: number;
  amount: number;
  note: string;
  createdAt: string;
}

export interface Member {
  id: number;
  name: string;
  phone: string;
  level: 'regular' | 'silver' | 'gold' | 'diamond';
  balance: number;
  totalSpent: number;
  visitCount: number;
  avatar: string;
}

export interface MonthlyStat {
  month: string;
  amount: number;
  count: number;
}

export interface CategoryItem {
  key: string;
  label: string;
}

export type AppointmentStatus = Appointment['status'];

export const STATUS_MAP: Record<AppointmentStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消'
};

export const STATUS_COLOR_MAP: Record<AppointmentStatus, string> = {
  pending: '#FAAD14',
  confirmed: '#B07942',
  in_progress: '#1890FF',
  completed: '#52C41A',
  cancelled: '#9E8E80'
};

export const LEVEL_MAP: Record<Member['level'], string> = {
  regular: '普通会员',
  silver: '银卡会员',
  gold: '金卡会员',
  diamond: '钻石会员'
};
