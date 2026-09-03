import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      apiFetch('/users/me')
        .then((res) => setUser(res.user))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [token]);

  const requestOtp = async (phone) => {
    return apiFetch('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  };

  const verifyOtp = async (phone, otp) => {
    const res = await apiFetch('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const registerUser = async (name, role = 'customer', language_pref = 'en') => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, role, language_pref }),
    });
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const refreshUser = async () => {
    try {
      const res = await apiFetch('/users/me');
      setUser(res.user);
      return res.user;
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, token, loading, requestOtp, verifyOtp, registerUser, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
