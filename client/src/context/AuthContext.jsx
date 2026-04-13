import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_TOKEN = 'comment_thread_token';
const STORAGE_USER = 'comment_thread_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem(STORAGE_TOKEN);
    const u = localStorage.getItem(STORAGE_USER);
    if (t) setAuthToken(t);
    setToken(t);
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {
        localStorage.removeItem(STORAGE_USER);
      }
    }
    setReady(true);
  }, []);

  const persist = useCallback((t, usr) => {
    if (t) {
      localStorage.setItem(STORAGE_TOKEN, t);
      setAuthToken(t);
    } else {
      localStorage.removeItem(STORAGE_TOKEN);
      setAuthToken(null);
    }
    if (usr) {
      localStorage.setItem(STORAGE_USER, JSON.stringify(usr));
    } else {
      localStorage.removeItem(STORAGE_USER);
    }
    setToken(t);
    setUser(usr);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { data } = await authApi.login({ email, password });
      persist(data.token, data.user);
      return data;
    },
    [persist]
  );

  const register = useCallback(
    async (username, email, password) => {
      const { data } = await authApi.register({ username, email, password });
      persist(data.token, data.user);
      return data;
    },
    [persist]
  );

  const logout = useCallback(() => {
    persist(null, null);
  }, [persist]);

  const value = useMemo(
    () => ({
      user,
      token,
      ready,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [user, token, ready, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
