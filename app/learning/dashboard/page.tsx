'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useUserSession } from '@/lib/store';
import { mockData, badgeDefinitions, BadgeDefinition } from '@/lib/mockData';
import { createClient, CURRENT_USER_ID } from '@/lib/supabase/client';

export default function GlobalStudentDashboard() {
  const router = useRouter();
  const { role, isLoaded, session } = useUserSession();

  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [levelProgressMap, setLevelProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isLoaded && role !== 'STUDENT') {
      router.push('/');
    }
  }, [isLoaded, role, router]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const supabase = createClient();

        // 1. Fetch earned badges from student_badges
        const { data: badgeData } = await supabase
          .from('student_badges')
          .select('badge_id')
          .eq('user_id', CURRENT_USER_ID);

        if (badgeData && Array.isArray(badgeData) && badgeData.length > 0) {
          setEarnedBadges(badgeData.map((b) => b.badge_id));
        } else {
          // Default initial fallback
          setEarnedBadges(['FLAWLESS']);
        }

        // 2. Fetch level_progress for completion status
        const { data: progressData } = await supabase
          .from('level_progress')
          .select('chapter_id, level_id, is_completed')
          .eq('user_id', CURRENT_USER_ID)
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
    <main className="min-h-screen p-6 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-white/70 backdrop-blur border border-white/80">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="white" size="sm">
              ← Logout / Switch Role
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold color-primary">
              Student Learning Dashboard
            </h1>
            <p className="text-xs opacity-75 font-medium">Welcome back, {session?.name || 'Alex Student'}!</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="warning" size="md" className="flex items-center gap-2">
            🔍 Doubt Scan
          </Button>
          <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
            👤
          </div>
        </div>
      </header>

      {/* SECTION 1: SUBJECT & CHAPTER PROGRESS GRID */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold color-primary flex items-center gap-2">
            📚 Enrolled Curriculum & Chapters
          </h2>
          <Badge variant="blue">Level Completion Tracking</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockData.subjects.map((subj) => (
            <Card key={subj.subject_id} variant="white" className="p-6 flex flex-col justify-between gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{subj.icon}</span>
                  <Badge variant="purple">{subj.standard}</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-1">{subj.subject_name}</h3>
                <p className="text-sm opacity-75 mb-4">Adaptive K-12 Curriculum Track</p>

                <div className="flex flex-col gap-4">
                  {subj.chapters.map((chap) => {
                    const completedLevelCount = levelProgressMap[chap.chapter_id] || 0;
                    const completionPercent = Math.round((completedLevelCount / 3) * 100);

                    return (
                      <div key={chap.chapter_id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-base">{chap.chapter_name}</h4>
                          <Badge variant={completedLevelCount === 3 ? 'green' : completedLevelCount > 0 ? 'purple' : 'orange'}>
                            {completedLevelCount === 3 ? '✓ Mastered' : completedLevelCount > 0 ? 'In Progress' : 'Not Started'}
                          </Badge>
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-xs font-semibold mb-1">
                            <span>Level Progression</span>
                            <span>{completedLevelCount} of 3 Levels</span>
                          </div>
                          <ProgressBar progressPercentage={completionPercent} />
                        </div>
                        <div className="pt-1 flex justify-end">
                          <Link href={`/learning/${subj.subject_id}/${chap.chapter_id}`} className="no-underline">
                            <Button variant="secondary" size="sm">
                              Open Chapter 🚀
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 2: TROPHY CASE (QUALITATIVE BADGES EARNED) */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold color-primary flex items-center gap-2">
            🏆 Trophy Case (Qualitative Badges)
          </h2>
          <Badge variant="yellow">{earnedBadges.length} Badges Earned</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Object.keys(badgeDefinitions).map((badgeKey) => {
            const badge = badgeDefinitions[badgeKey];
            const isUnlocked = earnedBadges.includes(badgeKey);

            return (
              <Card
                key={badge.id}
                variant={isUnlocked ? badge.color : 'white'}
                className={`p-6 flex flex-col items-center text-center gap-3 ${
                  !isUnlocked ? 'opacity-40 grayscale' : ''
                }`}
              >
                <div className="text-5xl">{badge.icon}</div>
                <div>
                  <Badge variant={isUnlocked ? 'green' : 'orange'} className="mb-2">
                    {isUnlocked ? '✓ Unlocked' : '🔒 Locked'}
                  </Badge>
                  <h3 className="text-xl font-bold mb-1">{badge.name}</h3>
                  <p className="text-xs opacity-85 leading-relaxed">{badge.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
