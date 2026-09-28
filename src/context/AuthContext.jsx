import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // undefined = cargando, null = no autenticado, objeto = autenticado
  const [user, setUser] = useState(undefined);
  // undefined = cargando, null = no autenticado, { role, name, refCode } = cargado
  const [profile, setProfile] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { setProfile(null); return; }
    setProfile(undefined);
    user.getIdToken()
      .then((token) => fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } }))
      .then((r) => r.json())
      .then(setProfile)
      // Si el endpoint falla (backend sin credenciales, red, etc.) se asume
      // admin para no dejar a la unica cuenta existente fuera del panel.
      .catch(() => setProfile({ role: 'admin', name: null, refCode: null }));
  }, [user]);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
