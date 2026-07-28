'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSession } from '@/lib/store';
import { createClient, getCurrentUserId } from '@/lib/supabase/client';

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  section: string;
  subject: string;
  avatar: string;
  baselineTier: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'UNASSIGNED';
  moduleStage: {
    totalCircles: number;
    completed: number;
    inProgress: number;
  };
  avgScore: number;
  quizLogs: Array<{
    levelId: string;
    score: number;
    total: number;
    completedAt: string;
    status: string;
  }>;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    earnedAt: string;
  }>;
}

// Fallback student data for initial presentation & roster demo
const fallbackStudents: StudentRecord[] = [
  {
    id: '619acf86-11a4-459e-acba-d078f721634a',
    name: 'Alex Student',
    email: 'test@example.com',
    section: 'Grade 5 - Section A',
    subject: 'Mathematics',
    avatar: '👨‍🎓',
    baselineTier: 'ADVANCED',
    moduleStage: { totalCircles: 1, completed: 1, inProgress: 0 },
    avgScore: 85,
    quizLogs: [
      { levelId: 'BEGINNER', score: 5, total: 5, completedAt: '2026-07-27', status: 'COMPLETED' },
      { levelId: 'INTERMEDIATE', score: 4, total: 5, completedAt: '2026-07-27', status: 'COMPLETED' },
    ],
    badges: [
      { id: 'FLAWLESS', name: 'Flawless Master', icon: '🏆', earnedAt: '2026-07-27' },
      { id: 'ADVANCED_MASTER', name: 'Advanced Solver', icon: '⚡', earnedAt: '2026-07-27' },
    ],
  },
  {
    id: 'stu_002',
    name: 'Priya Sharma',
    email: 'priya.s@brainbee.edu',
    section: 'Grade 5 - Section A',
    subject: 'Mathematics',
    avatar: '👩‍🎓',
    baselineTier: 'INTERMEDIATE',
    moduleStage: { totalCircles: 2, completed: 1, inProgress: 1 },
    avgScore: 32, // < 40% triggers brute-force alert text-red-500
    quizLogs: [
      { levelId: 'BEGINNER', score: 1, total: 5, completedAt: '2026-07-26', status: 'RETRY_PASS' },
      { levelId: 'INTERMEDIATE', score: 2, total: 5, completedAt: '2026-07-27', status: 'IN_PROGRESS' },
    ],
    badges: [
      { id: 'PERSEVERANCE', name: 'Perseverance', icon: '🌟', earnedAt: '2026-07-26' },
    ],
  },
  {
    id: 'stu_003',
    name: 'Marcus Chen',
    email: 'marcus.c@brainbee.edu',
    section: 'Grade 5 - Section B',
    subject: 'Science',
    avatar: '👦',
    baselineTier: 'BEGINNER',
    moduleStage: { totalCircles: 3, completed: 2, inProgress: 0 },
    avgScore: 78,
    quizLogs: [
      { levelId: 'BEGINNER', score: 4, total: 5, completedAt: '2026-07-25', status: 'COMPLETED' },
    ],
    badges: [
      { id: 'FLAWLESS', name: 'Flawless Master', icon: '🏆', earnedAt: '2026-07-25' },
    ],
  },
  {
    id: 'stu_004',
    name: 'Sarah Miller',
    email: 'sarah.m@brainbee.edu',
    section: 'Grade 6 - Section A',
    subject: 'English',
    avatar: '👧',
    baselineTier: 'BEGINNER',
    moduleStage: { totalCircles: 3, completed: 0, inProgress: 1 },
    avgScore: 38, // < 40% triggers brute-force alert text-red-500
    quizLogs: [
      { levelId: 'BEGINNER', score: 1, total: 5, completedAt: '2026-07-24', status: 'INCOMPLETE' },
    ],
    badges: [],
  },
];

