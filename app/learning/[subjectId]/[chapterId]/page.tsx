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
import { playSound } from '@/lib/sound';
import { DoubtScannerModal } from '@/components/DoubtScannerModal';
import { BackArrowIcon, SearchIcon, CheckIcon, LockIcon, TrophyIcon } from '@/components/ui/Icons';

export default function ChapterLandingPage() {
  const router = useRouter();
  const params = useParams();
  const { role, isLoaded, chapterTiers, completedQuizTopics } = useUserSession();

  const subjectId = (params?.subjectId as string) || 'math';
  const chapterId = (params?.chapterId as string) || 'chap_01';

  const [completedModalOpen, setCompletedModalOpen] = useState(false);
  const [supabaseTier, setSupabaseTier] = useState<string | null>(null);
  const [completedLevels, setCompletedLevels] = useState<Record<string, boolean>>({});
  const [isDoubtModalOpen, setIsDoubtModalOpen] = useState(false);

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

  // Progressive unlocking rules
  let isBegUnlocked = true;
  let isIntUnlocked = false;
  let isAdvUnlocked = false;

  if (hasDiagnosticBeenTaken) {
    if (assignedTier === 'COMPLETED' || assignedTier === 'ADVANCED' || isAdvCompleted) {
      isBegUnlocked = true;
      isIntUnlocked = true;
      isAdvUnlocked = true;
    } else if (assignedTier === 'INTERMEDIATE') {
      isBegUnlocked = true;
      isIntUnlocked = true;
      isAdvUnlocked = isIntCompleted;
    } else {
      isBegUnlocked = true;
      isIntUnlocked = isBegCompleted || isIntCompleted;
      isAdvUnlocked = isIntCompleted;
    }
  }

  // Any level that is completed is guaranteed to be unlocked
  if (isBegCompleted) isBegUnlocked = true;
  if (isIntCompleted) isIntUnlocked = true;
  if (isAdvCompleted) isAdvUnlocked = true;

  const clayCardFormula = "bg-white/90 backdrop-blur-sm shadow-[10px_20px_30px_rgba(0,0,0,0.05)] border border-white/60 relative overflow-hidden before:absolute before:inset-0 before:shadow-[inset_2px_4px_8px_rgba(255,255,255,0.8)] before:pointer-events-none rounded-[2rem]";

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-800 p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 font-sans">
      {/* Header Bar */}
      <header className={`${clayCardFormula} p-6 flex flex-wrap items-center justify-between gap-6`}>
        <div className="flex items-center gap-4">
          <Link href={`/learning/${currentSubject.subject_id}`} onClick={() => playSound('click')}>
            <button className="bg-gradient-to-b from-slate-100 to-slate-200 text-slate-700 font-bold text-xs rounded-full px-5 py-2.5 shadow-sm border border-white/80 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2">
              <BackArrowIcon />
              <span>{currentSubject.subject_name}</span>
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-blue-100/70 border border-blue-200/60 flex items-center justify-center text-3xl shadow-[inset_2px_4px_6px_rgba(0,0,0,0.06)]">
              {currentSubject.icon}
            </span>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
                {currentChapter.chapter_name}
              </h1>
              <p className="text-xs font-semibold text-slate-500">{currentSubject.standard} • Chapter Module Hub</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playSound('click');
              setIsDoubtModalOpen(true);
            }}
            className="bg-gradient-to-b from-amber-200 to-amber-300 text-amber-900 shadow-[0_6px_12px_rgba(245,158,11,0.3)] border-t border-white/80 rounded-full font-bold text-sm px-5 py-2.5 flex items-center gap-2 cursor-pointer hover:translate-y-0.5 active:translate-y-1 transition-all"
          >
            <SearchIcon />
            <span>Doubt Scan</span>
          </button>
        </div>
      </header>

      {/* PRE-DIAGNOSTIC STATE BANNER */}
      {!hasDiagnosticBeenTaken ? (
        <div className={`${clayCardFormula} p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-blue-400/80`}>
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner shrink-0 border border-blue-100">
              <TrophyIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-amber-100 text-amber-800 font-extrabold text-xs px-3 py-1 rounded-full border border-amber-200">
                  Diagnostic Required
                </span>
                <span className="bg-blue-100 text-blue-700 font-bold text-xs px-3 py-1 rounded-full border border-blue-200">
                  5 Questions
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 mb-1">
                Start Chapter Diagnostic
              </h2>
              <p className="text-sm font-semibold text-slate-600 max-w-xl leading-relaxed">
                Take the 5-question baseline assessment to evaluate your knowledge and unlock your personalized learning tier.
              </p>
            </div>
          </div>

          <Link
            href={`/learning/${subjectId}/${chapterId}/diagnostic`}
            onClick={() => playSound('click')}
            className="no-underline shrink-0 w-full md:w-auto"
          >
            <button className="clay-btn-green w-full md:w-auto">
              Start Chapter Diagnostic
            </button>
          </Link>
        </div>
      ) : (
        /* POST-DIAGNOSTIC HEADER BANNER */
        <div className={`${clayCardFormula} p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6`}>
          <div>
            <div className="flex items-center gap-2 mb-2.5 flex-wrap">
              <span className="bg-emerald-100 text-emerald-700 font-extrabold text-xs px-3.5 py-1 rounded-full border border-emerald-200 shadow-[inset_0px_2px_4px_rgba(0,0,0,0.06)] flex items-center gap-1">
                <CheckIcon />
                <span>Diagnostic Complete</span>
              </span>
              <span className="bg-purple-100 text-purple-700 font-extrabold text-xs px-3.5 py-1 rounded-full border border-purple-200 shadow-[inset_0px_2px_4px_rgba(0,0,0,0.06)]">
                Assigned Tier: {assignedTier}
              </span>
              {isBegCompleted && isIntCompleted && isAdvCompleted && (
                <span className="bg-amber-100 text-amber-800 font-extrabold text-xs px-3.5 py-1 rounded-full border border-amber-200 shadow-[inset_0px_2px_4px_rgba(0,0,0,0.06)] flex items-center gap-1">
                  <TrophyIcon />
                  <span>Chapter Mastered</span>
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">
              {isBegCompleted && isIntCompleted && isAdvCompleted
                ? 'Chapter Mastered & Revision Hub'
                : 'Active Learning Progression'}
            </h2>
            <p className="text-xs md:text-sm font-semibold text-slate-500 max-w-2xl leading-relaxed">
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
              onClick={() => playSound('click')}
              className="no-underline shrink-0 w-full md:w-auto"
            >
              <button className="clay-btn-blue w-full md:w-auto">
                Continue Learning Pipeline
              </button>
            </Link>
          )}
        </div>
      )}

      {/* THREE LEVEL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: BEGINNER LEVEL */}
        <div className={`transition-all ${!isBegUnlocked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div
            className="bg-amber-400 text-white rounded-[2rem] p-6 shadow-[10px_20px_30px_rgba(245,158,11,0.35)] border border-amber-300 relative overflow-hidden before:absolute before:inset-0 before:shadow-[inset_2px_4px_8px_rgba(255,255,255,0.7)] before:pointer-events-none flex flex-col justify-between h-full min-h-[300px]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-white text-amber-900 font-extrabold text-xs px-3.5 py-1 rounded-full shadow-[inset_0px_2px_4px_rgba(0,0,0,0.12)] border border-amber-200">
                  Level 1
                </span>
                <span className="bg-white text-amber-900 font-extrabold text-xs px-3.5 py-1 rounded-full shadow-[inset_0px_2px_4px_rgba(0,0,0,0.12)] border border-amber-200 flex items-center gap-1">
                  {isBegCompleted ? (
                    <>
                      <CheckIcon />
                      <span>Completed</span>
                    </>
                  ) : isBegUnlocked ? (
                    'Unlocked'
                  ) : (
                    <>
                      <LockIcon />
                      <span>Locked</span>
                    </>
                  )}
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-2 drop-shadow-sm">Beginner Level</h3>
              <p className="text-xs font-semibold text-white/95 leading-relaxed mb-6">
                Foundation micro-lessons and evaluation quiz.
              </p>
            </div>

            <Link
              href={`/learning/${subjectId}/${chapterId}/BEGINNER/module`}
              onClick={() => playSound('click')}
              className="no-underline w-full"
            >
              <button
                disabled={!isBegUnlocked}
                className="w-full rounded-full py-3 px-6 bg-white text-amber-900 font-extrabold text-sm shadow-[0_6px_12px_rgba(0,0,0,0.15)] hover:translate-y-0.5 active:translate-y-1 transition-all cursor-pointer border border-white"
              >
                {isBegCompleted ? 'Review Level' : 'Start Level'}
              </button>
            </Link>
          </div>
        </div>

        {/* CARD 2: INTERMEDIATE LEVEL */}
        <div className={`transition-all ${!isIntUnlocked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div
            className="bg-blue-500 text-white rounded-[2rem] p-6 shadow-[10px_20px_30px_rgba(37,99,235,0.35)] border border-blue-400 relative overflow-hidden before:absolute before:inset-0 before:shadow-[inset_2px_4px_8px_rgba(255,255,255,0.6)] before:pointer-events-none flex flex-col justify-between h-full min-h-[300px]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-white text-blue-600 font-extrabold text-xs px-3.5 py-1 rounded-full shadow-[inset_0px_2px_4px_rgba(0,0,0,0.12)] border border-blue-100">
                  Level 2
                </span>
                <span className="bg-white text-blue-600 font-extrabold text-xs px-3.5 py-1 rounded-full shadow-[inset_0px_2px_4px_rgba(0,0,0,0.12)] border border-blue-100 flex items-center gap-1">
                  {isIntCompleted ? (
                    <>
                      <CheckIcon />
                      <span>Completed</span>
                    </>
                  ) : isIntUnlocked ? (
                    'Unlocked'
                  ) : (
                    <>
                      <LockIcon />
                      <span>Locked</span>
                    </>
                  )}
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-2 drop-shadow-sm">Intermediate Level</h3>
              <p className="text-xs font-semibold text-white/95 leading-relaxed mb-6">
                Targeted intermediate lessons and evaluation quiz.
              </p>
            </div>

            <Link
              href={`/learning/${subjectId}/${chapterId}/INTERMEDIATE/module`}
              onClick={() => playSound('click')}
              className="no-underline w-full"
            >
              <button
                disabled={!isIntUnlocked}
                className="w-full rounded-full py-3 px-6 bg-white text-blue-700 font-extrabold text-sm shadow-[0_6px_12px_rgba(0,0,0,0.15)] hover:translate-y-0.5 active:translate-y-1 transition-all cursor-pointer border border-white"
              >
                {isIntCompleted ? 'Review Level' : 'Start Level'}
              </button>
            </Link>
          </div>
        </div>

        {/* CARD 3: ADVANCED LEVEL */}
        <div className={`transition-all ${!isAdvUnlocked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div
            className="bg-purple-500 text-white rounded-[2rem] p-6 shadow-[10px_20px_30px_rgba(147,51,234,0.35)] border border-purple-400 relative overflow-hidden before:absolute before:inset-0 before:shadow-[inset_2px_4px_8px_rgba(255,255,255,0.6)] before:pointer-events-none flex flex-col justify-between h-full min-h-[300px]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-white text-purple-600 font-extrabold text-xs px-3.5 py-1 rounded-full shadow-[inset_0px_2px_4px_rgba(0,0,0,0.12)] border border-purple-100">
                  Level 3
                </span>
                <span className="bg-white text-purple-600 font-extrabold text-xs px-3.5 py-1 rounded-full shadow-[inset_0px_2px_4px_rgba(0,0,0,0.12)] border border-purple-100 flex items-center gap-1">
                  {isAdvCompleted ? (
                    <>
                      <TrophyIcon />
                      <span>Mastered</span>
                    </>
                  ) : isAdvUnlocked ? (
                    'Unlocked'
                  ) : (
                    <>
                      <LockIcon />
                      <span>Locked</span>
                    </>
                  )}
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-2 drop-shadow-sm">Advanced Level</h3>
              <p className="text-xs font-semibold text-white/95 leading-relaxed mb-6">
                High-level challenge lessons and chapter mastery quiz.
              </p>
            </div>

            <Link
              href={`/learning/${subjectId}/${chapterId}/ADVANCED/module`}
              onClick={() => playSound('click')}
              className="no-underline w-full"
            >
              <button
                disabled={!isAdvUnlocked}
                className="w-full rounded-full py-3 px-6 bg-white text-purple-700 font-extrabold text-sm shadow-[0_6px_12px_rgba(0,0,0,0.15)] hover:translate-y-0.5 active:translate-y-1 transition-all cursor-pointer border border-white"
              >
                {isAdvCompleted ? 'Review Level' : 'Start Level'}
              </button>
            </Link>
          </div>
        </div>

      </div>

      {/* Gamified Completion Modal */}
      <Modal
        isOpen={completedModalOpen}
        onClose={() => setCompletedModalOpen(false)}
        title="Chapter Mastered!"
      >
        <div className="p-4 flex flex-col items-center text-center gap-4">
          <p className="text-base text-gray-700 font-medium">
            Congratulations! You have completed all 3 levels for this chapter.
          </p>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setCompletedModalOpen(false)}
          >
            Awesome!
          </Button>
        </div>
      </Modal>

      {/* DOUBT SCANNER MODAL */}
      <DoubtScannerModal
        isOpen={isDoubtModalOpen}
        onClose={() => setIsDoubtModalOpen(false)}
      />
    </main>
  );
}
