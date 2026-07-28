'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserSession } from '@/lib/store';
import { mockData } from '@/lib/mockData';
import { playSound, toggleSound, getSoundStatus } from '@/lib/sound';
import { DoubtScannerModal } from '@/components/DoubtScannerModal';
import { createClient, getCurrentUserId } from '@/lib/supabase/client';
import { UserIcon, SoundOnIcon, SoundOffIcon, SearchIcon, StarIcon, LogoutIcon } from '@/components/ui/Icons';

export default function StudentDashboardHub() {
  const router = useRouter();
  const { session, role, isLoaded, logout } = useUserSession();
  const [soundOn, setSoundOn] = useState(true);
  const [isDoubtModalOpen, setIsDoubtModalOpen] = useState(false);
  const [completedChaptersMap, setCompletedChaptersMap] = useState<Record<string, number>>({});

  useEffect(() => {
    setSoundOn(getSoundStatus());
  }, []);

  useEffect(() => {
    if (isLoaded && role !== 'STUDENT') {
      router.push('/');
    }
  }, [isLoaded, role, router]);

  // Fetch real-time completed chapter counts from Supabase level_progress
  useEffect(() => {
    async function fetchProgressData() {
      try {
        const supabase = createClient();
        const userId = await getCurrentUserId();

        const { data } = await supabase
          .from('level_progress')
          .select('subject_id, chapter_id, is_completed')
          .eq('user_id', userId)
          .eq('is_completed', true);

        if (data && Array.isArray(data)) {
          const map: Record<string, Set<string>> = {};
          data.forEach((row) => {
            const subjKey = row.subject_id || 'math';
            if (!map[subjKey]) map[subjKey] = new Set();
            if (row.chapter_id) map[subjKey].add(row.chapter_id);
          });

          const countMap: Record<string, number> = {};
          Object.keys(map).forEach((subj) => {
            countMap[subj] = map[subj].size;
          });
          setCompletedChaptersMap(countMap);
        }
      } catch (e) {
        console.warn('Progress fetch notice: using local fallbacks');
      }
    }
    fetchProgressData();
  }, []);

  if (!isLoaded || role !== 'STUDENT') {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const { student, subjects } = mockData;

  // Compute Overall Platform Progress dynamically across all chapters
  const totalPlatformChapters = subjects.reduce((acc, s) => acc + s.chapters.length, 0);
  const totalCompletedChapters = subjects.reduce((acc, s) => {
    const count = completedChaptersMap[s.subject_id] ?? (s.subject_id === 'math' ? 1 : 0);
    return acc + count;
  }, 0);
  const overallProgress = Math.min(100, Math.round((totalCompletedChapters / totalPlatformChapters) * 100));

  // Claymorphism Card Base Formula
  const clayCardFormula = "bg-white/90 backdrop-blur-sm shadow-[10px_20px_30px_rgba(0,0,0,0.05)] border border-white/60 relative overflow-hidden before:absolute before:inset-0 before:shadow-[inset_2px_4px_8px_rgba(255,255,255,0.8)] before:pointer-events-none rounded-[2rem]";

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-800 p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-10 font-sans">
      {/* STEP 1: HEADER & STATS (Clean SVG Icons Container) */}
      <header className={`${clayCardFormula} p-6 md:p-8 flex flex-wrap items-center justify-between gap-6`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200/60 text-slate-600 flex items-center justify-center shadow-[inset_2px_4px_6px_rgba(0,0,0,0.08)]">
            <UserIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
              Welcome back, {session?.name || student.name}!
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-0.5">
              Grade 5 Standard
            </p>
          </div>
        </div>

        {/* STEP 2: GLOWING ACTION BUTTONS WITH CLEAN SVG ICONS */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Sound Toggle Button */}
          <button
            onClick={() => {
              const enabled = toggleSound();
              setSoundOn(enabled);
              if (enabled) playSound('click');
            }}
            className="bg-gradient-to-b from-blue-100 to-blue-200 text-blue-800 shadow-[0_6px_12px_rgba(59,130,246,0.25)] border-t border-white/80 rounded-full font-bold text-sm px-5 py-2.5 hover:translate-y-0.5 active:translate-y-1 transition-all flex items-center gap-2 cursor-pointer"
          >
            {soundOn ? <SoundOnIcon /> : <SoundOffIcon />}
            <span>{soundOn ? 'Sound ON' : 'Muted'}</span>
          </button>

          {/* Doubt Scan Button */}
          <button
            onClick={() => {
              playSound('click');
              setIsDoubtModalOpen(true);
            }}
            className="bg-gradient-to-b from-amber-200 to-amber-300 text-amber-900 shadow-[0_6px_12px_rgba(245,158,11,0.3)] border-t border-white/80 rounded-full font-bold text-sm px-5 py-2.5 hover:translate-y-0.5 active:translate-y-1 transition-all flex items-center gap-2 cursor-pointer"
          >
            <SearchIcon />
            <span>Doubt Scan</span>
          </button>
          
          {/* XP Pill */}
          <div className="bg-gradient-to-b from-amber-300 to-amber-400 text-amber-950 shadow-[0_6px_12px_rgba(245,158,11,0.35)] border-t border-amber-200 rounded-full font-extrabold text-sm px-5 py-2.5 flex items-center gap-1.5">
            <StarIcon className="w-4 h-4 text-amber-950 fill-current" />
            <span>{student.xp} XP</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-gradient-to-b from-rose-100 to-rose-200 text-rose-700 shadow-[0_6px_12px_rgba(244,63,94,0.2)] border-t border-white/80 rounded-full font-bold text-sm px-5 py-2.5 hover:translate-y-0.5 active:translate-y-1 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* STEP 2: SUBJECT CARDS */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">
              Pick Your Adventure!
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">Select a subject to start your micro-learning journey</p>
          </div>
          <span className="bg-blue-100/80 text-blue-600 font-bold text-xs rounded-full px-4 py-1.5 shadow-[0_4px_10px_rgba(59,130,246,0.15)] border border-blue-200/50">
            Select to Start Learning
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {subjects.map((sub, idx) => {
            const completedCount = completedChaptersMap[sub.subject_id] ?? (sub.subject_id === 'math' ? 1 : 0);
            const totalCount = sub.chapters.length;
            const subProgressPercent = Math.min(100, Math.round((completedCount / totalCount) * 100));

            const colorAccents = [
              {
                bgIcon: 'bg-amber-100/70 text-amber-700 border-amber-200/60',
                btnClass: 'clay-btn-blue',
                progressFill: 'bg-gradient-to-r from-blue-400 to-blue-500'
              },
              {
                bgIcon: 'bg-emerald-100/70 text-emerald-700 border-emerald-200/60',
                btnClass: 'clay-btn-green',
                progressFill: 'bg-gradient-to-r from-emerald-400 to-emerald-500'
              },
              {
                bgIcon: 'bg-purple-100/70 text-purple-700 border-purple-200/60',
                btnClass: 'clay-btn-purple',
                progressFill: 'bg-gradient-to-r from-purple-400 to-purple-500'
              },
            ];
            const accent = colorAccents[idx % colorAccents.length];

            return (
              <div
                key={sub.subject_id}
                className={`${clayCardFormula} p-6 flex flex-col justify-between transition-all hover:-translate-y-1.5 hover:shadow-[15px_25px_35px_rgba(0,0,0,0.08)]`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-[inset_2px_4px_6px_rgba(0,0,0,0.06)] border ${accent.bgIcon}`}>
                      {sub.icon}
                    </span>
                    <span className="bg-slate-100 text-slate-600 font-bold text-xs rounded-full px-3.5 py-1 border border-slate-200/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                      {sub.standard}
                    </span>
                  </div>

                  <h3 className="text-2xl font-extrabold text-slate-800 mb-1">{sub.subject_name}</h3>
                  <p className="text-xs font-semibold text-slate-500 mb-4">
                    {sub.chapters.length} Interactive Chapters
                  </p>
                </div>

                {/* Tactile Inset Progress Bar Reflecting Completed Chapters */}
                <div className="pt-2 flex flex-col gap-3">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1.5">
                      <span>Subject Progress ({completedCount}/{totalCount} Chapters)</span>
                      <span className="text-slate-800 font-extrabold">{subProgressPercent}%</span>
                    </div>
                    <div className="bg-slate-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] rounded-full h-3.5 p-0.5 overflow-hidden border border-slate-200/50">
                      <div
                        className={`${accent.progressFill} rounded-full h-full transition-all duration-500`}
                        style={{ width: `${subProgressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Clean Global Claymorphism Button */}
                  <Link href={`/learning/${sub.subject_id}`} className="no-underline mt-2">
                    <button className={accent.btnClass}>
                      Start Learning
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* STEP 3: PROGRESS BARS (Tactile White Clay Panel) */}
      <section className="flex flex-col gap-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">
          Learning Progress
        </h2>

        <div className={`${clayCardFormula} p-6 md:p-8 flex flex-col gap-6`}>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-extrabold text-base text-slate-800">Overall Platform Progress ({totalCompletedChapters}/{totalPlatformChapters} Total Chapters Completed)</span>
              <span className="font-extrabold text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                {overallProgress}%
              </span>
            </div>
            {/* Pressed Inset Track */}
            <div className="bg-slate-100 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)] rounded-full h-4 p-0.5 overflow-hidden border border-slate-200/50">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full h-full transition-all duration-500 shadow-sm"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
            {subjects.map((sub) => {
              const count = completedChaptersMap[sub.subject_id] ?? (sub.subject_id === 'math' ? 1 : 0);
              const percent = Math.min(100, Math.round((count / sub.chapters.length) * 100));

              return (
                <div key={sub.subject_id} className="flex flex-col gap-2 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 shadow-[inset_1px_2px_4px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{sub.icon} {sub.subject_name} ({count}/{sub.chapters.length})</span>
                    <span className="text-blue-600">{percent}%</span>
                  </div>
                  <div className="bg-slate-200/70 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1)] rounded-full h-3 p-0.5 overflow-hidden">
                    <div
                      className="bg-blue-500 rounded-full h-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DOUBT SCANNER MODAL */}
      <DoubtScannerModal
        isOpen={isDoubtModalOpen}
        onClose={() => setIsDoubtModalOpen(false)}
        studentId={session?.id}
      />
    </main>
  );
}
