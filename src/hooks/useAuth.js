import { useState, useEffect } from 'react';
import { authAPI } from '../api';
import { AVATAR_COLORS, getInitials, decodeJWT } from '../config';

const buildUser = (raw) => ({
  ...raw,
  avatar:      getInitials(raw.name),
  avatarColor: AVATAR_COLORS[raw.role] ?? AVATAR_COLORS.user,
});

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Restore session dari token tersimpan
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setAuthLoading(false); return; }

    const payload = decodeJWT(token);
    if (!payload || payload.exp * 1000 <= Date.now()) {
      localStorage.removeItem('token');
      setAuthLoading(false);
      return;
    }
    setCurrentUser(buildUser(payload));
    setAuthLoading(false);
  }, []);

  const login = async ({ identifier, password }) => {
    const data = await authAPI.login({ identifier, password });
    localStorage.setItem('token', data.token);
    const user = buildUser(data.user);
    setCurrentUser(user);
    return user;
  };

  const register = async ({ name, identifier, password }) => {
    const data = await authAPI.register({ name, identifier, password });
    localStorage.setItem('token', data.token);
    const user = buildUser(data.user);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  return { currentUser, authLoading, login, register, logout };
}
