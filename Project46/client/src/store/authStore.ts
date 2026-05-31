import { createSignal } from 'solid-js';
import type { User } from '../types';
import { api } from '../services/api';

const [user, setUser] = createSignal<User | null>(null);
const [isAuthenticated, setIsAuthenticated] = createSignal(false);
const [loading, setLoading] = createSignal(true);

export const authStore = {
  user,
  isAuthenticated,
  loading,

  async checkAuth() {
    try {
      const res = await api.get('/api/auth/profile');
      if (res.success) {
        setUser(res.user);
        setIsAuthenticated(true);
      }
    } catch (e) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  },

  async login(username: string, password: string) {
    const res = await api.post('/api/auth/login', { username, password });
    setUser(res.user);
    setIsAuthenticated(true);
    return res;
  },

  async register(username: string, password: string, nickname: string) {
    const res = await api.post('/api/auth/register', { username, password, nickname });
    setUser(res.user);
    setIsAuthenticated(true);
    return res;
  },

  async logout() {
    await api.post('/api/auth/logout');
    setUser(null);
    setIsAuthenticated(false);
  },
};
