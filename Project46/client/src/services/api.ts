async function request<T = any>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T = any>(url: string) => request<T>(url, { method: 'GET' }),
  post: <T = any>(url: string, data?: any) =>
    request<T>(url, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  put: <T = any>(url: string, data?: any) =>
    request<T>(url, { method: 'PUT', body: data ? JSON.stringify(data) : undefined }),
  delete: <T = any>(url: string) => request<T>(url, { method: 'DELETE' }),
};
