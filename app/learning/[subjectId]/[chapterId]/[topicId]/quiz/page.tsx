'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useUserSession, saveQuizCache, getQuizCache, clearQuizCache } from '@/lib/store';
import { quizQuestions, QuizQuestion } from '@/lib/mockData';
import { createClient, CURRENT_USER_ID } from '@/lib/supabase/client';

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
  const topicId = (params?.topicId as string) || 'quiz_beg_01';

  // State Management
  const [initialPass] = useState<QuizQuestion[]>(quizQuestions);
  const [retryPass, setRetryPass] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSecondPass, setIsSecondPass] = useState(false);
  const [isIntermission, setIsIntermission] = useState(false);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showSecondPassSolution, setShowSecondPassSolution] = useState(false);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [perfectScoreFirstPass, setPerfectScoreFirstPass] = useState(false);
  const [isGuarded, setIsGuarded] = useState(false);

  const hasInitializedRef = useRef(false);

  // STEP 2: ENFORCE QUIZ ROUTE GUARDING
  useEffect(() => {
    if (!isLoaded || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    if (role !== 'STUDENT') {
      router.push('/');
      return;
    }

    async function verifyRouteGuard() {
      // 1. Check local session completion first for instant guard
      const isLocallyCompleted = Boolean(completedQuizTopics?.[topicId]);
      if (isLocallyCompleted) {
        setIsGuarded(true);
        clearQuizCache(topicId);
        clearStoreProgress(topicId);
        const targetUrl = `/learning/${subjectId}/${chapterId}`;
        try { router.push(targetUrl); } catch (e) {}
        window.location.href = targetUrl;
        return;
      }

      // 2. Query Supabase topic_progress for server-side route guard
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('topic_progress')
          .select('is_completed')
          .eq('user_id', CURRENT_USER_ID)
          .eq('topic_id', topicId)
          .maybeSingle();

        if (data && data.is_completed === true) {
          setIsGuarded(true);
          clearQuizCache(topicId);
          clearStoreProgress(topicId);
          const targetUrl = `/learning/${subjectId}/${chapterId}`;
          try { router.push(targetUrl); } catch (e) {}
          window.location.href = targetUrl;
          return;
        }
      } catch (e) {
        console.warn('Route guard notice: proceeding with standard mount');
      }

      // 3. If NOT completed, check for mid-quiz cache
      const cachedState = getQuizCache(topicId);
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
        const saved = getQuizProgress(topicId);
        if (
          saved &&
          saved.isIntermission === true &&
          Array.isArray(saved.retryPass) &&
          saved.retryPass.length > 0
        ) {
          setRetryPass(saved.retryPass);
          setIsIntermission(true);
        } else {
          clearQuizCache(topicId);
          clearStoreProgress(topicId);
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
  }, [isLoaded, role, router, topicId, chapterId, subjectId, completedQuizTopics, clearStoreProgress, getQuizProgress]);

  if (!isLoaded || role !== 'STUDENT' || isGuarded) {
    return null;
  }

  const activeQuestions = isSecondPass ? retryPass : initialPass;
  const currentQuestion = activeQuestions[currentIndex];

  const handleSelectOption = (optIdx: number) => {
    if (selectedOption !== null || showSecondPassSolution) return;
    setSelectedOption(optIdx);

    const isCorrect = optIdx === currentQuestion.correct_index;

    if (!isSecondPass) {
      // FIRST PASS LOGIC
      const newRetryQueue = !isCorrect ? [...retryPass, currentQuestion] : retryPass;
      if (!isCorrect) {
        setRetryPass(newRetryQueue);
      }

      saveQuizCache(topicId, {
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
          if (newRetryQueue.length === 0) {
            setPerfectScoreFirstPass(true);
            finishQuiz();
          } else {
            setIsIntermission(true);
            setSelectedOption(null);
          }
        }
      }, 400);
    } else {
      // SECOND PASS LOGIC
      saveQuizCache(topicId, {
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

  const advanceSecondPass = () => {
    setSelectedOption(null);
    setShowSecondPassSolution(false);

    if (currentIndex < retryPass.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      saveQuizCache(topicId, {
        retryPass,
        currentIndex: nextIndex,
        isSecondPass: true,
        isIntermission: false,
      });
    } else {
      finishQuiz();
    }
  };

  const startSecondPass = () => {
    setIsIntermission(false);
    setIsSecondPass(true);
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowSecondPassSolution(false);

    saveQuizCache(topicId, {
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

  const handleExitOnIntermission = () => {
    saveQuizProgress(topicId, retryPass);
    saveQuizCache(topicId, {
      retryPass,
      currentIndex,
      isSecondPass: false,
      isIntermission: true,
    });
    handleGoToChapter();
  };

  // COMPLETION LOGIC
  const finishQuiz = async () => {
    try {
      const supabase = createClient();
      await supabase.from('topic_progress').upsert({
        user_id: CURRENT_USER_ID,
        topic_id: topicId,
        is_completed: true,
        updated_at: new Date().toISOString(),
      });

      await supabase.from('quiz_results').insert({
        user_id: CURRENT_USER_ID,
        topic_id: topicId,
        subject_id: subjectId,
        chapter_id: chapterId,
        completed_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase completion write notice: proceeding with local session state');
    }

    clearQuizCache(topicId);
    clearStoreProgress(topicId);

    setRetryPass([]);
    setIsIntermission(false);

    let quizLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (topicId.includes('int')) quizLevel = 'intermediate';
    if (topicId.includes('adv')) quizLevel = 'advanced';

    completeQuiz(chapterId, quizLevel, topicId);
    setIsQuizFinished(true);
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
            onClick={handleGoToChapter}
            className="cursor-pointer"
          >
            ← Chapter Landing Page
          </Button>
          <div>
            <h1 className="text-xl font-bold color-primary">
              Adaptive Chapter Quiz
            </h1>
            <p className="text-xs opacity-75 font-medium">
              {isSecondPass
                ? '🔁 Pass 2: Retry Incorrect Questions'
                : isIntermission
                ? '📊 Intermission Summary'
                : '✏️ Pass 1: Standard Evaluation'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="warning" size="sm" className="flex items-center gap-2">
            🔍 Doubt Scan
          </Button>
          {!isQuizFinished && !isIntermission && (
            <Badge variant={isSecondPass ? 'orange' : 'blue'}>
              {isSecondPass
                ? `Retry ${currentIndex + 1} of ${retryPass.length}`
                : `Question ${currentIndex + 1} of ${initialPass.length}`}
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
              Quiz Evaluation Summary
            </h2>
            <p className="text-base opacity-85 max-w-md mx-auto">
              You completed the first pass with <span className="font-bold color-primary">{initialPass.length - retryPass.length}</span> correct answer(s) out of {initialPass.length}. You have <span className="font-bold text-amber-600">{retryPass.length}</span> question(s) to retry.
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
              Retry Incorrect Questions 🔁
            </Button>
          </div>
        </Card>
      ) : !isQuizFinished ? (
        /* QUIZ QUESTION VIEW */
        <Card variant="white" className="flex flex-col gap-6 p-8">
          <div>
            <div className="flex justify-between items-center text-sm font-bold mb-2">
              <span>{isSecondPass ? 'Retry Pass Progress' : 'First Pass Progress'}</span>
              <span className="color-primary">{progressPercent}%</span>
            </div>
            <ProgressBar progressPercentage={progressPercent} />
          </div>

          {currentQuestion && (
            <div className="pt-2 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <Badge variant={isSecondPass ? 'orange' : 'purple'}>
                  {isSecondPass ? '🔁 Retry Question' : `Question ${currentIndex + 1}`}
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
                      Next Question →
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      ) : (
        /* COMPLETION OVERLAY */
        <Card variant="white" className="flex flex-col items-center text-center p-10 gap-6">
          <div className="text-6xl animate-bounce">🏆</div>

          <div>
            <Badge variant="green" className="mb-3">
              {perfectScoreFirstPass ? 'Perfect 10/10 Score!' : 'Quiz Completed!'}
            </Badge>
            <h2 className="text-3xl font-extrabold color-primary mb-2">
              Next Difficulty Tier Unlocked!
            </h2>
            <p className="text-base opacity-85 max-w-lg mx-auto">
              {perfectScoreFirstPass
                ? 'Outstanding! You scored 10/10 on the first pass! Your next difficulty tier has been unlocked automatically.'
                : 'Great job completing both passes! Your next difficulty tier has been unlocked on your Chapter Landing Page.'}
            </p>
          </div>

          <Button
            variant="secondary"
            size="lg"
            className="w-full max-w-sm flex justify-center text-lg cursor-pointer"
            onClick={handleGoToChapter}
          >
            Return to Chapter 👈
          </Button>
        </Card>
      )}
    </main>
  );
}
