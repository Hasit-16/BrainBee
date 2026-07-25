'use client';

import { useState, useEffect } from 'react';

export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface UserSession {
  id: string;
  name: string;
  role: Role;
  instituteId: string;
}

const SESSION_KEY = 'brainbee_user_session';

export function useUserSession() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        setSession(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse user session from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const login = (role: Role, name?: string) => {
    const defaultName =
      name ||
      (role === 'STUDENT'
        ? 'Alex Student'
        : role === 'TEACHER'
        ? 'Ms. Clara Teacher'
        : 'Admin User');

    const newSession: UserSession = {
      id: `usr_${Date.now()}`,
      name: defaultName,
      role: role,
      instituteId: 'inst_01',
    };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      setSession(newSession);
    } catch (e) {
      console.error('Failed to save session to localStorage', e);
    }
    return newSession;
  };

  const logout = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
      setSession(null);
    } catch (e) {
      console.error('Failed to clear session from localStorage', e);
    }
  };

  return {
    session,
    role: session?.role || null,
    isLoaded,
    login,
    logout,
  };
}
