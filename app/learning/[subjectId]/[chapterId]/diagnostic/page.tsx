'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useUserSession, Tier } from '@/lib/store';
import { diagnosticQuestions } from '@/lib/mockData';
import { createClient, getCurrentUserId } from '@/lib/supabase/client';

export default function ChapterDiagnosticPage() {
  const router = useRouter();
  const params = useParams();
  const { role, isLoaded, updateTier, chapterTiers } = useUserSession();

  const subjectId = (params?.subjectId as string) || 'math';
  const chapterId = (params?.chapterId as string) || 'chap_01';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuarded, setIsGuarded] = useState(false);

  const hasCheckedGuardRef = useRef(false);

  // PERMANENT ROUTE GUARDING WITH DYNAMIC USER ID
  useEffect(() => {
    if (!isLoaded || hasCheckedGuardRef.current) return;
    hasCheckedGuardRef.current = true;

    if (role !== 'STUDENT') {
      router.push('/');
      return;
    }

    async function checkDiagnosticGuard() {
      // 1. Check local session tier state first
      const localTier = chapterTiers?.[chapterId];
      if (localTier && (localTier as string) !== 'UNASSIGNED') {
        setIsGuarded(true);
        const targetUrl = `/learning/${subjectId}/${chapterId}`;
        try { router.push(targetUrl); } catch (e) {}
        window.location.href = targetUrl;
        return;
      }

      // 2. Query Supabase chapter_tiers table using dynamic userId
      try {
        const supabase = createClient();
        const userId = await getCurrentUserId();

        const { data } = await supabase
          .from('chapter_tiers')
          .select('assigned_tier')
          .eq('user_id', userId)
          .eq('chapter_id', chapterId)
          .maybeSingle();

        if (data && data.assigned_tier) {
          setIsGuarded(true);
          const targetUrl = `/learning/${subjectId}/${chapterId}`;
          try { router.push(targetUrl); } catch (e) {}
          window.location.href = targetUrl;
          return;
        }
      } catch (e) {
        console.warn('Diagnostic route guard notice: proceeding with evaluation');
      }
    }

    checkDiagnosticGuard();
  }, [isLoaded, role, router, subjectId, chapterId, chapterTiers]);

  if (!isLoaded || role !== 'STUDENT' || isGuarded) {
    return null;
  }

  const currentQuestion = diagnosticQuestions[currentIndex];
  const totalQuestions = diagnosticQuestions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: optionIndex,
    });
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // SCORING ALGORITHM & SUPABASE MUTATION WITH DYNAMIC USER ID
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    let totalPoints = 0;
    diagnosticQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct_index) {
        totalPoints += q.points;
      }
    });

    let assignedTierStr: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' = 'BEGINNER';
    if (totalPoints > 450) {
      assignedTierStr = 'ADVANCED';
    } else if (totalPoints > 200) {
      assignedTierStr = 'INTERMEDIATE';
    } else {
      assignedTierStr = 'BEGINNER';
    }

    try {
      const supabase = createClient();
      const userId = await getCurrentUserId();

      await supabase.from('chapter_tiers').upsert({
        user_id: userId,
        subject_id: subjectId,
        chapter_id: chapterId,
        assigned_tier: assignedTierStr,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase chapter_tiers write notice: proceeding with local session state');
    }

    updateTier(assignedTierStr as Tier, chapterId);

    const targetUrl = `/learning/${subjectId}/${chapterId}`;
    try {
      router.push(targetUrl);
    } catch (e) {}
    window.location.href = targetUrl;
  };

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-white/70 backdrop-blur border border-white/80">
        <div className="flex items-center gap-3">
          <Link href={`/learning/${subjectId}/${chapterId}`}>
            <Button variant="white" size="sm">
              ← Chapter Landing Page
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold color-primary">
              Chapter Diagnostic Evaluation
            </h1>
            <p className="text-xs opacity-75 font-medium">5-Question Baseline Probe</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="warning" size="sm" className="flex items-center gap-2">
            🔍 Doubt Scan
          </Button>
          <Badge variant="blue">
            Question {currentIndex + 1} of {totalQuestions}
          </Badge>
        </div>
      </header>

      {/* Main Diagnostic Quiz UI */}
      <Card variant="white" className="flex flex-col gap-6 p-8">
        <div>
          <div className="flex justify-between items-center text-sm font-bold mb-2">
            <span>Diagnostic Progress</span>
            <span className="color-primary">{progressPercent}%</span>
          </div>
          <ProgressBar progressPercentage={progressPercent} />
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="yellow">
              Question {currentIndex + 1} ({currentQuestion.points} pts)
            </Badge>
            <Badge variant="orange">No Retries</Badge>
          </div>

          <h2 className="text-2xl font-bold text-[var(--text-dark)] mb-6">
            {currentQuestion.text}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {currentQuestion.options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentIndex] === optIdx;
              return (
                <Button
                  key={optIdx}
                  variant={isSelected ? 'secondary' : 'white'}
                  size="lg"
                  className="w-full text-left flex items-center gap-3 p-4 justify-start cursor-pointer"
                  onClick={() => handleOptionSelect(optIdx)}
                >
                  <span className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-sm shrink-0">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="text-lg font-bold">{option}</span>
                </Button>
              );
            })}
          </div>

          <div className="flex justify-end items-center border-t border-gray-100 pt-6">
            {currentIndex < totalQuestions - 1 ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
                disabled={selectedAnswers[currentIndex] === undefined}
                className="cursor-pointer"
              >
                Next Question →
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="lg"
                onClick={handleSubmit}
                disabled={selectedAnswers[currentIndex] === undefined || isSubmitting}
                className="cursor-pointer"
              >
                {isSubmitting ? 'Evaluating...' : 'Submit Diagnostic ✨'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </main>
  );
}
