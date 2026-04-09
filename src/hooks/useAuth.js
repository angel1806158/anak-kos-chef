import { useState, useEffect } from 'react';
import { authAPI } from '../api';
import { AVATAR_COLORS, getInitials } from '../config';

const buildUser = (raw) => ({
  ...raw,
  id: Number(raw.id), // pastikan selalu integer
  avatar: getInitials(raw.name || ''),
  avatarColor: AVATAR_COLORS[raw.role] ?? AVATAR_COLORS.user,
});

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('anakkos_user');
      if (saved) {
        const user = JSON.parse(saved);
        setCurrentUser(buildUser(user));
      }
    } catch {}
    setAuthLoading(false);
  }, []);

  const login = async ({ identifier, password }) => {
    const data = await authAPI.login(identifier, password);
    localStorage.setItem('anakkos_user', JSON.stringify(data.user));
    const user = buildUser(data.user);
    setCurrentUser(user);
    return user;
  };

  const register = async ({ name, identifier, password }) => {
    const data = await authAPI.register(name, identifier, password);
    localStorage.setItem('anakkos_user', JSON.stringify(data.user));
    const user = buildUser(data.user);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('anakkos_user');
    setCurrentUser(null);
  };

  return { currentUser, authLoading, login, register, logout };
}
