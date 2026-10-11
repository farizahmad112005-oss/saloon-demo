import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    async function hydrate() {
      if (!token || !user) {
        setBooting(false);
        return;
      }
      try {
        if (user.role === 'admin') {
          const { data } = await AuthAPI.adminProfile();
          setUser({ ...data.data, role: 'admin' });
        } else if (user.role === 'customer') {
          const { data } = await AuthAPI.me();
          setUser({ ...data.data, role: 'customer' });
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setBooting(false);
      }
    }
    hydrate();
  }, []);

  const login = (payload) => {
    localStorage.setItem('token', payload.token);
    localStorage.setItem('user', JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      booting,
      isAdmin: user?.role === 'admin',
      isCustomer: user?.role === 'customer',
      login,
      logout,
    }),
    [user, token, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
