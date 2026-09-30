import axios from 'axios';

export const TOKEN_KEY = 'bankease_token';
export const USER_KEY = 'bankease_user';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCall = error.config?.url?.startsWith('/users/');
    if (error.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/users/login', data),
  register: (data) => api.post('/users/register', data),
};

export const accountApi = {
  getAccounts: () => api.get('/accounts'),
  createAccount: (accountType) => api.post('/accounts', { accountType }),
};

export const transactionApi = {
  deposit: (accountNumber, data) => api.post(`/transactions/deposit/${accountNumber}`, data),
  withdraw: (accountNumber, data) => api.post(`/transactions/withdraw/${accountNumber}`, data),
  history: (accountNumber) => api.get(`/transactions/${accountNumber}`),
  transfer: (senderAccountNumber, data) =>
    api.post(`/transactions/transfer/${senderAccountNumber}`, data),
};

export function errorMessage(error) {
  const data = error?.response?.data;
  if (data?.errors) return Object.values(data.errors).join(', ');
  if (data?.message) return data.message;
  if (typeof data === 'string' && data) return data;
  if (!error?.response) return 'Cannot reach the BankEase server. Is the backend running on port 8080?';
  return `Request failed (${error.response.status})`;
}

export default api;
