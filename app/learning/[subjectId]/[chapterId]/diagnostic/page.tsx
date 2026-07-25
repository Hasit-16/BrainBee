'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useUserSession, Tier } from '@/lib/store';
import { diagnosticQuestions } from '@/lib/mockData';

export default function ChapterDiagnosticPage() {
  const router = useRouter();
  const params = useParams();
  const { role, isLoaded, updateTier } = useUserSession();

  const subjectId = (params?.subjectId as string) || 'math';
  const chapterId = (params?.chapterId as string) || 'chap_01';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [assignedTier, setAssignedTier] = useState<Tier>('UNASSIGNED');

  useEffect(() => {
    if (isLoaded && role !== 'STUDENT') {
      router.push('/');
    }
  }, [isLoaded, role, router]);

  if (!isLoaded || role !== 'STUDENT') {
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

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    let totalPoints = 0;
    diagnosticQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct_index) {
        totalPoints += q.points;
      }
    });

    let tier: Tier = 'FOUNDATION';
    if (totalPoints > 450) {
      tier = 'ADVANCED';
    } else if (totalPoints > 200) {
      tier = 'BEGINNER';
    } else {
      tier = 'FOUNDATION';
    }

    updateTier(tier, chapterId);
    setAssignedTier(tier);
    setIsCompleted(true);
  };

  const getTierColor = (tier: Tier) => {
    switch (tier) {
      case 'ADVANCED':
        return 'purple';
      case 'BEGINNER':
        return 'green';
      default:
        return 'yellow';
    }
  };

  const getTierBadgeIcon = (tier: Tier) => {
    switch (tier) {
      case 'ADVANCED':
        return '🚀';
      case 'BEGINNER':
        return '🌟';
      default:
        return '🌱';
    }
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
              Chapter Diagnostic Assessment
            </h1>
            <p className="text-xs opacity-75 font-medium">5-Question Baseline Assessment</p>
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

      {/* Main Diagnostic Loop */}
      {!isCompleted ? (
        <Card variant="white" className="flex flex-col gap-6 p-8">
          <div>
            <div className="flex justify-between items-center text-sm font-bold mb-2">
              <span>Assessment Progress</span>
              <span className="color-primary">{progressPercent}%</span>
            </div>
            <ProgressBar progressPercentage={progressPercent} />
          </div>

          <div className="pt-2">
            <Badge variant="yellow" className="mb-3">
              Question {currentIndex + 1}
            </Badge>
            <h2 className="text-2xl font-bold mb-6">
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
                    className="w-full text-left flex items-center gap-3 p-4 justify-start"
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

            <div className="flex justify-between items-center border-t border-gray-100 pt-6">
              <Button
                variant="white"
                size="md"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>

              {currentIndex < totalQuestions - 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  disabled={selectedAnswers[currentIndex] === undefined}
                >
                  Next Question →
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={selectedAnswers[currentIndex] === undefined}
                >
                  Submit Assessment ✨
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        /* Gamified Completion Card */
        <Card variant="white" className="flex flex-col items-center text-center p-10 gap-6">
          <div className="text-6xl animate-bounce">
            {getTierBadgeIcon(assignedTier)}
          </div>

          <div>
            <Badge variant="green" className="mb-3">
              Diagnostic Complete!
            </Badge>
            <h2 className="text-3xl font-extrabold color-primary mb-2">
              Level Assessment Unlocked
            </h2>
            <p className="text-base opacity-85 max-w-lg mx-auto">
              Your diagnostic has evaluated your knowledge. Your personalized learning tier for this chapter is ready!
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-gray-100 bg-gray-50 flex flex-col items-center gap-2">
            <span className="text-sm font-bold opacity-70 uppercase tracking-wider">
              Assigned Cognitive Tier
            </span>
            <Badge variant={getTierColor(assignedTier)} className="text-2xl px-6 py-2">
              {assignedTier} TIER
            </Badge>
          </div>

          <Link
            href={`/learning/${subjectId}/${chapterId}`}
            className="no-underline w-full max-w-sm"
          >
            <Button variant="secondary" size="lg" className="w-full flex justify-center">
              Proceed to Chapter Landing Page 🚀
            </Button>
          </Link>
        </Card>
      )}
    </main>
  );
}
