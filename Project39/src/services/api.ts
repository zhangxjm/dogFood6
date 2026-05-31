import Taro from '@tarojs/taro';

const API_BASE = 'http://localhost:3000/api';

export const request = async <T = any>(
  url: string,
  options: Taro.request.Option = {}
): Promise<T> => {
  try {
    const res = await Taro.request({
      url: `${API_BASE}${url}`,
      header: {
        'Content-Type': 'application/json',
        ...options.header,
      },
      ...options,
    });
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data as T;
    }
    console.error('[API] Request failed:', res.statusCode, res.data);
    throw new Error(`API Error: ${res.statusCode}`);
  } catch (error) {
    console.error('[API] Network error:', error);
    throw error;
  }
};

export const api = {
  services: {
    list: () => request<any[]>('/services'),
    getByCategory: (category: string) =>
      request<any[]>(`/services?category=${encodeURIComponent(category)}`),
    getDetail: (id: number) => request<any>(`/services/${id}`),
  },
  appointments: {
    list: () => request<any[]>('/appointments'),
    create: (data: any) =>
      request<any>('/appointments', { method: 'POST', data }),
    updateStatus: (id: number, status: string) =>
      request<any>(`/appointments/${id}`, {
        method: 'PATCH',
        data: { status },
      }),
    updateDuration: (id: number, duration: number) =>
      request<any>(`/appointments/${id}`, {
        method: 'PATCH',
        data: { duration },
      }),
  },
  members: {
    getProfile: (id: number) => request<any>(`/members/${id}`),
    getStats: (id: number) => request<any>(`/members/${id}/stats`),
  },
  statistics: {
    overview: () => request<any>('/statistics/overview'),
    monthly: () => request<any>('/statistics/monthly'),
  },
};
