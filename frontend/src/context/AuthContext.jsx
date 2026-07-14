import { createContext, useContext, useState, useCallback } from 'react';
import { apiLogin, apiRegister } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('byteai_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const login = useCallback(async (username, password) => {
    const res = await apiLogin(username, password);
    const u = { username, userId: res.user_id };
    localStorage.setItem('byteai_user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (username, password) => {
    const res = await apiRegister(username, password);
    const u = { username, userId: res.user_id };
    localStorage.setItem('byteai_user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('byteai_user');
    setUser(null);
    try { await fetch('/api/logout', { method: 'POST' }); } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
