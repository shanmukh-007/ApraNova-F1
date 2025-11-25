import { useState, useEffect } from 'react';
import Router from 'next/router';
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  getUserProfile,
  refreshAccessToken,
} from '../lib/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    let access = getAccessToken();
    const refresh = getRefreshToken();

    if (!access && refresh) {
      try {
        const refreshed = await refreshAccessToken(refresh);
        saveTokens(refreshed.access, refreshed.refresh);
        access = refreshed.access;
      } catch {
        clearTokens();
        Router.push('/login');
        return;
      }
    }

    if (access) {
      try {
        const profile = await getUserProfile(access);
        setUser(profile);
      } catch {
        clearTokens();
        Router.push('/login');
      }
    } else {
      Router.push('/login');
    }

    setLoading(false);
  }

  useEffect(() => {
    loadUser();
  }, []);

  function logout() {
    clearTokens();
    setUser(null);
    Router.push('/login');
  }

  return { user, loading, logout };
}
