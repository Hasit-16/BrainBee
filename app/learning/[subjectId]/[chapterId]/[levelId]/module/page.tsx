'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useUserSession } from '@/lib/store';
import { mockData, Subject, Chapter } from '@/lib/mockData';
import { createClient, getCurrentUserId } from '@/lib/supabase/client';

export default function LevelModulePage() {
  const router = useRouter();
  const params = useParams();
  const { role, isLoaded, completedQuizTopics } = useUserSession();

  const subjectId = (params?.subjectId as string) || 'math';
  const chapterId = (params?.chapterId as string) || 'chap_01';
  const levelId = (params?.levelId as string) || 'BEGINNER';

  const [supabaseIsCompleted, setSupabaseIsCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoaded && role !== 'STUDENT') {
      router.push('/');
    }
  }, [isLoaded, role, router]);

  useEffect(() => {
    async function fetchLevelProgress() {
      try {
        const supabase = createClient();
        const userId = await getCurrentUserId();

        const { data } = await supabase
          .from('level_progress')
          .select('is_completed')
          .eq('user_id', userId)
          .eq('chapter_id', chapterId)
          .eq('level_id', levelId)
          .maybeSingle();

        if (data && typeof data.is_completed === 'boolean') {
          setSupabaseIsCompleted(data.is_completed);
        }
      } catch (e) {
        console.warn('Supabase level_progress notice: using local fallback');
      }
    }
    fetchLevelProgress();
  }, [chapterId, levelId]);

  if (!isLoaded || role !== 'STUDENT') {
    return null;
  }

  const currentSubject: Subject =
    mockData.subjects.find((s) => s.subject_id === subjectId) || mockData.subjects[0];
  const currentChapter: Chapter =
    currentSubject.chapters.find((c) => c.chapter_id === chapterId) || currentSubject.chapters[0];

  const levelUpper = levelId.toUpperCase();
  const isCompleted =
    typeof supabaseIsCompleted === 'boolean'
      ? supabaseIsCompleted
      : Boolean(completedQuizTopics?.[levelId]);

  const handleStartQuiz = () => {
    router.push(`/learning/${subjectId}/${chapterId}/${levelId}/quiz`);
  };

  const handlePauseExit = () => {
    router.push(`/learning/${subjectId}/${chapterId}`);
  };

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Top Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-white/70 backdrop-blur border border-white/80">
        <div className="flex items-center gap-3">
          <Button
            variant="white"
            size="sm"
            onClick={handlePauseExit}
            className="cursor-pointer font-bold"
          >
            👈 Save & Exit to Chapter
          </Button>
          <div>
            <h1 className="text-xl font-bold color-primary flex items-center gap-2">
              {currentSubject.icon} {currentChapter.chapter_name}
            </h1>
            <p className="text-xs opacity-75 font-medium">10-Minute Micro-Lesson</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="warning" size="sm" className="flex items-center gap-2">
            🔍 Doubt Scan
          </Button>
          <Badge variant={levelUpper === 'BEGINNER' ? 'purple' : levelUpper === 'INTERMEDIATE' ? 'blue' : 'orange'}>
            {levelUpper} LEVEL
          </Badge>
        </div>
      </header>

      {/* Main Targeted Lesson Card */}
      <Card variant="white" className="p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <Badge variant="yellow" className="mb-2">
              ⏱️ 10-Minute Focused Micro-Lesson
            </Badge>
            <h2 className="text-3xl font-extrabold color-primary">
              {levelUpper === 'BEGINNER'
                ? 'Foundations of Fractions & Decimals'
                : levelUpper === 'INTERMEDIATE'
                ? 'Converting & Simplifying Decimals'
                : 'Advanced Problem Solving & Applications'}
            </h2>
          </div>
          <span className="text-5xl">📖</span>
        </div>

        {/* Lesson Content Sections */}
        <div className="flex flex-col gap-4 leading-relaxed text-gray-800 font-medium">
          {levelUpper === 'BEGINNER' ? (
            <>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <h3 className="font-bold text-blue-900 text-lg mb-1">💡 Key Concept: What is a Fraction?</h3>
                <p className="text-sm text-blue-950">
                  A fraction represents a equal part of a whole quantity. The top number (Numerator) represents parts counted, and the bottom number (Denominator) represents total equal divisions.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                <h3 className="font-bold text-purple-900 text-lg mb-1">🔢 Example: Visualizing Decimals</h3>
                <p className="text-sm text-purple-950">
                  Writing <code className="bg-white px-2 py-0.5 rounded font-bold">1/2</code> is equivalent to <code className="bg-white px-2 py-0.5 rounded font-bold">0.50</code> in decimal notation. Both represent exactly half of a whole unit.
                </p>
              </div>
            </>
          ) : levelUpper === 'INTERMEDIATE' ? (
            <>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <h3 className="font-bold text-amber-900 text-lg mb-1">💡 Key Concept: Simplifying Ratios</h3>
                <p className="text-sm text-amber-950">
                  To simplify a fraction like <code className="bg-white px-2 py-0.5 rounded font-bold">4/8</code>, divide both numerator and denominator by their greatest common factor (4) to get <code className="bg-white px-2 py-0.5 rounded font-bold">1/2</code>.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <h3 className="font-bold text-emerald-900 text-lg mb-1">🎯 Practice Rule</h3>
                <p className="text-sm text-emerald-950">
                  Always check if the denominator can be converted to 10 or 100 for easy decimal representation.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <h3 className="font-bold text-rose-900 text-lg mb-1">💡 Advanced Strategy: Multi-Step Decimals</h3>
                <p className="text-sm text-rose-950">
                  When combining ratios and percentages, express all terms in uniform decimal formats before performing calculations.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Bottom CTA Action Button */}
        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 font-semibold">
            {isCompleted ? '✓ You have already mastered this level.' : 'Click below to begin your evaluation quiz.'}
          </p>

          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto px-8 cursor-pointer font-bold text-lg"
            onClick={handleStartQuiz}
          >
            {isCompleted ? 'Review Level Quiz 🎯' : 'Proceed to Practice Quiz 🎯'}
          </Button>
        </div>
      </Card>
    </main>
  );
}
