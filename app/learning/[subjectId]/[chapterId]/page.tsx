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
import { createClient, CURRENT_USER_ID } from '@/lib/supabase/client';

export default function ChapterLandingPage() {
  const router = useRouter();
  const params = useParams();
  const { role, isLoaded, chapterTiers, completeQuiz } = useUserSession();

  const subjectId = (params?.subjectId as string) || 'math';
  const chapterId = (params?.chapterId as string) || 'chap_01';

  const [completedModalOpen, setCompletedModalOpen] = useState(false);
  const [supabaseTier, setSupabaseTier] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && role !== 'STUDENT') {
      router.push('/');
    }
  }, [isLoaded, role, router]);

  // STEP 3: Fetch assigned tier from Supabase chapter_tiers for CURRENT_USER_ID, subjectId, and chapterId
  useEffect(() => {
    async function fetchChapterTier() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('chapter_tiers')
          .select('assigned_tier')
          .eq('user_id', CURRENT_USER_ID)
          .eq('subject_id', subjectId)
          .eq('chapter_id', chapterId)
          .maybeSingle();

        if (data && data.assigned_tier) {
          setSupabaseTier(data.assigned_tier);
        }
      } catch (e) {
        console.warn('Supabase fetch notice: falling back to local session state');
      }
    }
    fetchChapterTier();
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

  // Supabase tier primary, fallback to LocalStorage session
  const activeTier = supabaseTier || chapterTiers?.[chapterId];
  const hasDiagnosticBeenTaken =
    activeTier !== undefined &&
    activeTier !== null &&
    (activeTier as string) !== 'UNASSIGNED';

  const assignedTier: ChapterTierState = (activeTier as ChapterTierState) || 'BEGINNER';
  const isChapCompleted = assignedTier === 'COMPLETED';

  // Dynamic unlocking flags (post-diagnostic)
  const isBegUnlocked = hasDiagnosticBeenTaken;
  const isBegSkipped =
    hasDiagnosticBeenTaken &&
    (assignedTier === 'INTERMEDIATE' || assignedTier === 'ADVANCED' || isChapCompleted);

  const isIntUnlocked =
    hasDiagnosticBeenTaken &&
    (assignedTier === 'INTERMEDIATE' || assignedTier === 'ADVANCED' || isChapCompleted);
  const isIntSkipped =
    hasDiagnosticBeenTaken && (assignedTier === 'ADVANCED' || isChapCompleted);

  const isAdvUnlocked =
    hasDiagnosticBeenTaken && (assignedTier === 'ADVANCED' || isChapCompleted);

  const handleQuizPass = (level: 'beginner' | 'intermediate' | 'advanced') => {
    const nextState = completeQuiz(currentChapter.chapter_id, level);
    if (nextState === 'COMPLETED' || level === 'advanced') {
      setCompletedModalOpen(true);
    }
  };

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
        /* POST-DIAGNOSTIC HEADER */
        <Card variant="white" className="p-6 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="green">✓ Diagnostic Complete</Badge>
              <Badge variant="purple">Active Tier: {assignedTier}</Badge>
            </div>
            <h2 className="text-2xl font-bold color-primary">
              Adaptive Learning Ladder
            </h2>
            <p className="text-sm opacity-80">
              Your topics are dynamically unlocked based on your diagnostic results and quiz completions.
            </p>
          </div>
        </Card>
      )}

      {/* TOPIC SECTIONS: BEGINNER, INTERMEDIATE, ADVANCED */}
      <div className="flex flex-col gap-8">
        {/* TIER 1: BEGINNER TOPICS */}
        <section className={`flex flex-col gap-3 transition-all ${!isBegUnlocked ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              🟢 Beginner Level
              {!isBegUnlocked && <Badge variant="orange">🔒 Locked</Badge>}
              {isBegSkipped && <Badge variant="green">✓ Skipped / Completed</Badge>}
            </h3>
            <span className="text-xs font-semibold opacity-70">Tier 1</span>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x relative">
            {!isBegUnlocked && (
              <div className="absolute inset-0 bg-gray-100/40 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-3xl">
                <div className="clay-badge clay-badge-yellow text-lg font-bold shadow-md">
                  🔒 Locked until Diagnostic Completed
                </div>
              </div>
            )}

            {currentChapter.beginnerTopics.map((topic, topIdx) => (
              <Card
                key={topic.topic_id}
                variant={topic.is_quiz ? 'yellow' : 'white'}
                interactive={isBegUnlocked}
                className="min-w-[280px] max-w-[320px] shrink-0 flex flex-col justify-between p-6 snap-start"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={topic.is_quiz ? 'orange' : 'purple'}>
                      {topic.is_quiz ? '🎯 Tier Quiz' : `Beginner ${topIdx + 1}`}
                    </Badge>
                    <Badge variant={isBegSkipped || topic.is_completed ? 'green' : isBegUnlocked ? 'orange' : 'orange'}>
                      {isBegSkipped || topic.is_completed ? '✓ Done' : isBegUnlocked ? 'Available' : 'Locked'}
                    </Badge>
                  </div>
                  <h4 className="text-xl font-bold mb-2">{topic.topic_name}</h4>
                  <p className="text-sm opacity-80 mb-4">
                    {topic.is_quiz
                      ? 'Pass this quiz to unlock Intermediate topics!'
                      : 'Foundation micro-lesson.'}
                  </p>
                </div>

                {topic.is_quiz ? (
                  <Button
                    variant="warning"
                    size="md"
                    className="w-full flex justify-center"
                    onClick={() => handleQuizPass('beginner')}
                    disabled={!isBegUnlocked}
                  >
                    {isBegSkipped ? 'Retake Quiz' : 'Pass Quiz → Unlock Next Tier'}
                  </Button>
                ) : (
                  <Link
                    href={`/learning/${subjectId}/${chapterId}/${topic.topic_id}/module`}
                    className="no-underline w-full"
                  >
                    <Button variant="secondary" size="md" className="w-full flex justify-center" disabled={!isBegUnlocked}>
                      Start Topic 🚀
                    </Button>
                  </Link>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* TIER 2: INTERMEDIATE TOPICS */}
        <section className={`flex flex-col gap-3 transition-all ${!isIntUnlocked ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              🔵 Intermediate Level
              {!isIntUnlocked && <Badge variant="orange">🔒 Locked</Badge>}
              {isIntSkipped && <Badge variant="green">✓ Skipped / Completed</Badge>}
            </h3>
            <span className="text-xs font-semibold opacity-70">Tier 2</span>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x relative">
            {!isIntUnlocked && (
              <div className="absolute inset-0 bg-gray-100/40 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-3xl">
                <div className="clay-badge clay-badge-yellow text-lg font-bold shadow-md">
                  🔒 {hasDiagnosticBeenTaken ? 'Complete Beginner Quiz to Unlock' : 'Locked until Diagnostic Completed'}
                </div>
              </div>
            )}

            {currentChapter.intermediateTopics.map((topic, topIdx) => (
              <Card
                key={topic.topic_id}
                variant={topic.is_quiz ? 'yellow' : 'blue'}
                interactive={isIntUnlocked}
                className="min-w-[280px] max-w-[320px] shrink-0 flex flex-col justify-between p-6 snap-start"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={topic.is_quiz ? 'orange' : 'yellow'}>
                      {topic.is_quiz ? '🎯 Tier Quiz' : `Intermediate ${topIdx + 1}`}
                    </Badge>
                    <Badge variant={isIntSkipped || topic.is_completed ? 'green' : isIntUnlocked ? 'blue' : 'orange'}>
                      {isIntSkipped || topic.is_completed ? '✓ Done' : isIntUnlocked ? 'Available' : 'Locked'}
                    </Badge>
                  </div>
                  <h4 className="text-xl font-bold mb-2">{topic.topic_name}</h4>
                  <p className="text-sm opacity-80 mb-4">
                    {topic.is_quiz
                      ? 'Pass this quiz to unlock Advanced topics!'
                      : 'Targeted intermediate lesson.'}
                  </p>
                </div>

                {topic.is_quiz ? (
                  <Button
                    variant="warning"
                    size="md"
                    className="w-full flex justify-center"
                    onClick={() => handleQuizPass('intermediate')}
                    disabled={!isIntUnlocked}
                  >
                    {isIntSkipped ? 'Retake Quiz' : 'Pass Quiz → Unlock Advanced'}
                  </Button>
                ) : (
                  <Link
                    href={`/learning/${subjectId}/${chapterId}/${topic.topic_id}/module`}
                    className="no-underline w-full"
                  >
                    <Button variant="white" size="md" className="w-full flex justify-center" disabled={!isIntUnlocked}>
                      Start Topic 🚀
                    </Button>
                  </Link>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* TIER 3: ADVANCED TOPICS */}
        <section className={`flex flex-col gap-3 transition-all ${!isAdvUnlocked ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              🟣 Advanced Level
              {!isAdvUnlocked && <Badge variant="orange">🔒 Locked</Badge>}
              {isChapCompleted && <Badge variant="green">🏆 Mastered</Badge>}
            </h3>
            <span className="text-xs font-semibold opacity-70">Tier 3</span>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x relative">
            {!isAdvUnlocked && (
              <div className="absolute inset-0 bg-gray-100/40 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-3xl">
                <div className="clay-badge clay-badge-yellow text-lg font-bold shadow-md">
                  🔒 {hasDiagnosticBeenTaken ? 'Complete Intermediate Quiz to Unlock' : 'Locked until Diagnostic Completed'}
                </div>
              </div>
            )}

            {currentChapter.advancedTopics.map((topic, topIdx) => (
              <Card
                key={topic.topic_id}
                variant={topic.is_quiz ? 'yellow' : 'purple'}
                interactive={isAdvUnlocked}
                className="min-w-[280px] max-w-[320px] shrink-0 flex flex-col justify-between p-6 snap-start"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={topic.is_quiz ? 'orange' : 'yellow'}>
                      {topic.is_quiz ? '🎯 Final Quiz' : `Advanced ${topIdx + 1}`}
                    </Badge>
                    <Badge variant={isChapCompleted || topic.is_completed ? 'green' : isAdvUnlocked ? 'purple' : 'orange'}>
                      {isChapCompleted || topic.is_completed ? '✓ Mastered' : isAdvUnlocked ? 'Available' : 'Locked'}
                    </Badge>
                  </div>
                  <h4 className="text-xl font-bold mb-2">{topic.topic_name}</h4>
                  <p className="text-sm opacity-80 mb-4">
                    {topic.is_quiz
                      ? 'Pass this final quiz to master the chapter!'
                      : 'High-level challenge lesson.'}
                  </p>
                </div>

                {topic.is_quiz ? (
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full flex justify-center"
                    onClick={() => handleQuizPass('advanced')}
                    disabled={!isAdvUnlocked}
                  >
                    Pass Quiz → Master Chapter 🏆
                  </Button>
                ) : (
                  <Link
                    href={`/learning/${subjectId}/${chapterId}/${topic.topic_id}/module`}
                    className="no-underline w-full"
                  >
                    <Button variant="white" size="md" className="w-full flex justify-center" disabled={!isAdvUnlocked}>
                      Start Topic 🚀
                    </Button>
                  </Link>
                )}
              </Card>
            ))}
          </div>
        </section>
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
            Congratulations! You passed all difficulty quizzes and mastered this chapter! You earned +300 XP and a new Master Badge!
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
