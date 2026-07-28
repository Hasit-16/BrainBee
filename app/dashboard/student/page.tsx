'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserSession } from '@/lib/store';
import { mockData } from '@/lib/mockData';

export default function StudentDashboardHub() {
  const router = useRouter();
  const { session, role, isLoaded, logout, tier } = useUserSession();

  useEffect(() => {
    if (isLoaded && role !== 'STUDENT') {
      router.push('/');
    }
  }, [isLoaded, role, router]);

  if (!isLoaded || role !== 'STUDENT') {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const { student, subjects } = mockData;

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-800 p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-10 font-sans">
      {/* STEP 1: HEADER & STATS (Pills & White Clay Container) */}
      <header className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/60 border border-white/90 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-500/10 border-2 border-blue-500/20 text-blue-600 flex items-center justify-center font-extrabold text-2xl shadow-inner">
            👤
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
              Welcome back, {session?.name || student.name}!
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-0.5">
              Grade 5 • Current Tier: <span className="text-blue-600 font-bold uppercase">{tier || student.tier}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons as Puffy, Pill-Shaped Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button className="rounded-full px-5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-sm shadow-md shadow-amber-200/50 hover:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer border border-amber-200/60">
            🔍 Doubt Scan
          </button>
          
          <div className="rounded-full px-5 py-2.5 bg-amber-400 text-amber-950 font-extrabold text-sm shadow-md shadow-amber-400/40 flex items-center gap-1.5 border border-amber-300">
            ⭐ {student.xp} XP
          </div>

          <button
            onClick={handleLogout}
            className="rounded-full px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm shadow-sm hover:translate-y-0.5 transition-all cursor-pointer border border-rose-200/60"
          >
            Logout 🚪
          </button>
        </div>
      </header>

      {/* STEP 2: SUBJECT CARDS (Grid Layout - Pure White Clay Cards with Accent Buttons) */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">
              Pick Your Adventure!
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">Select a subject to start your micro-learning journey</p>
          </div>
          <span className="rounded-full px-4 py-1.5 bg-blue-50 text-blue-600 font-bold text-xs border border-blue-100">
            Select to Start Learning
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {subjects.map((sub, idx) => {
            const colorAccents = [
              { bgIcon: 'bg-blue-50 text-blue-600', btn: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30' },
              { bgIcon: 'bg-emerald-50 text-emerald-600', btn: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' },
              { bgIcon: 'bg-purple-50 text-purple-600', btn: 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/30' },
            ];
            const accent = colorAccents[idx % colorAccents.length];

            return (
              <div
                key={sub.subject_id}
                className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/60 border border-white/90 flex flex-col justify-between transition-all hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-300/60"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${accent.bgIcon}`}>
                      {sub.icon}
                    </span>
                    <span className="rounded-full px-3 py-1 text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/60">
                      {sub.standard}
                    </span>
                  </div>

                  <h3 className="text-2xl font-extrabold text-slate-800 mb-1">{sub.subject_name}</h3>
                  <p className="text-xs font-semibold text-slate-500 mb-4">
                    {sub.chapters.length} Interactive Chapters
                  </p>
                </div>

                {/* STEP 3: Tactile Progress Bar */}
                <div className="pt-2 flex flex-col gap-3">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1.5">
                      <span>Subject Progress</span>
                      <span className="text-slate-800 font-extrabold">{sub.progress}%</span>
                    </div>
                    <div className="bg-slate-100 shadow-inner rounded-full h-3.5 p-0.5 overflow-hidden border border-slate-200/40">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-full h-full transition-all duration-500"
                        style={{ width: `${sub.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Soft Pill-Shaped Start Button */}
                  <Link href={`/learning/${sub.subject_id}`} className="no-underline mt-2">
                    <button
                      className={`w-full rounded-full py-3 px-6 text-white font-extrabold text-sm shadow-lg ${accent.btn} hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer`}
                    >
                      Start Learning 🚀
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

        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl shadow-slate-200/60 border border-white/90 flex flex-col gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-extrabold text-base text-slate-800">Overall Platform Progress</span>
              <span className="font-extrabold text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{student.overallProgress}%</span>
            </div>
            {/* Pressed Inset Track */}
            <div className="bg-slate-100 shadow-inner rounded-full h-4 p-0.5 overflow-hidden border border-slate-200/50">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full h-full transition-all duration-500 shadow-sm"
                style={{ width: `${student.overallProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
            {subjects.map((sub) => (
              <div key={sub.subject_id} className="flex flex-col gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{sub.icon} {sub.subject_name}</span>
                  <span className="text-blue-600">{sub.progress}%</span>
                </div>
                <div className="bg-slate-200/60 shadow-inner rounded-full h-3 p-0.5 overflow-hidden">
                  <div
                    className="bg-blue-500 rounded-full h-full"
                    style={{ width: `${sub.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STEP 4: DIAGNOSTIC CTA (Dedicated White Clay Card & Vibrant Green Focal Button) */}
      <section className="flex flex-col gap-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">
          Adaptive Diagnostic
        </h2>

        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl shadow-slate-200/60 border border-white/90 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl shadow-inner shrink-0 border border-emerald-100">
              📊
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-1">
                Initial Assessment Status
              </h3>
              <p className="text-sm font-medium text-slate-600 max-w-xl leading-relaxed">
                Your 5-question baseline diagnostic evaluates your skills to assign your personalized learning tier ({tier || 'UNASSIGNED'}).
              </p>
            </div>
          </div>

          {/* Focal Green Pill Button with Soft Glow */}
          <Link href="/learning/math/chap_01/diagnostic" className="no-underline shrink-0 w-full md:w-auto">
            <button className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8 py-3.5 font-extrabold text-base shadow-lg shadow-emerald-500/40 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-emerald-400/50">
              <span>🚀</span> Start Diagnostic Test
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
