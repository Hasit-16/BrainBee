'use client';

import { useState, useEffect } from 'react';

export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';
export type Tier = 'UNASSIGNED' | 'FOUNDATION' | 'BEGINNER' | 'ADVANCED';

export interface UserSession {
  id: string;
  name: string;
  role: Role;
  instituteId: string;
  tier?: Tier;
  topicDiagnostics?: Record<string, { tier: Tier; completedAt: string }>;
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
      tier: 'UNASSIGNED',
      topicDiagnostics: {},
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

  const updateTier = (tier: Tier, topicId?: string) => {
    if (!session) return;
    const updatedSession: UserSession = {
      ...session,
      tier: tier,
      topicDiagnostics: {
        ...(session.topicDiagnostics || {}),
        ...(topicId ? { [topicId]: { tier, completedAt: new Date().toISOString() } } : {}),
      },
    };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
      setSession(updatedSession);
    } catch (e) {
      console.error('Failed to update tier in localStorage', e);
    }
    return updatedSession;
  };

  return {
    session,
    role: session?.role || null,
    tier: session?.tier || 'UNASSIGNED',
    isLoaded,
    login,
    logout,
    updateTier,
  };
}
