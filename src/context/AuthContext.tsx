import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api, ApiError } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole; error?: ApiError }>;
  register: (data: { name: string; email: string; password: string; phone?: string; role?: UserRole; address?: string }) => Promise<{ success: boolean; role?: UserRole; error?: ApiError }>;
  logout: () => void;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  updateUserPoints: (points: number) => void;
  updateProfile: (data: { name: string; phone?: string; address?: string; city?: string }) => Promise<{ success: boolean; message?: string; error?: ApiError }>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; message?: string; error?: ApiError }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ecocollect_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('ecocollect_token');
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.get<{ user: User }>('/api/auth/me');
          setUser(res.user);
          localStorage.setItem('ecocollect_user', JSON.stringify(res.user));
        } catch (err) {
          // Token expired or invalid
          setUser(null);
          setToken(null);
          localStorage.removeItem('ecocollect_token');
          localStorage.removeItem('ecocollect_user');
        }
      }
      setLoading(false);
    };

    fetchMe();

    const handleExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post<{ token: string; user: User }>('/api/auth/login', { email, password });
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('ecocollect_token', res.token);
      localStorage.setItem('ecocollect_user', JSON.stringify(res.user));
      return { success: true, role: res.user.role };
    } catch (err: any) {
      return { success: false, error: err as ApiError };
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string; role?: UserRole; address?: string }) => {
    try {
      const res = await api.post<{ token: string; user: User }>('/api/auth/register', data);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('ecocollect_token', res.token);
      localStorage.setItem('ecocollect_user', JSON.stringify(res.user));
      return { success: true, role: res.user.role };
    } catch (err: any) {
      return { success: false, error: err as ApiError };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ecocollect_token');
    localStorage.removeItem('ecocollect_user');
  };

  const quickDemoLogin = async (role: UserRole) => {
    if (role === 'citizen') {
      await login('citizen.demo@ecocollect.test', 'CitizenPass123!');
    } else if (role === 'staff') {
      await login('staff.demo@ecocollect.test', 'StaffPass123!');
    } else if (role === 'agency') {
      await login('agency.demo@ecocollect.test', 'AgencyAdmin123!');
    }
  };

  const updateUserPoints = (newPoints: number) => {
    if (user) {
      const updated = { ...user, ecoPoints: newPoints };
      setUser(updated);
      localStorage.setItem('ecocollect_user', JSON.stringify(updated));
    }
  };

  const updateProfile = async (data: { name: string; phone?: string; address?: string; city?: string }) => {
    try {
      const res = await api.put<{ message: string; token: string; user: User }>('/api/auth/profile', data);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('ecocollect_token', res.token);
      localStorage.setItem('ecocollect_user', JSON.stringify(res.user));
      return { success: true, message: res.message };
    } catch (err: any) {
      return { success: false, error: err as ApiError };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    try {
      const res = await api.post<{ message: string; token: string; user: User }>('/api/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('ecocollect_token', res.token);
      localStorage.setItem('ecocollect_user', JSON.stringify(res.user));
      return { success: true, message: res.message };
    } catch (err: any) {
      return { success: false, error: err as ApiError };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      quickDemoLogin,
      updateUserPoints,
      updateProfile,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
