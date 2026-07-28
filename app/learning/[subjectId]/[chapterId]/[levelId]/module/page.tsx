'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useUserSession } from '@/lib/store';
import { mockData, Subject, Chapter } from '@/lib/mockData';
import { createClient, getCurrentUserId } from '@/lib/supabase/client';
import { ScriptPlayer } from '@/components/ScriptPlayer';

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

  const handlePauseExit = () => {
    router.push(`/learning/${subjectId}/${chapterId}`);
  };

  const handleScriptCompletion = () => {
    router.push(`/learning/${subjectId}/${chapterId}/${levelId}/quiz`);
  };

  return (
    <main className="min-h-screen bg-[#f4f7fb] p-6 max-w-5xl mx-auto flex flex-col gap-6 font-sans">
      {/* Top Header Bar */}
      <header className="bg-white/90 backdrop-blur-sm shadow-[10px_20px_30px_rgba(0,0,0,0.05)] border border-white/60 rounded-[2rem] p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePauseExit}
            className="rounded-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-sm hover:translate-y-0.5 transition-all cursor-pointer border border-slate-200/60"
          >
            👈 Save & Exit to Chapter
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              {currentSubject.icon} {currentChapter.chapter_name}
            </h1>
            <p className="text-xs font-semibold text-slate-500">Interactive Micro-Lesson Script Player</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-full px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs shadow-sm flex items-center gap-1.5 border border-amber-200">
            🔍 Doubt Scan
          </button>
          <span className="rounded-full px-3.5 py-1.5 bg-purple-100 text-purple-700 font-extrabold text-xs border border-purple-200 shadow-sm">
            {levelUpper} LEVEL
          </span>
        </div>
      </header>

      {/* Main Interactive Script Player Component */}
      <ScriptPlayer
        subjectId={subjectId}
        chapterId={chapterId}
        level={levelId}
        onComplete={handleScriptCompletion}
      />
    </main>
  );
}
