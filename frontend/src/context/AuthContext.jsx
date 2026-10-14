import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('bankease_token');
      const storedUser = localStorage.getItem('bankease_user');
      if (token && storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (e) {
      localStorage.removeItem('bankease_token');
      localStorage.removeItem('bankease_user');
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('bankease_token');
    if (token) {
      authApi.getMe()
        .then(({ data }) => {
          localStorage.setItem('bankease_user', JSON.stringify(data));
          setUser(data);
        })
        .catch((err) => {
          if (err.response?.status === 401 || err.response?.status === 403) {
            localStorage.removeItem('bankease_token');
            localStorage.removeItem('bankease_user');
            setUser(null);
          }
        });
    }
  }, []);

  const login = async (usernameOrEmail, password) => {
    const { data } = await authApi.login({ username: usernameOrEmail, password });
    localStorage.setItem('bankease_token', data.token);
    localStorage.setItem('bankease_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (details) => {
    const { data } = await authApi.register(details);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('bankease_token');
    localStorage.removeItem('bankease_user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
