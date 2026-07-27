'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useUserSession } from '@/lib/store';
import { mockData, Subject, Chapter } from '@/lib/mockData';
import { createClient, getCurrentUserId } from '@/lib/supabase/client';

export default function LevelModulePage() {
  const router = useRouter();
  const params = useParams();
  const { role, isLoaded, completedQuizTopics } = useUserSession();

  const subjectId = (params?.subjectId as string) || 'math';
  const chapterId = (params?.chapterId as string) || 'chap_01';
  const levelId = (params?.levelId as string) || 'BEGINNER';

  const [supabaseIsCompleted, setSupabaseIsCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoaded && role !== 'STUDENT') {
      router.push('/');
    }
  }, [isLoaded, role, router]);

  // Query level_progress table in Supabase for dynamic userId and levelId
  useEffect(() => {
    async function fetchLevelProgress() {
      try {
        const supabase = createClient();
        const userId = await getCurrentUserId();

        const { data } = await supabase
          .from('level_progress')
          .select('is_completed')
          .eq('user_id', userId)
          .eq('chapter_id', chapterId)
          .eq('level_id', levelId)
          .maybeSingle();

        if (data && typeof data.is_completed === 'boolean') {
          setSupabaseIsCompleted(data.is_completed);
        } else {
          // Fallback query on topic_progress for backward compatibility
          const { data: legacyData } = await supabase
            .from('topic_progress')
            .select('is_completed')
            .eq('user_id', userId)
            .eq('topic_id', levelId)
            .maybeSingle();
          if (legacyData && typeof legacyData.is_completed === 'boolean') {
            setSupabaseIsCompleted(legacyData.is_completed);
          }
        }
      } catch (e) {
        console.warn('Supabase level_progress notice: falling back to local session state');
      }
    }
    fetchLevelProgress();
  }, [chapterId, levelId]);

  if (!isLoaded || role !== 'STUDENT') {
    return null;
  }

  const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  const currentIdx = levels.indexOf(levelId.toUpperCase());
  const nextLevel = currentIdx !== -1 && currentIdx < levels.length - 1 ? levels[currentIdx + 1] : null;

  const nextUrl = nextLevel
    ? `/learning/${subjectId}/${chapterId}/${nextLevel}/module`
    : `/learning/${subjectId}/${chapterId}`;

  const isCompleted =
    typeof supabaseIsCompleted === 'boolean'
      ? supabaseIsCompleted
      : Boolean(completedQuizTopics?.[levelId]);

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl">
        <Card variant="white" className="p-8 text-center flex flex-col items-center gap-6">
          <div className="text-6xl animate-bounce">🚧</div>

          <div>
            <Badge variant={isCompleted ? 'green' : 'yellow'} className="mb-3">
              {isCompleted ? '✓ Level Completed' : `${levelId.toUpperCase()} Module`}
            </Badge>
            <h1 className="text-3xl font-extrabold color-primary mb-2">
              Adaptive Lesson Module
            </h1>
            <p className="text-sm opacity-80 max-w-md mx-auto">
              Level: <span className="font-bold">{levelId}</span> in Chapter <span className="font-bold">{chapterId}</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center pt-2">
            <Link href={`/learning/${subjectId}/${chapterId}`} className="no-underline w-full sm:w-auto flex-1">
              <Button variant="white" size="lg" className="w-full flex justify-center">
                Return to Chapter 👈
              </Button>
            </Link>

            {!isCompleted ? (
              <Link href={`/learning/${subjectId}/${chapterId}/${levelId}/quiz`} className="no-underline w-full sm:w-auto flex-1">
                <Button variant="secondary" size="lg" className="w-full flex justify-center">
                  Proceed to Quiz 🎯
                </Button>
              </Link>
            ) : (
              <Link href={nextUrl} className="no-underline w-full sm:w-auto flex-1">
                <Button variant="secondary" size="lg" className="w-full flex justify-center">
                  Proceed to Next Level 🚀
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
