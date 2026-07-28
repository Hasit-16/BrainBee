'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useUserSession, ChapterTierState } from '@/lib/store';
import { mockData, Subject, Chapter } from '@/lib/mockData';
import { createClient, getCurrentUserId } from '@/lib/supabase/client';

export default function ChapterLandingPage() {
  const router = useRouter();
  const params = useParams();
  const { role, isLoaded, chapterTiers, completedQuizTopics } = useUserSession();

  const subjectId = (params?.subjectId as string) || 'math';
  const chapterId = (params?.chapterId as string) || 'chap_01';

  const [completedModalOpen, setCompletedModalOpen] = useState(false);
  const [supabaseTier, setSupabaseTier] = useState<string | null>(null);
  const [completedLevels, setCompletedLevels] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isLoaded && role !== 'STUDENT') {
      router.push('/');
    }
  }, [isLoaded, role, router]);

  // STEP 4: Dynamic user ID query for chapter_tiers and level_progress
  useEffect(() => {
    async function fetchChapterData() {
      try {
        const supabase = createClient();
        const userId = await getCurrentUserId();

        // 1. Fetch assigned_tier using dynamic userId
        const { data: tierData } = await supabase
          .from('chapter_tiers')
          .select('assigned_tier')
          .eq('user_id', userId)
          .eq('subject_id', subjectId)
          .eq('chapter_id', chapterId)
          .maybeSingle();

        if (tierData && tierData.assigned_tier) {
          setSupabaseTier(tierData.assigned_tier);
        }

        // 2. Fetch level_progress completion status using dynamic userId
        const { data: levelProgressData } = await supabase
          .from('level_progress')
          .select('level_id, is_completed')
          .eq('user_id', userId)
          .eq('chapter_id', chapterId);

        const levelMap: Record<string, boolean> = {};
        if (levelProgressData && Array.isArray(levelProgressData)) {
          levelProgressData.forEach((row) => {
            if (row.level_id && row.is_completed) {
              levelMap[row.level_id] = true;
            }
          });
        }

        // Legacy fallback check on topic_progress
        const { data: topicProgressData } = await supabase
          .from('topic_progress')
          .select('topic_id, is_completed')
          .eq('user_id', userId);

        if (topicProgressData && Array.isArray(topicProgressData)) {
          topicProgressData.forEach((row) => {
            if (row.topic_id && row.is_completed) {
              levelMap[row.topic_id] = true;
            }
          });
        }

        setCompletedLevels(levelMap);
      } catch (e) {
        console.warn('Supabase fetch notice: falling back to local session state');
      }
    }
    fetchChapterData();
  }, [subjectId, chapterId]);

  if (!isLoaded || role !== 'STUDENT') {
    return null;
  }

  const currentSubject: Subject =
    mockData.subjects.find((s) => s.subject_id === subjectId) ||
    mockData.subjects[0];

  const currentChapter: Chapter =
    currentSubject.chapters.find((c) => c.chapter_id === chapterId) ||
    currentSubject.chapters[0];

  const activeTier = supabaseTier || chapterTiers?.[chapterId];
  const hasDiagnosticBeenTaken =
    activeTier !== undefined &&
    activeTier !== null &&
    (activeTier as string) !== 'UNASSIGNED';

  const assignedTier: ChapterTierState = (activeTier as ChapterTierState) || 'BEGINNER';

  const isBegCompleted = Boolean(completedLevels['BEGINNER'] || completedQuizTopics?.['BEGINNER'] || completedQuizTopics?.['top_beg_01']);
  const isIntCompleted = Boolean(completedLevels['INTERMEDIATE'] || completedQuizTopics?.['INTERMEDIATE'] || completedQuizTopics?.['top_int_01']);
  const isAdvCompleted = Boolean(completedLevels['ADVANCED'] || completedQuizTopics?.['ADVANCED'] || completedQuizTopics?.['top_adv_01']);

  let isBegUnlocked = false;
  let isIntUnlocked = false;
  let isAdvUnlocked = false;

  if (hasDiagnosticBeenTaken) {
    if (assignedTier === 'ADVANCED') {
      isBegUnlocked = true;
      isIntUnlocked = true;
      isAdvUnlocked = true;
    } else if (assignedTier === 'INTERMEDIATE') {
      isBegUnlocked = true;
      isIntUnlocked = true;
      isAdvUnlocked = isIntCompleted;
    } else {
      isBegUnlocked = true;
      isIntUnlocked = isBegCompleted;
      isAdvUnlocked = isIntCompleted;
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-white/70 backdrop-blur border border-white/80">
        <div className="flex items-center gap-3">
          <Link href={`/learning/${currentSubject.subject_id}`}>
            <Button variant="white" size="sm">
              ← {currentSubject.subject_name}
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{currentSubject.icon}</span>
            <h1 className="text-2xl font-bold color-primary">
              {currentChapter.chapter_name}
            </h1>
            <Badge variant="yellow">{currentSubject.standard}</Badge>
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

      {/* PRE-DIAGNOSTIC STATE BANNER */}
      {!hasDiagnosticBeenTaken ? (
        <Card variant="white" className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-blue-400">
          <div className="flex items-start gap-4">
            <div className="text-5xl animate-bounce">📊</div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="orange">Diagnostic Required</Badge>
                <Badge variant="yellow">5 Questions</Badge>
              </div>
              <h2 className="text-3xl font-bold color-primary mb-1">
                Start Chapter Diagnostic
              </h2>
              <p className="text-base opacity-80 max-w-xl">
                Take the 5-question baseline assessment to evaluate your knowledge and unlock your personalized learning tier. All topics are currently locked until completed.
              </p>
            </div>
          </div>

          <Link
            href={`/learning/${subjectId}/${chapterId}/diagnostic`}
            className="no-underline shrink-0"
          >
            <Button variant="secondary" size="lg" className="px-8 py-4 text-xl flex items-center gap-2">
              🚀 Start Chapter Diagnostic
            </Button>
          </Link>
        </Card>
      ) : (
        /* POST-DIAGNOSTIC HEADER / REVISION HUB BANNER */
        <Card variant="white" className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="green">✓ Diagnostic Complete</Badge>
              <Badge variant="purple">Assigned Tier: {assignedTier}</Badge>
              {isBegCompleted && isIntCompleted && isAdvCompleted && (
                <Badge variant="yellow">🏆 Chapter Mastered</Badge>
              )}
            </div>
            <h2 className="text-2xl font-bold color-primary">
              {isBegCompleted && isIntCompleted && isAdvCompleted
                ? '🏆 Chapter Mastered & Revision Hub'
                : '🚀 Active Learning Progression'}
            </h2>
            <p className="text-sm opacity-80">
              {isBegCompleted && isIntCompleted && isAdvCompleted
                ? 'You have completed all difficulty levels! You can freely re-open and review any micro-lesson module below.'
                : 'Your learning pipeline is active. Continue where you left off or review completed modules.'}
            </p>
          </div>

          {!(isBegCompleted && isIntCompleted && isAdvCompleted) && (
            <Link
              href={
                !isBegCompleted
                  ? `/learning/${subjectId}/${chapterId}/BEGINNER/module`
                  : !isIntCompleted
                  ? `/learning/${subjectId}/${chapterId}/INTERMEDIATE/module`
                  : `/learning/${subjectId}/${chapterId}/ADVANCED/module`
              }
              className="no-underline shrink-0"
            >
              <Button variant="secondary" size="md" className="px-6 py-3 font-bold text-base flex items-center gap-2">
                Continue Learning Pipeline 🚀
              </Button>
            </Link>
          )}
        </Card>
      )}

      {/* THREE LEVEL CARDS WITH VISUAL LOCK STATES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: BEGINNER LEVEL */}
        <div className={`transition-all ${!isBegUnlocked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <Card
            variant="white"
            interactive={isBegUnlocked}
            className="h-full flex flex-col justify-between p-6"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="purple">🟢 Level 1</Badge>
                <Badge variant={isBegCompleted ? 'green' : isBegUnlocked ? 'purple' : 'orange'}>
                  {isBegCompleted ? '✓ Completed' : isBegUnlocked ? 'Unlocked' : '🔒 Locked'}
                </Badge>
              </div>
              <h3 className="text-2xl font-bold mb-2">Beginner Level</h3>
              <p className="text-sm opacity-80 mb-6">
                Foundation micro-lessons and evaluation quiz.
              </p>
            </div>

            <Link
              href={`/learning/${subjectId}/${chapterId}/BEGINNER/module`}
              className="no-underline w-full"
            >
              <Button
                variant="secondary"
                size="md"
                className="w-full flex justify-center"
                disabled={!isBegUnlocked}
              >
                {isBegCompleted ? 'Review Level 🚀' : 'Start Level 🚀'}
              </Button>
            </Link>
          </Card>
        </div>

        {/* CARD 2: INTERMEDIATE LEVEL */}
        <div className={`transition-all ${!isIntUnlocked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <Card
            variant="blue"
            interactive={isIntUnlocked}
            className="h-full flex flex-col justify-between p-6"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="yellow">🔵 Level 2</Badge>
                <Badge variant={isIntCompleted ? 'green' : isIntUnlocked ? 'blue' : 'orange'}>
                  {isIntCompleted ? '✓ Completed' : isIntUnlocked ? 'Unlocked' : '🔒 Locked'}
                </Badge>
              </div>
              <h3 className="text-2xl font-bold mb-2">Intermediate Level</h3>
              <p className="text-sm opacity-80 mb-6">
                Targeted intermediate lessons and evaluation quiz.
              </p>
            </div>

            <Link
              href={`/learning/${subjectId}/${chapterId}/INTERMEDIATE/module`}
              className="no-underline w-full"
            >
              <Button
                variant="white"
                size="md"
                className="w-full flex justify-center"
                disabled={!isIntUnlocked}
              >
                {isIntCompleted ? 'Review Level 🚀' : 'Start Level 🚀'}
              </Button>
            </Link>
          </Card>
        </div>

        {/* CARD 3: ADVANCED LEVEL */}
        <div className={`transition-all ${!isAdvUnlocked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <Card
            variant="purple"
            interactive={isAdvUnlocked}
            className="h-full flex flex-col justify-between p-6"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="orange">🟣 Level 3</Badge>
                <Badge variant={isAdvCompleted ? 'green' : isAdvUnlocked ? 'purple' : 'orange'}>
                  {isAdvCompleted ? '🏆 Mastered' : isAdvUnlocked ? 'Unlocked' : '🔒 Locked'}
                </Badge>
              </div>
              <h3 className="text-2xl font-bold mb-2">Advanced Level</h3>
              <p className="text-sm opacity-80 mb-6">
                High-level challenge lessons and chapter mastery quiz.
              </p>
            </div>

            <Link
              href={`/learning/${subjectId}/${chapterId}/ADVANCED/module`}
              className="no-underline w-full"
            >
              <Button
                variant="white"
                size="md"
                className="w-full flex justify-center"
                disabled={!isAdvUnlocked}
              >
                {isAdvCompleted ? 'Review Level 🚀' : 'Start Level 🚀'}
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Gamified Completion Modal */}
      <Modal
        isOpen={completedModalOpen}
        onClose={() => setCompletedModalOpen(false)}
        title="🏆 Chapter Mastered!"
        icon="🎉"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="yellow" className="text-lg px-4 py-1">
            {currentChapter.chapter_name}
          </Badge>
          <p className="text-base">
            Congratulations! You passed all difficulty levels and mastered this chapter! You earned a new Master Badge!
          </p>
          <Button
            variant="secondary"
            size="lg"
            className="mt-2 w-full flex justify-center"
            onClick={() => setCompletedModalOpen(false)}
          >
            Awesome! Continue Learning 🚀
          </Button>
        </div>
      </Modal>
    </main>
  );
}
