import axios from 'axios';
import { AuthResponse, LoginRequest, User, Course, Courseware, Certificate } from '../types';

const API_BASE_URL = '/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    axiosInstance.post('/auth/login', data).then((res) => res.data),
};

export const userAPI = {
  getAll: (): Promise<User[]> =>
    axiosInstance.get('/users').then((res) => res.data),
  getById: (id: number): Promise<User> =>
    axiosInstance.get(`/users/${id}`).then((res) => res.data),
  create: (data: Partial<User>): Promise<User> =>
    axiosInstance.post('/users', data).then((res) => res.data),
  update: (id: number, data: Partial<User>): Promise<User> =>
    axiosInstance.put(`/users/${id}`, data).then((res) => res.data),
  delete: (id: number): Promise<void> =>
    axiosInstance.delete(`/users/${id}`).then((res) => res.data),
};

export const courseAPI = {
  getAll: (teacherId?: number): Promise<Course[]> =>
    axiosInstance.get('/courses', { params: { teacherId } }).then((res) => res.data),
  getById: (id: number): Promise<Course> =>
    axiosInstance.get(`/courses/${id}`).then((res) => res.data),
  create: (data: Partial<Course>): Promise<Course> =>
    axiosInstance.post('/courses', data).then((res) => res.data),
  update: (id: number, data: Partial<Course>): Promise<Course> =>
    axiosInstance.put(`/courses/${id}`, data).then((res) => res.data),
  delete: (id: number): Promise<void> =>
    axiosInstance.delete(`/courses/${id}`).then((res) => res.data),
};

export const coursewareAPI = {
  getAll: (courseId?: number): Promise<Courseware[]> =>
    axiosInstance.get('/coursewares', { params: { courseId } }).then((res) => res.data),
  getById: (id: number): Promise<Courseware> =>
    axiosInstance.get(`/coursewares/${id}`).then((res) => res.data),
  upload: (courseId: number, file: File, title?: string): Promise<Courseware> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId.toString());
    if (title) formData.append('title', title);
    return axiosInstance.post('/coursewares/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data);
  },
  delete: (id: number): Promise<void> =>
    axiosInstance.delete(`/coursewares/${id}`).then((res) => res.data),
};

export const certificateAPI = {
  getAll: (userId?: number): Promise<Certificate[]> =>
    axiosInstance.get('/certificates', { params: { userId } }).then((res) => res.data),
  getById: (id: number): Promise<Certificate> =>
    axiosInstance.get(`/certificates/${id}`).then((res) => res.data),
  verify: (certificateNumber: string): Promise<Certificate | null> =>
    axiosInstance.get(`/certificates/verify/${certificateNumber}`).then((res) => res.data),
  create: (data: {
    userId: number;
    courseId: number;
    title: string;
    content: string;
    validUntil?: string;
  }): Promise<Certificate> =>
    axiosInstance.post('/certificates', data).then((res) => res.data),
  invalidate: (id: number): Promise<Certificate> =>
    axiosInstance.put(`/certificates/${id}/invalidate`).then((res) => res.data),
};
