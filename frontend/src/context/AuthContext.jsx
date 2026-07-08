import { createContext, useContext, useState, useCallback } from 'react';
import { apiLogin, apiRegister } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mlpg_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (username, password) => {
    const res = await apiLogin(username, password);
    const u = { username, token: res.token };
    localStorage.setItem('mlpg_user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (username, password) => {
    const res = await apiRegister(username, password);
    const u = { username, token: res.token };
    localStorage.setItem('mlpg_user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mlpg_user');
    setUser(null);
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
