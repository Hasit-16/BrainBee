'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserSession } from '@/lib/store';
import { mockData, badgeDefinitions } from '@/lib/mockData';
import { createClient, getCurrentUserId } from '@/lib/supabase/client';

import { playSound } from '@/lib/sound';
import { DoubtScannerModal } from '@/components/DoubtScannerModal';

export default function GlobalStudentDashboard() {
  const router = useRouter();
  const { role, isLoaded, session, logout } = useUserSession();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [levelProgressMap, setLevelProgressMap] = useState<Record<string, number>>({});
  const [isDoubtModalOpen, setIsDoubtModalOpen] = useState(false);

  useEffect(() => {
    if (isLoaded && role !== 'STUDENT') {
      router.push('/');
    }
  }, [isLoaded, role, router]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const supabase = createClient();
        const userId = await getCurrentUserId();

        // 1. Fetch earned badges from student_badges
        const { data: badgeData } = await supabase
          .from('student_badges')
          .select('badge_id')
          .eq('user_id', userId);

        if (badgeData && Array.isArray(badgeData) && badgeData.length > 0) {
          setEarnedBadges(badgeData.map((b) => b.badge_id));
        } else {
          setEarnedBadges(['FLAWLESS']);
        }

        // 2. Fetch level_progress for completion status
        const { data: progressData } = await supabase
          .from('level_progress')
          .select('chapter_id, level_id, is_completed')
          .eq('user_id', userId)
          .eq('is_completed', true);

        const chapterMap: Record<string, number> = {};
        if (progressData && Array.isArray(progressData)) {
          progressData.forEach((row) => {
            if (row.chapter_id) {
              chapterMap[row.chapter_id] = (chapterMap[row.chapter_id] || 0) + 1;
            }
          });
        }
        setLevelProgressMap(chapterMap);
      } catch (e) {
        console.warn('Supabase dashboard fetch notice: using session fallbacks');
      }
    }

    fetchDashboardData();
  }, []);

  if (!isLoaded || role !== 'STUDENT') {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-800 p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-10 font-sans">
      {/* HEADER BAR */}
      <header className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/60 border border-white/90 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="rounded-full px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm shadow-sm hover:translate-y-0.5 transition-all cursor-pointer border border-rose-200/60"
          >
            Logout 🚪
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
              Student Learning Dashboard
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Welcome back, {session?.name || 'Alex Student'}!</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playSound('click');
              setIsDoubtModalOpen(true);
            }}
            className="rounded-full px-5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-sm shadow-md shadow-amber-200/50 flex items-center gap-2 cursor-pointer border border-amber-200/60 hover:translate-y-0.5 transition-all"
          >
            🔍 Doubt Scan
          </button>
          <div className="w-12 h-12 rounded-full bg-blue-500/10 border-2 border-blue-500/20 text-blue-600 flex items-center justify-center font-extrabold text-xl shadow-inner">
            👤
          </div>
        </div>
      </header>

      {/* SECTION 1: ENROLLED CURRICULUM & CHAPTERS */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
            📚 Enrolled Curriculum & Chapters
          </h2>
          <span className="rounded-full px-4 py-1.5 bg-blue-50 text-blue-600 font-bold text-xs border border-blue-100">
            Level Completion Tracking
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockData.subjects.map((subj) => (
            <div key={subj.subject_id} className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/60 border border-white/90 flex flex-col justify-between gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl shadow-inner border border-blue-100">
                    {subj.icon}
                  </span>
                  <span className="rounded-full px-3 py-1 text-xs font-bold bg-purple-50 text-purple-600 border border-purple-100">
                    {subj.standard}
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 mb-1">{subj.subject_name}</h3>
                <p className="text-xs font-semibold text-slate-500 mb-5">Adaptive K-12 Curriculum Track</p>

                <div className="flex flex-col gap-4">
                  {subj.chapters.map((chap) => {
                    const completedLevelCount = levelProgressMap[chap.chapter_id] || 0;
                    const completionPercent = Math.round((completedLevelCount / 3) * 100);

                    return (
                      <div key={chap.chapter_id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-base text-slate-800">{chap.chapter_name}</h4>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                              completedLevelCount === 3
                                ? 'bg-emerald-100 text-emerald-700'
                                : completedLevelCount > 0
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {completedLevelCount === 3 ? '✓ Mastered' : completedLevelCount > 0 ? 'In Progress' : 'Not Started'}
                          </span>
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1.5">
                            <span>Level Progression</span>
                            <span>{completedLevelCount} of 3 Levels</span>
                          </div>
                          {/* Tactile Inset Progress Bar */}
                          <div className="bg-slate-200/70 shadow-inner rounded-full h-3.5 p-0.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-full h-full transition-all duration-500"
                              style={{ width: `${completionPercent}%` }}
                            />
                          </div>
                        </div>
                        <div className="pt-1 flex justify-end">
                          <Link href={`/learning/${subj.subject_id}/${chap.chapter_id}`} className="no-underline">
                            <button className="rounded-full px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs shadow-md shadow-blue-500/30 hover:translate-y-0.5 transition-all cursor-pointer">
                              Open Chapter 🚀
                            </button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: TROPHY CASE */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
            🏆 Trophy Case (Qualitative Badges)
          </h2>
          <span className="rounded-full px-4 py-1.5 bg-amber-100 text-amber-800 font-extrabold text-xs border border-amber-200">
            {earnedBadges.length} Badges Earned
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Object.keys(badgeDefinitions).map((badgeKey) => {
            const badge = badgeDefinitions[badgeKey];
            const isUnlocked = earnedBadges.includes(badgeKey);

            return (
              <div
                key={badge.id}
                className={`bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/60 border border-white/90 flex flex-col items-center text-center gap-3 ${
                  !isUnlocked ? 'opacity-50 grayscale' : ''
                }`}
              >
                <div className="text-5xl mb-1">{badge.icon}</div>
                <div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold inline-block mb-2 ${
                      isUnlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isUnlocked ? '✓ Unlocked' : '🔒 Locked'}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-800 mb-1">{badge.name}</h3>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {/* DOUBT SCANNER MODAL */}
      <DoubtScannerModal
        isOpen={isDoubtModalOpen}
        onClose={() => setIsDoubtModalOpen(false)}
      />
    </main>
  );
}
