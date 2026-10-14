import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bankease_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/users/login') || url.includes('/users/register');
    const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

    if ((error.response?.status === 401 || error.response?.status === 403) && !isAuthEndpoint && !isLoginPage) {
      localStorage.removeItem('bankease_token');
      localStorage.removeItem('bankease_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/users/login', data),
  register: (data) => api.post('/users/register', data),
  getMe: () => api.get('/users/me'),
};
export const accountApi = {
  getAccounts: () => api.get('/accounts'),
  create: (accountType) => api.post('/accounts', { accountType }),
};
export const transactionApi = {
  deposit: (account, data) => api.post(`/transactions/deposit/${account}`, data),
  withdraw: (account, data) => api.post(`/transactions/withdraw/${account}`, data),
  transfer: (sender, data) => api.post(`/transactions/transfer/${sender}`, data),
  history: (account) => api.get(`/transactions/${account}`),
};
