// En producción frontend y backend corren juntos — rutas relativas
// Las rutas ya incluyen /api/... así que API_URL debe ser vacío
const API_URL = '';

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
  const res = await fetch(`${API_URL}${path}`, {
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

// Auth helpers
export const authApi = {
  register: (data: { email: string; password: string; full_name: string; business_name?: string; phone?: string }) =>
    api.post<{ user: any; token: string }>('/api/auth/register', data),

  login: (email: string, password: string) =>
    api.post<{ user: any; token: string }>('/api/auth/login', { email, password }),

  me: () => api.get<{ user: any }>('/api/auth/me'),

  updateProfile: (data: any) => api.put<{ user: any }>('/api/auth/profile', data),
};

// Clients
export const clientsApi = {
  list: () => api.get<any[]>('/api/clients'),
  get: (id: string) => api.get<any>(`/api/clients/${id}`),
  create: (data: any) => api.post<any>('/api/clients', data),
  update: (id: string, data: any) => api.put<any>(`/api/clients/${id}`, data),
  delete: (id: string) => api.delete<any>(`/api/clients/${id}`),
};

// Loans
export const loansApi = {
  list: () => api.get<any[]>('/api/loans'),
  get: (id: string) => api.get<any>(`/api/loans/${id}`),
  create: (data: any) => api.post<any>('/api/loans', data),
  update: (id: string, data: any) => api.put<any>(`/api/loans/${id}`, data),
  payments: (loanId: string) => api.get<any[]>(`/api/loans/${loanId}/payments`),
  addPayment: (loanId: string, data: any) => api.post<any>(`/api/loans/${loanId}/payments`, data),
};

// Dashboard
export const dashboardApi = {
  stats: () => api.get<any>('/api/dashboard/stats'),
};
