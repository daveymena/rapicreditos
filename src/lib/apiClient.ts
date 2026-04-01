// BASE siempre /api — frontend y backend en mismo servidor en producción
// En dev, Vite proxy redirige /api -> localhost:3001
const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('rc_token');
}

export function setToken(token: string) {
  localStorage.setItem('rc_token', token);
}

export function clearToken() {
  localStorage.removeItem('rc_token');
  localStorage.removeItem('rc_user');
}

async function request<T>(method: string, path: string, body?: any): Promise<T> {
  const token = getToken();
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: any) => request<T>('POST', path, body),
  put: <T>(path: string, body: any) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
  patch: <T>(path: string, body: any) => request<T>('PATCH', path, body),
};

// Auth — rutas SIN /api/ porque BASE ya lo tiene
export const authApi = {
  register: (data: { email: string; password: string; full_name: string; business_name?: string; phone?: string }) =>
    api.post<{ user: any; token: string }>('/auth/register', data),

  login: (email: string, password: string) =>
    api.post<any>('/auth/login', { email, password }),

  verify2FA: (userId: string, code: string) =>
    api.post<{ user: any; token: string }>('/auth/verify-2fa', { userId, code }),

  me: () => api.get<{ user: any }>('/auth/me'),

  updateProfile: (data: any) => api.put<{ user: any }>('/auth/profile', data),
};

// Clients
export const clientsApi = {
  list: () => api.get<any[]>('/clients'),
  get: (id: string) => api.get<any>(`/clients/${id}`),
  create: (data: any) => api.post<any>('/clients', data),
  update: (id: string, data: any) => api.put<any>(`/clients/${id}`, data),
  delete: (id: string) => api.delete<any>(`/clients/${id}`),
};

// Loans
export const loansApi = {
  list: () => api.get<any[]>('/loans'),
  get: (id: string) => api.get<any>(`/loans/${id}`),
  create: (data: any) => api.post<any>('/loans', data),
  update: (id: string, data: any) => api.put<any>(`/loans/${id}`, data),
  payments: (loanId: string) => api.get<any[]>(`/loans/${loanId}/payments`),
  addPayment: (loanId: string, data: any) => api.post<any>(`/loans/${loanId}/payments`, data),
};

// Dashboard
export const dashboardApi = {
  stats: () => api.get<any>('/dashboard/stats'),
};
