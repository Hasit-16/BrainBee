'use client';

import { useState, useEffect } from 'react';
import { QuizQuestion } from '@/lib/mockData';

export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';
export type Tier = 'UNASSIGNED' | 'FOUNDATION' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type ChapterTierState = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'COMPLETED';

export interface SavedQuizProgress {
  topicId: string;
  retryPass: QuizQuestion[];
  isIntermission: boolean;
  timestamp: string;
}

export interface UserSession {
  id: string;
  name: string;
  role: Role;
  instituteId: string;
  tier?: Tier;
  topicDiagnostics?: Record<string, { tier: Tier; completedAt: string }>;
  completedQuizTopics?: Record<string, boolean>;
  chapterTiers?: Record<string, ChapterTierState>;
  savedQuizProgress?: Record<string, SavedQuizProgress>;
}

const SESSION_KEY = 'brainbee_user_session';

export function saveQuizCache(topicId: string, state: object) {
  try {
    const key = `brainbee_quiz_cache_${topicId}`;
    localStorage.setItem(key, JSON.stringify({
      topicId,
      state,
      timestamp: new Date().toISOString()
    }));
  } catch (e) {
    console.error('Failed to save quiz cache to localStorage', e);
  }
}

export function getQuizCache(topicId: string): any {
  try {
    const key = `brainbee_quiz_cache_${topicId}`;
    const item = localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      return parsed.state || parsed;
    }
  } catch (e) {
    console.error('Failed to get quiz cache from localStorage', e);
  }
  return null;
}

export function clearQuizCache(topicId: string) {
  try {
    const key = `brainbee_quiz_cache_${topicId}`;
    localStorage.removeItem(key);
    localStorage.removeItem(`brainbee_quiz_retry_${topicId}`);
  } catch (e) {
    console.error('Failed to clear quiz cache from localStorage', e);
  }
}

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
      completedQuizTopics: {},
      chapterTiers: {},
      savedQuizProgress: {},
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

  const completeQuiz = (chapterId: string, quizLevel: 'beginner' | 'intermediate' | 'advanced', topicId?: string) => {
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
      completedQuizTopics: {
        ...(session.completedQuizTopics || {}),
        ...(topicId ? { [topicId]: true } : {}),
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

  const saveQuizProgress = (topicId: string, retryPass: QuizQuestion[]) => {
    if (!session) return;
    const currentProgress = session.savedQuizProgress || {};
    const updatedProgress: SavedQuizProgress = {
      topicId,
      retryPass,
      isIntermission: true,
      timestamp: new Date().toISOString(),
    };

    const updatedSession: UserSession = {
      ...session,
      savedQuizProgress: {
        ...currentProgress,
        [topicId]: updatedProgress,
      },
    };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
      localStorage.setItem(`brainbee_quiz_retry_${topicId}`, JSON.stringify(updatedProgress));
      setSession(updatedSession);
    } catch (e) {
      console.error('Failed to save quiz progress to localStorage', e);
    }
    return updatedProgress;
  };

  const getQuizProgress = (topicId: string): SavedQuizProgress | null => {
    try {
      const standalone = localStorage.getItem(`brainbee_quiz_retry_${topicId}`);
      if (standalone) {
        return JSON.parse(standalone);
      }
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed: UserSession = JSON.parse(stored);
        if (parsed.savedQuizProgress && parsed.savedQuizProgress[topicId]) {
          return parsed.savedQuizProgress[topicId];
        }
      }
    } catch (e) {
      console.error('Failed to get quiz progress from localStorage', e);
    }
    return null;
  };

  const clearQuizProgress = (topicId: string) => {
    clearQuizCache(topicId);
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed: UserSession = JSON.parse(stored);
        if (parsed.savedQuizProgress) {
          delete parsed.savedQuizProgress[topicId];
          localStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
          setSession(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to clear quiz progress from localStorage', e);
    }
  };

  return {
    session,
    role: session?.role || null,
    tier: session?.tier || 'UNASSIGNED',
    chapterTiers: session?.chapterTiers || {},
    savedQuizProgress: session?.savedQuizProgress || {},
    completedQuizTopics: session?.completedQuizTopics || {},
    isLoaded,
    login,
    logout,
    updateTier,
    completeQuiz,
    saveQuizProgress,
    getQuizProgress,
    clearQuizProgress,
  };
}
