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

// Determine environment
const hasConfiguredBackend = Boolean(import.meta.env.VITE_API_URL);
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

// Only send HTTP network calls to backend if:
// 1) An external backend URL is provided (e.g. Render / Railway via VITE_API_URL), or
// 2) Running locally on localhost where Spring Boot backend is on port 8080.
// On static production hosts like Vercel (without VITE_API_URL), execute immediately via clientStore
// to avoid 404 / 405 Method Not Allowed errors on static assets.
const shouldUseRemoteApi = hasConfiguredBackend || isLocalhost;

async function withFallback(apiCall, fallbackCall) {
  if (!shouldUseRemoteApi) {
    try {
      const result = await fallbackCall();
      return { data: result, status: 200, statusText: 'OK' };
    } catch (fallbackErr) {
      throw fallbackErr;
    }
  }

  try {
    return await apiCall();
  } catch (err) {
    const status = err.response?.status;
    const isBackendBusinessError = status === 400 && err.response?.data?.message;

    // Preserve actual business/validation messages from an active backend
    if (isBackendBusinessError) {
      throw err;
    }

    // Catch 404, 405 (Method Not Allowed), network error, or 500+ down
    if (
      !status ||
      status === 404 ||
      status === 405 ||
      status >= 500 ||
      err.code === 'ERR_NETWORK'
    ) {
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
