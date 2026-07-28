'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useUserSession, saveQuizCache, getQuizCache, clearQuizCache } from '@/lib/store';
import { getQuizQuestions, QuizQuestion, badgeDefinitions, BadgeDefinition } from '@/lib/mockData';
import { createClient, getCurrentUserId } from '@/lib/supabase/client';

import { playSound } from '@/lib/sound';

import { DoubtScannerModal } from '@/components/DoubtScannerModal';

export default function TwoPassQuizPage() {
  const router = useRouter();
  const params = useParams();
  const {
    role,
    isLoaded,
    completeQuiz,
    saveQuizProgress,
    getQuizProgress,
    clearQuizProgress: clearStoreProgress,
    completedQuizTopics,
  } = useUserSession();

  const subjectId = (params?.subjectId as string) || 'math';
  const chapterId = (params?.chapterId as string) || 'chap_01';
  const levelId = (params?.levelId as string) || (params?.topicId as string) || 'BEGINNER';

  // State Management: Dynamically loaded from Quiz.json
  const [initialPass] = useState<QuizQuestion[]>(() => getQuizQuestions(subjectId, chapterId, levelId));
  const [retryPass, setRetryPass] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSecondPass, setIsSecondPass] = useState(false);
  const [isIntermission, setIsIntermission] = useState(false);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showSecondPassSolution, setShowSecondPassSolution] = useState(false);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [perfectScoreFirstPass, setPerfectScoreFirstPass] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<BadgeDefinition[]>([]);
  const [isGuarded, setIsGuarded] = useState(false);
  const [isDoubtModalOpen, setIsDoubtModalOpen] = useState(false);

  const hasInitializedRef = useRef(false);

  // ROUTE GUARDING & CACHE LOAD WITH DYNAMIC USER ID
  useEffect(() => {
    if (!isLoaded || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    if (role !== 'STUDENT') {
      router.push('/');
      return;
    }

    async function verifyRouteGuard() {
      const cachedState = getQuizCache(levelId);
      if (cachedState && typeof cachedState === 'object') {
        if (Array.isArray(cachedState.retryPass)) {
          setRetryPass(cachedState.retryPass);
        }
        if (typeof cachedState.currentIndex === 'number') {
          setCurrentIndex(cachedState.currentIndex);
        }
        if (typeof cachedState.isSecondPass === 'boolean') {
          setIsSecondPass(cachedState.isSecondPass);
        }
        if (typeof cachedState.isIntermission === 'boolean') {
          setIsIntermission(cachedState.isIntermission);
        }
      } else {
        const saved = getQuizProgress(levelId);
        if (
          saved &&
          saved.isIntermission === true &&
          Array.isArray(saved.retryPass) &&
          saved.retryPass.length > 0
        ) {
          setRetryPass(saved.retryPass);
          setIsIntermission(true);
        } else {
          clearQuizCache(levelId);
          clearStoreProgress(levelId);
          setRetryPass([]);
          setIsIntermission(false);
          setIsSecondPass(false);
          setCurrentIndex(0);
          setSelectedOption(null);
          setShowSecondPassSolution(false);
          setIsQuizFinished(false);
        }
      }
    }

    verifyRouteGuard();
  }, [isLoaded, role, router, levelId, chapterId, subjectId, completedQuizTopics, clearStoreProgress, getQuizProgress]);

  if (!isLoaded || role !== 'STUDENT' || isGuarded) {
    return null;
  }

  const activeQuestions = isSecondPass ? retryPass : initialPass;
  const currentQuestion = activeQuestions[currentIndex];

  const handleSelectOption = (optIdx: number) => {
    if (selectedOption !== null || showSecondPassSolution) return;
    setSelectedOption(optIdx);

    const isCorrect = optIdx === currentQuestion.correct_index;
    playSound(isCorrect ? 'correct' : 'wrong');

    if (!isSecondPass) {
      const newRetryQueue = !isCorrect ? [...retryPass, currentQuestion] : retryPass;
      if (!isCorrect) {
        setRetryPass(newRetryQueue);
      }

      saveQuizCache(levelId, {
        retryPass: newRetryQueue,
        currentIndex: currentIndex + 1,
        isSecondPass: false,
        isIntermission: currentIndex === initialPass.length - 1 && newRetryQueue.length > 0,
      });

      setTimeout(() => {
        if (currentIndex < initialPass.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedOption(null);
        } else {
          handleFirstPassCompletion(newRetryQueue);
        }
      }, 400);
    } else {
      saveQuizCache(levelId, {
        retryPass,
        currentIndex,
        isSecondPass: true,
        isIntermission: false,
      });

      if (isCorrect) {
        setTimeout(() => {
          advanceSecondPass();
        }, 400);
      } else {
        setShowSecondPassSolution(true);
      }
    }
  };

  // FIRST PASS COMPLETION LOGIC WITH DYNAMIC USER ID
  const handleFirstPassCompletion = async (retryQueue: QuizQuestion[]) => {
    const firstAttemptScore = initialPass.length - retryQueue.length;

    try {
      const supabase = createClient();
      const userId = await getCurrentUserId();

      await supabase.from('quiz_results').insert({
        user_id: userId,
        subject_id: subjectId,
        chapter_id: chapterId,
        level_id: levelId,
        first_attempt_score: firstAttemptScore,
        total_questions: initialPass.length,
        completed_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase quiz_results insert notice: proceeding with evaluation');
    }

    if (retryQueue.length === 0) {
      setPerfectScoreFirstPass(true);
      await triggerGuaranteedProgression(true);
    } else {
      setIsIntermission(true);
      setSelectedOption(null);
    }
  };

  const advanceSecondPass = () => {
    setSelectedOption(null);
    setShowSecondPassSolution(false);

    if (currentIndex < retryPass.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      saveQuizCache(levelId, {
        retryPass,
        currentIndex: nextIndex,
        isSecondPass: true,
        isIntermission: false,
      });
    } else {
      triggerGuaranteedProgression(false);
    }
  };

  const startSecondPass = () => {
    setIsIntermission(false);
    setIsSecondPass(true);
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowSecondPassSolution(false);

    saveQuizCache(levelId, {
      retryPass,
      currentIndex: 0,
      isSecondPass: true,
      isIntermission: false,
    });
  };

  const handleGoToChapter = () => {
    const targetUrl = `/learning/${subjectId}/${chapterId}`;
    try {
      router.push(targetUrl);
    } catch (e) {}
    window.location.href = targetUrl;
  };

  const handlePauseAndExitQuiz = () => {
    if (!isQuizFinished) {
      saveQuizProgress(levelId, retryPass);
      saveQuizCache(levelId, {
        retryPass,
        currentIndex,
        isSecondPass,
        isIntermission,
      });
    }
    handleGoToChapter();
  };

  const handleExitOnIntermission = () => {
    saveQuizProgress(levelId, retryPass);
    saveQuizCache(levelId, {
      retryPass,
      currentIndex,
      isSecondPass: false,
      isIntermission: true,
    });
    handleGoToChapter();
  };

  // GUARANTEED PROGRESSION & BADGE AWARDING WITH DYNAMIC USER ID
  const triggerGuaranteedProgression = async (isFirstPassFlawless: boolean) => {
    const badgeIdsToAward: string[] = [];
    if (isFirstPassFlawless || perfectScoreFirstPass) {
      badgeIdsToAward.push('FLAWLESS');
    } else {
      badgeIdsToAward.push('PERSEVERANCE');
    }

    const lvlUpper = levelId.toUpperCase();
    if (lvlUpper.includes('ADV')) {
      badgeIdsToAward.push('ADVANCED_MASTER');
    }

    try {
      const supabase = createClient();
      const userId = await getCurrentUserId();

      await supabase.from('level_progress').upsert({
        user_id: userId,
        chapter_id: chapterId,
        level_id: levelId,
        is_completed: true,
        updated_at: new Date().toISOString(),
      });

      if (badgeIdsToAward.length > 0) {
        await supabase.from('student_badges').upsert(
          badgeIdsToAward.map((bId) => ({
            user_id: userId,
            badge_id: bId,
            earned_at: new Date().toISOString(),
          }))
        );
      }
    } catch (e) {
      console.warn('Supabase completion & badge write notice: proceeding locally');
    }

    const awardedDefs = badgeIdsToAward
      .map((bId) => badgeDefinitions[bId])
      .filter(Boolean);
    setEarnedBadges(awardedDefs);

    clearQuizCache(levelId);
    clearStoreProgress(levelId);

    setRetryPass([]);
    setIsIntermission(false);

    let quizLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (lvlUpper.includes('INT')) quizLevel = 'intermediate';
    if (lvlUpper.includes('ADV')) quizLevel = 'advanced';

    completeQuiz(chapterId, quizLevel, levelId);
    setIsQuizFinished(true);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.warn('Confetti notice: canvas animation complete');
    }
  };

  const progressPercent = isQuizFinished
    ? 100
    : Math.round(
        (((isSecondPass ? initialPass.length + currentIndex : currentIndex) + 1) /
          (initialPass.length + (retryPass.length || 1))) *
          100
      );

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-white/70 backdrop-blur border border-white/80">
        <div className="flex items-center gap-3">
          <Button
            variant="white"
            size="sm"
            onClick={handlePauseAndExitQuiz}
            className="cursor-pointer font-bold"
          >
            👈 Save & Exit to Chapter
          </Button>
          <div>
            <h1 className="text-xl font-bold color-primary">
              Adaptive Level Evaluation
            </h1>
            <p className="text-xs opacity-75 font-medium">
              {isSecondPass
                ? '🔁 Review Phase: Qualitative Reinforcement'
                : isIntermission
                ? '📊 Intermission Summary'
                : '✏️ Standard Evaluation'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="warning"
            size="sm"
            onClick={() => {
              playSound('click');
              setIsDoubtModalOpen(true);
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            🔍 Doubt Scan
          </Button>
          {!isQuizFinished && !isIntermission && (
            <Badge variant={isSecondPass ? 'orange' : 'purple'}>
              {isSecondPass ? 'Needs Review' : 'Evaluation in Progress'}
            </Badge>
          )}
        </div>
      </header>

      {/* INTERMISSION UI */}
      {isIntermission ? (
        <Card variant="white" className="p-8 flex flex-col items-center text-center gap-6">
          <div className="text-5xl animate-bounce">📊</div>

          <div>
            <Badge variant="yellow" className="mb-3">
              First Pass Complete
            </Badge>
            <h2 className="text-3xl font-extrabold color-primary mb-2">
              Evaluation Summary
            </h2>
            <p className="text-base opacity-85 max-w-md mx-auto">
              You completed the standard evaluation! Some concepts require a second review before final tier unlocking.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center pt-2">
            <Button
              variant="white"
              size="lg"
              className="w-full sm:w-auto flex-1 flex justify-center cursor-pointer"
              onClick={handleExitOnIntermission}
            >
              Go Back (Pause & Save) 👈
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto flex-1 flex justify-center cursor-pointer"
              onClick={startSecondPass}
            >
              Review Concepts 🔁
            </Button>
          </div>
        </Card>
      ) : !isQuizFinished ? (
        /* QUIZ QUESTION VIEW */
        <Card variant="white" className="flex flex-col gap-6 p-8">
          <div>
            <div className="flex justify-between items-center text-sm font-bold mb-2">
              <span>{isSecondPass ? 'Concept Review Progress' : 'Evaluation Progress'}</span>
              <Badge variant={isSecondPass ? 'orange' : 'purple'}>
                {isSecondPass ? 'Needs Review' : 'Active'}
              </Badge>
            </div>
            <ProgressBar progressPercentage={progressPercent} />
          </div>

          {currentQuestion && (
            <div className="pt-2 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <Badge variant={isSecondPass ? 'orange' : 'purple'}>
                  {isSecondPass ? '🔁 Review Question' : 'Active Evaluation'}
                </Badge>
                {isSecondPass && (
                  <Badge variant="yellow">Second Chance</Badge>
                )}
              </div>

              <h2 className="text-2xl font-bold text-[var(--text-dark)]">
                {currentQuestion.text}
              </h2>

              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                  showSecondPassSolution ? 'pointer-events-none' : ''
                }`}
              >
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isCorrect = optIdx === currentQuestion.correct_index;

                  let buttonVariant: 'white' | 'secondary' | 'danger' | 'warning' = 'white';
                  if (isSelected) {
                    if (!isSecondPass) {
                      buttonVariant = 'secondary';
                    } else {
                      buttonVariant = isCorrect ? 'secondary' : 'danger';
                    }
                  } else if (showSecondPassSolution && isCorrect) {
                    buttonVariant = 'secondary';
                  }

                  return (
                    <Button
                      key={optIdx}
                      variant={buttonVariant}
                      size="lg"
                      className="w-full text-left flex items-center gap-3 p-4 justify-start cursor-pointer"
                      onClick={() => handleSelectOption(optIdx)}
                      disabled={selectedOption !== null && !isSecondPass}
                    >
                      <span className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-sm shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="text-lg font-bold">{option}</span>
                    </Button>
                  );
                })}
              </div>

              {showSecondPassSolution && (
                <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    <h3 className="text-lg font-bold text-amber-900">
                      Solution Explanation
                    </h3>
                  </div>
                  <p className="text-base text-amber-950 leading-relaxed font-medium">
                    {currentQuestion.solution_explanation}
                  </p>
                  <div className="pt-2 flex justify-end">
                    <Button
                      variant="warning"
                      size="md"
                      onClick={advanceSecondPass}
                      className="px-6 cursor-pointer"
                    >
                      Continue →
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      ) : (
        /* CELEBRATION OVERLAY WITH EARNED BADGES */
        <Card variant="white" className="flex flex-col items-center text-center p-10 gap-6 animate-fade-in border-4 border-yellow-300">
          <div className="text-7xl animate-bounce">🎉</div>

          <div>
            <Badge variant="green" className="mb-3 text-lg px-4 py-1">
              ✓ Mastered & Level Completed
            </Badge>
            <h2 className="text-4xl font-extrabold color-primary mb-2">
              Congratulations!
            </h2>
            <p className="text-base opacity-85 max-w-lg mx-auto">
              You successfully completed all evaluation passes and unlocked your next learning tier!
            </p>
          </div>

          {earnedBadges.length > 0 && (
            <div className="w-full max-w-md p-6 rounded-3xl bg-amber-50 border-2 border-amber-200 flex flex-col gap-4">
              <h3 className="text-lg font-extrabold text-amber-900 flex items-center justify-center gap-2">
                🏆 New Qualitative Badges Earned!
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {earnedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-4 rounded-2xl bg-white border border-amber-300 flex flex-col items-center text-center gap-1 shadow-sm"
                  >
                    <span className="text-3xl">{badge.icon}</span>
                    <span className="font-bold text-sm text-gray-900">{badge.name}</span>
                    <span className="text-xs text-gray-600">{badge.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(() => {
            const levelsSeq = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
            const currentLevelIdx = levelsSeq.indexOf(levelId.toUpperCase());
            const nextLevelId = currentLevelIdx !== -1 && currentLevelIdx < levelsSeq.length - 1 ? levelsSeq[currentLevelIdx + 1] : null;

            return (
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md pt-2">
                {nextLevelId ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full flex justify-center text-lg cursor-pointer font-bold"
                    onClick={() => {
                      const nextUrl = `/learning/${subjectId}/${chapterId}/${nextLevelId}/module`;
                      try { router.push(nextUrl); } catch (e) {}
                      window.location.href = nextUrl;
                    }}
                  >
                    Proceed to {nextLevelId} Lesson 🚀
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full flex justify-center text-lg cursor-pointer font-bold"
                    onClick={handleGoToChapter}
                  >
                    Complete Chapter & View Summary 🏆
                  </Button>
                )}
              </div>
            );
          })()}
        </Card>
      )}
      {/* DOUBT SCANNER MODAL */}
      <DoubtScannerModal
        isOpen={isDoubtModalOpen}
        onClose={() => setIsDoubtModalOpen(false)}
      />
    </main>
  );
}
