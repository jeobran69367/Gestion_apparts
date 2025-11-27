"use client";

import { useState, useEffect, useCallback } from 'react';

export type UserRole = 'GUEST' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  isAdmin: boolean;
  isGuest: boolean;
  mounted: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    isAdmin: false,
    isGuest: false,
    mounted: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    let user: User | null = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch {
        // Invalid user data in localStorage, ignore silently
        user = null;
      }
    }

    const isLoggedIn = !!token && !!user;
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const isGuest = user?.role === 'GUEST';

    setAuthState({
      isLoggedIn,
      user,
      isAdmin,
      isGuest,
      mounted: true,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      isLoggedIn: false,
      user: null,
      isAdmin: false,
      isGuest: false,
      mounted: true,
    });
  }, []);

  const login = useCallback((token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const isGuest = user.role === 'GUEST';

    setAuthState({
      isLoggedIn: true,
      user,
      isAdmin,
      isGuest,
      mounted: true,
    });
  }, []);

  return {
    ...authState,
    logout,
    login,
  };
}
