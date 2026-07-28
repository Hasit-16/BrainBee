'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useUserSession } from '@/lib/store';
import { mockData, Subject } from '@/lib/mockData';
import { createClient, getCurrentUserId } from '@/lib/supabase/client';
import { playSound } from '@/lib/sound';

export default function SubjectPage() {
  const router = useRouter();
  const params = useParams();
  const { role, isLoaded, chapterTiers } = useUserSession();

  const subjectId = (params?.subjectId as string) || 'math';
  const [dbTiersMap, setDbTiersMap] = useState<Record<string, string>>({});
  const [dbCompletedChapters, setDbCompletedChapters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isLoaded && role !== 'STUDENT') {
      router.push('/');
    }
  }, [isLoaded, role, router]);

  // Fetch real-time chapter tiers and completion states from Supabase
  useEffect(() => {
    async function fetchSubjectData() {
      try {
        const supabase = createClient();
        const userId = await getCurrentUserId();

        // 1. Query chapter_tiers for this user & subject
        const { data: tiersData } = await supabase
          .from('chapter_tiers')
          .select('chapter_id, assigned_tier')
          .eq('user_id', userId)
          .eq('subject_id', subjectId);

        if (tiersData && Array.isArray(tiersData)) {
          const tMap: Record<string, string> = {};
          tiersData.forEach((row) => {
            if (row.chapter_id && row.assigned_tier) {
              tMap[row.chapter_id] = row.assigned_tier;
            }
          });
          setDbTiersMap(tMap);
        }

        // 2. Query level_progress for completion status
        const { data: progressData } = await supabase
          .from('level_progress')
          .select('chapter_id, is_completed')
          .eq('user_id', userId)
          .eq('subject_id', subjectId)
          .eq('is_completed', true);

        if (progressData && Array.isArray(progressData)) {
          const cMap: Record<string, boolean> = {};
          progressData.forEach((row) => {
            if (row.chapter_id) {
              cMap[row.chapter_id] = true;
            }
          });
          setDbCompletedChapters(cMap);
        }
      } catch (e) {
        console.warn('Subject data fetch notice: using session fallbacks');
      }
    }

    fetchSubjectData();
  }, [subjectId]);

  if (!isLoaded || role !== 'STUDENT') {
    return null;
  }

  const currentSubject: Subject =
    mockData.subjects.find((s) => s.subject_id === subjectId) || mockData.subjects[0];

  const clayCardFormula = "bg-white/90 backdrop-blur-sm shadow-[10px_20px_30px_rgba(0,0,0,0.05)] border border-white/60 relative overflow-hidden before:absolute before:inset-0 before:shadow-[inset_2px_4px_8px_rgba(255,255,255,0.8)] before:pointer-events-none rounded-[2rem]";

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-800 p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 font-sans">
      {/* Header Bar */}
      <header className={`${clayCardFormula} p-6 flex flex-wrap items-center justify-between gap-6`}>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/student" onClick={() => playSound('click')}>
            <button className="bg-gradient-to-b from-slate-100 to-slate-200 text-slate-700 font-bold text-xs rounded-full px-5 py-2.5 shadow-sm border border-white/80 hover:translate-y-0.5 transition-all cursor-pointer">
              ← Dashboard
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-blue-100/70 border border-blue-200/60 flex items-center justify-center text-3xl shadow-[inset_2px_4px_6px_rgba(0,0,0,0.06)]">
              {currentSubject.icon}
            </span>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
                {currentSubject.subject_name}
              </h1>
              <p className="text-xs font-semibold text-slate-500">{currentSubject.standard} • Adaptive Learning Track</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-gradient-to-b from-amber-200 to-amber-300 text-amber-900 shadow-[0_6px_12px_rgba(245,158,11,0.3)] border-t border-white/80 rounded-full font-bold text-sm px-5 py-2.5 flex items-center gap-2 cursor-pointer">
            🔍 Doubt Scan
          </button>
        </div>
      </header>

      {/* Subject Overview Card */}
      <div className={`${clayCardFormula} p-6 md:p-8 flex flex-col gap-3`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">
            {currentSubject.subject_name} Curriculum ({currentSubject.chapters.length} Master Chapters)
          </h2>
          <span className="bg-blue-100/80 text-blue-600 font-bold text-xs rounded-full px-4 py-1.5 shadow-[0_4px_10px_rgba(59,130,246,0.15)] border border-blue-200/50">
            Grade 5 Standard
          </span>
        </div>
        <p className="text-sm font-medium text-slate-600 max-w-3xl leading-relaxed">
          Select a chapter below to take its 5-question baseline diagnostic or continue your personalized learning tier.
        </p>
      </div>

      {/* Clean Grid of 3D Clay Chapter Cards */}
      <section className="flex flex-col gap-5">
        <h3 className="text-2xl font-extrabold tracking-tight text-slate-800">
          Enrolled Chapters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentSubject.chapters.map((chapter, idx) => {
            const assignedTier = dbTiersMap[chapter.chapter_id] || chapterTiers[chapter.chapter_id];
            const isCompleted = dbCompletedChapters[chapter.chapter_id] || assignedTier === 'COMPLETED';

            return (
              <Link
                key={chapter.chapter_id}
                href={`/learning/${currentSubject.subject_id}/${chapter.chapter_id}`}
                onClick={() => playSound('click')}
                className="no-underline group"
              >
                <div
                  className={`${clayCardFormula} p-6 h-full flex flex-col justify-between gap-6 transition-all group-hover:-translate-y-1.5 group-hover:shadow-[15px_25px_35px_rgba(0,0,0,0.08)]`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-slate-100 text-slate-600 font-bold text-xs rounded-full px-3.5 py-1 border border-slate-200/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                        Chapter {idx + 1}
                      </span>
                      <span
                        className={`rounded-full px-3.5 py-1 text-xs font-extrabold border ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : assignedTier
                            ? 'bg-purple-100 text-purple-700 border-purple-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {isCompleted ? '🏆 Mastered' : assignedTier ? `${assignedTier} TIER` : '⚡ Diagnostic Ready'}
                      </span>
                    </div>

                    <h4 className="text-2xl font-extrabold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {chapter.chapter_name}
                    </h4>

                    <p className="text-xs font-medium text-slate-500 leading-relaxed">
                      3 difficulty tiers (Beginner, Intermediate, Advanced) with interactive micro-lessons and evaluation quizzes.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      {isCompleted ? 'Completed' : assignedTier ? 'Continue Tier' : 'Start Diagnostic'}
                    </span>
                    <span className="text-sm font-extrabold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Enter Chapter 🚀
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
