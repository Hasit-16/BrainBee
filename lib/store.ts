'use client';

import { useState, useEffect } from 'react';

export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';
export type Tier = 'UNASSIGNED' | 'FOUNDATION' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type ChapterTierState = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'COMPLETED';

export interface UserSession {
  id: string;
  name: string;
  role: Role;
  instituteId: string;
  tier?: Tier;
  topicDiagnostics?: Record<string, { tier: Tier; completedAt: string }>;
  chapterTiers?: Record<string, ChapterTierState>;
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
      chapterTiers: {},
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
    
    // Map assigned student tier to active chapter tier
    const chapterTierState: ChapterTierState =
      tier === 'ADVANCED' ? 'ADVANCED' : tier === 'BEGINNER' ? 'INTERMEDIATE' : 'BEGINNER';

    const updatedSession: UserSession = {
      ...session,
      tier: tier,
      topicDiagnostics: {
        ...(session.topicDiagnostics || {}),
        ...(topicId ? { [topicId]: { tier, completedAt: new Date().toISOString() } } : {}),
      },
      chapterTiers: {
        ...(session.chapterTiers || {}),
        chap_01: chapterTierState,
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

  const completeQuiz = (chapterId: string, quizLevel: 'beginner' | 'intermediate' | 'advanced') => {
    if (!session) return;
    const currentTiers = session.chapterTiers || {};
    let nextState: ChapterTierState = 'INTERMEDIATE';

    if (quizLevel === 'beginner') {
      nextState = 'INTERMEDIATE';
    } else if (quizLevel === 'intermediate') {
      nextState = 'ADVANCED';
    } else if (quizLevel === 'advanced') {
      nextState = 'COMPLETED';
    }

    const updatedSession: UserSession = {
      ...session,
      chapterTiers: {
        ...currentTiers,
        [chapterId]: nextState,
      },
    };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
      setSession(updatedSession);
    } catch (e) {
      console.error('Failed to update chapter tier progression in localStorage', e);
    }
    return nextState;
  };

  return {
    session,
    role: session?.role || null,
    tier: session?.tier || 'UNASSIGNED',
    chapterTiers: session?.chapterTiers || {},
    isLoaded,
    login,
    logout,
    updateTier,
    completeQuiz,
  };
}