export default function MinimalistTeacherDashboard() {
  const router = useRouter();
  const { role, isLoaded, session, logout } = useUserSession();

  const [selectedSubject, setSelectedSubject] = useState<string>('All Subjects');
  const [selectedSection, setSelectedSection] = useState<string>('All Classes');
  const [students, setStudents] = useState<StudentRecord[]>(fallbackStudents);
  const [activeStudentOverlay, setActiveStudentOverlay] = useState<StudentRecord | null>(null);

  useEffect(() => {
    if (isLoaded && role !== 'TEACHER') {
      router.push('/');
    }
  }, [isLoaded, role, router]);

  // STEP 4: Dynamic Supabase Data Fetching & Join
  useEffect(() => {
    async function loadTeacherAnalyticsData() {
      try {
        const supabase = createClient();

        // 1. Fetch profiles
        const { data: profileRows } = await supabase.from('profiles').select('*');
        // 2. Fetch chapter_tiers
        const { data: tierRows } = await supabase.from('chapter_tiers').select('*');
        // 3. Fetch level_progress
        const { data: progressRows } = await supabase.from('level_progress').select('*');
        // 4. Fetch quiz_results
        const { data: quizRows } = await supabase.from('quiz_results').select('*');
        // 5. Fetch student_badges
        const { data: badgeRows } = await supabase.from('student_badges').select('*');

        if (profileRows && profileRows.length > 0) {
          const merged: StudentRecord[] = profileRows.map((prof, idx) => {
            const userTiers = (tierRows || []).filter((t) => t.user_id === prof.id);
            const userProgress = (progressRows || []).filter((p) => p.user_id === prof.id);
            const userQuizzes = (quizRows || []).filter((q) => q.user_id === prof.id);
            const userBadges = (badgeRows || []).filter((b) => b.user_id === prof.id);

            const baselineTier: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'UNASSIGNED' =
              userTiers.length > 0 && userTiers[0].assigned_tier
                ? (userTiers[0].assigned_tier as any)
                : 'BEGINNER';

            const totalCircles =
              baselineTier === 'ADVANCED' ? 1 : baselineTier === 'INTERMEDIATE' ? 2 : 3;
            const completedCount = userProgress.filter((p) => p.is_completed).length;

            let avgScore = 75;
            if (userQuizzes.length > 0) {
              const sum = userQuizzes.reduce((acc, q) => acc + (q.first_attempt_score || 0), 0);
              const maxPossible = userQuizzes.reduce((acc, q) => acc + (q.total_questions || 5), 0);
              avgScore = Math.round((sum / (maxPossible || 1)) * 100);
            }

            return {
              id: prof.id,
              name: prof.full_name || prof.name || `Student ${idx + 1}`,
              email: prof.email || `student_${idx + 1}@brainbee.edu`,
              section: idx % 2 === 0 ? 'Grade 5 - Section A' : 'Grade 5 - Section B',
              subject: userTiers[0]?.subject_id === 'science' ? 'Science' : 'Mathematics',
              avatar: idx % 2 === 0 ? '👨‍🎓' : '👩‍🎓',
              baselineTier,
              moduleStage: {
                totalCircles,
                completed: Math.min(completedCount, totalCircles),
                inProgress: completedCount < totalCircles ? 1 : 0,
              },
              avgScore,
              quizLogs: userQuizzes.map((q) => ({
                levelId: q.level_id || 'BEGINNER',
                score: q.first_attempt_score || 0,
                total: q.total_questions || 5,
                completedAt: q.completed_at ? q.completed_at.split('T')[0] : '2026-07-27',
                status: q.status || 'COMPLETED',
              })),
              badges: userBadges.map((b) => ({
                id: b.badge_id,
                name: b.badge_id === 'FLAWLESS' ? 'Flawless Master' : 'Perseverance Award',
                icon: b.badge_id === 'FLAWLESS' ? '🏆' : '🌟',
                earnedAt: b.earned_at ? b.earned_at.split('T')[0] : '2026-07-27',
              })),
            };
          });

          if (merged.length > 0) {
            setStudents(merged);
          }
        }
      } catch (e) {
        console.warn('Teacher Analytics fetch notice: using fallback roster');
      }
    }

    loadTeacherAnalyticsData();
  }, []);

  if (!isLoaded || role !== 'TEACHER') {
    return null;
  }

  // Filter students based on Subject & Section dropdown selections
  const filteredStudents = students.filter((s) => {
    const subjectMatch = selectedSubject === 'All Subjects' || s.subject === selectedSubject;
    const sectionMatch = selectedSection === 'All Classes' || s.section === selectedSection;
    return subjectMatch && sectionMatch;
  });

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* MINIMALIST HEADER BAR */}
      <header className="flex flex-wrap items-center justify-between border-b border-gray-200 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              BrainBee Educator Portal
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900">
            Teacher Analytics Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600 font-medium">
            Signed in as <strong className="text-gray-900 font-semibold">{session?.name || 'Ms. Clara'}</strong>
          </span>
          <button
            onClick={async () => {
              await logout();
              router.push('/login');
            }}
            className="text-red-600 hover:text-red-800 transition-colors font-medium border-l border-gray-200 pl-4"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* STEP 1: CONSOLIDATED LAYOUT & FLAT HORIZONTAL FILTERS */}
      <section className="flex flex-wrap items-center justify-between gap-6 border-b border-gray-100 pb-4">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          {/* Subject Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Subject:
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-gray-400 cursor-pointer"
            >
              <option value="All Subjects">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
            </select>
          </div>

          {/* Class Section Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Class Section:
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-gray-400 cursor-pointer"
            >
              <option value="All Classes">All Classes</option>
              <option value="Grade 5 - Section A">Grade 5 - Section A</option>
              <option value="Grade 5 - Section B">Grade 5 - Section B</option>
              <option value="Grade 6 - Section A">Grade 6 - Section A</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Showing <span className="font-semibold text-gray-900">{filteredStudents.length}</span> students
        </div>
      </section>

      {/* STEP 2: THE STUDENT LIST (FLAT DATA TABLE) */}
      <section className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase font-semibold text-gray-500 tracking-wider">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Baseline Tier</th>
              <th className="py-3 px-4">Module Stage</th>
              <th className="py-3 px-4">Avg. 1st Attempt Score</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500 text-sm font-medium">
                  No student records match the selected filters.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                // Circle stage rendering
                const circles = [];
                for (let i = 0; i < student.moduleStage.totalCircles; i++) {
                  if (i < student.moduleStage.completed) {
                    circles.push(<span key={i} className="text-gray-900 text-base font-bold">●</span>);
                  } else if (i === student.moduleStage.completed && student.moduleStage.inProgress > 0) {
                    circles.push(<span key={i} className="text-gray-700 text-base font-bold">◐</span>);
                  } else {
                    circles.push(<span key={i} className="text-gray-300 text-base font-bold">○</span>);
                  }
                }

                // Score threshold alert check (< 40% triggers muted red text-red-500)
                const isBruteForceAlert = student.avgScore < 40;

                return (
                  <tr key={student.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* 1. Student Name & Avatar */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base">
                          {student.avatar}
                        </span>
                        <div>
                          <div className="font-semibold text-gray-900">{student.name}</div>
                          <div className="text-xs text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Baseline Tier */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        {student.baselineTier}
                      </span>
                    </td>

                    {/* 3. Module Stage (Scaled Minimalist Circle Icons) */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5" title={`${student.moduleStage.completed} of ${student.moduleStage.totalCircles} Completed`}>
                        {circles}
                      </div>
                    </td>

                    {/* 4. Avg. First-Attempt Score (Muted Red < 40%) */}
                    <td className="py-4 px-4">
                      <span className={isBruteForceAlert ? 'text-red-500 font-semibold flex items-center gap-1' : 'text-gray-900 font-medium'}>
                        {isBruteForceAlert && <span>⚠️</span>}
                        {student.avgScore}%
                      </span>
                    </td>

                    {/* 5. Action Text Button */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setActiveStudentOverlay(student)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs tracking-wide hover:underline cursor-pointer"
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>

      {/* STEP 3: DETAILED STUDENT OVERLAY (SLIDE-OUT PANEL) */}
      {activeStudentOverlay && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-xs transition-opacity">
          <div
            className="fixed inset-0"
            onClick={() => setActiveStudentOverlay(null)}
          ></div>

          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-gray-200 p-6 flex flex-col justify-between overflow-y-auto z-10">
            <div className="flex flex-col gap-6">
              {/* Overlay Panel Header */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                    {activeStudentOverlay.avatar}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {activeStudentOverlay.name}
                    </h3>
                    <p className="text-xs text-gray-500">{activeStudentOverlay.section} • {activeStudentOverlay.subject}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStudentOverlay(null)}
                  className="text-gray-400 hover:text-gray-700 text-lg p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Baseline & Performance Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div>
                  <span className="text-xs font-semibold uppercase text-gray-500 block mb-1">
                    Baseline Tier
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {activeStudentOverlay.baselineTier}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-gray-500 block mb-1">
                    Avg. 1st Attempt
                  </span>
                  <span className={`text-sm font-semibold ${activeStudentOverlay.avgScore < 40 ? 'text-red-500' : 'text-gray-900'}`}>
                    {activeStudentOverlay.avgScore}%
                  </span>
                </div>
              </div>

              {/* Quiz Logs Section */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Specific Quiz Logs
                </h4>
                {activeStudentOverlay.quizLogs.length === 0 ? (
                  <p className="text-xs text-gray-500">No quiz attempts recorded yet.</p>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
                    {activeStudentOverlay.quizLogs.map((log, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-gray-900 block">
                            {log.levelId} Level Evaluation
                          </span>
                          <span className="text-gray-500">{log.completedAt}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 block">
                            Score: {log.score} / {log.total} ({Math.round((log.score / log.total) * 100)}%)
                          </span>
                          <span className="text-emerald-600 font-medium">{log.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Earned Qualitative Badges Section */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Earned Qualitative Badges
                </h4>
                {activeStudentOverlay.badges.length === 0 ? (
                  <p className="text-xs text-gray-500">No qualitative badges earned yet.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {activeStudentOverlay.badges.map((badge, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-gray-200 bg-white flex items-center gap-3"
                      >
                        <span className="text-2xl">{badge.icon}</span>
                        <div>
                          <span className="font-semibold text-xs text-gray-900 block">
                            {badge.name}
                          </span>
                          <span className="text-[10px] text-gray-500">Earned {badge.earnedAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Overlay Footer Close Action */}
            <div className="pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setActiveStudentOverlay(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-xs rounded-lg transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
