import axios from 'axios';
import { clientStore } from './clientStore';

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
    const isAuthEndpoint =
      url.includes('/login') ||
      url.includes('/register') ||
      url.includes('/signin') ||
      url.includes('/signup');
    const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !isAuthEndpoint &&
      !isLoginPage
    ) {
      localStorage.removeItem('bankease_token');
      localStorage.removeItem('bankease_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Fallback wrapper: if backend is unreachable or returns 404 (such as on Vercel where
// Spring Boot is not hosted alongside static assets), seamlessly delegate to clientStore.
async function withFallback(apiCall, fallbackCall) {
  try {
    return await apiCall();
  } catch (err) {
    const status = err.response?.status;
    const isBackendBusinessError = status === 400 && err.response?.data?.message;

    // Preserve actual business/validation messages from an active backend
    if (isBackendBusinessError) {
      throw err;
    }

    // If 404 (no server handler on Vercel), network down, or 500+ error, fallback seamlessly
    if (!status || status === 404 || status >= 500 || err.code === 'ERR_NETWORK') {
      try {
        const result = await fallbackCall();
        return { data: result, status: 200, statusText: 'OK' };
      } catch (fallbackErr) {
        throw fallbackErr;
      }
    }

    throw err;
  }
}

export const authApi = {
  login: (data) =>
    withFallback(
      () => api.post('/users/login', data),
      () => clientStore.login(data)
    ),
  register: (data) =>
    withFallback(
      () => api.post('/users/register', data),
      () => clientStore.register(data)
    ),
  getMe: () =>
    withFallback(
      () => api.get('/users/me'),
      () => clientStore.getMe()
    ),
};

export const accountApi = {
  getAccounts: () =>
    withFallback(
      () => api.get('/accounts'),
      () => clientStore.getAccounts()
    ),
  create: (accountType) =>
    withFallback(
      () => api.post('/accounts', { accountType }),
      () => clientStore.createAccount(accountType)
    ),
};

export const transactionApi = {
  deposit: (account, data) =>
    withFallback(
      () => api.post(`/transactions/deposit/${account}`, data),
      () => clientStore.deposit(account, data)
    ),
  withdraw: (account, data) =>
    withFallback(
      () => api.post(`/transactions/withdraw/${account}`, data),
      () => clientStore.withdraw(account, data)
    ),
  transfer: (sender, data) =>
    withFallback(
      () => api.post(`/transactions/transfer/${sender}`, data),
      () => clientStore.transfer(sender, data)
    ),
  history: (account) =>
    withFallback(
      () => api.get(`/transactions/${account}`),
      () => clientStore.history(account)
    ),
};

export default api;
