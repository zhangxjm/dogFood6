import { createSignal } from 'solid-js';
import { apiFetch, setToken as storeToken, clearToken } from '../api/client';

interface User {
  id: number;
  username: string;
  phone: string;
  level: number;
  points: number;
}

const [user, setUser] = createSignal<User | null>(null);
const [token, setTokenSignal] = createSignal<string | null>(localStorage.getItem('token'));
const [isAuthenticated, setIsAuthenticated] = createSignal(!!localStorage.getItem('token'));

export { user, token, isAuthenticated };

export async function login(username: string, password: string) {
  const data = await apiFetch<{ access_token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  storeToken(data.access_token);
  setTokenSignal(data.access_token);
  setUser(data.user);
  setIsAuthenticated(true);
}

export async function register(phone: string, username: string, password: string, invite_code?: string) {
  const body: Record<string, string> = { phone, username, password };
  if (invite_code) body.invite_code = invite_code;
  const data = await apiFetch<{ access_token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  storeToken(data.access_token);
  setTokenSignal(data.access_token);
  setUser(data.user);
  setIsAuthenticated(true);
}

export async function fetchProfile() {
  try {
    const data = await apiFetch<User>('/users/me');
    setUser(data);
  } catch {
    logout();
  }
}

export function logout() {
  clearToken();
  setTokenSignal(null);
  setUser(null);
  setIsAuthenticated(false);
}
