import { defineStore } from 'pinia';
import request from '../utils/request';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.user?.username || '',
    balance: (state) => state.user?.balance || 0,
  },

  actions: {
    async login(username, password) {
      const result = await request.post('/auth/login', { username, password });
      const data = result?.data || result;
      this.token = data.accessToken;
      this.user = data.user;
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    },

    async register(username, email, password) {
      const result = await request.post('/auth/register', { username, email, password });
      return result?.data || result;
    },

    async getProfile() {
      const result = await request.get('/auth/profile');
      const data = result?.data || result;
      this.user = data;
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    },

    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
