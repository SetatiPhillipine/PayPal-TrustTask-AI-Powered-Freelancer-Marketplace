import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('tt_token')) return setReady(true);
    api('/auth/me').then((d) => setUser(d.user)).catch(() => localStorage.removeItem('tt_token')).finally(() => setReady(true));
  }, []);

  async function authenticate(path, body) {
    const d = await api(path, { method: 'POST', body });
    localStorage.setItem('tt_token', d.token);
    setUser(d.user);
  }
  const logout = () => { localStorage.removeItem('tt_token'); setUser(null); };

  return (
    <AuthCtx.Provider value={{ user, ready, login: (b) => authenticate('/auth/login', b), register: (b) => authenticate('/auth/register', b), logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
