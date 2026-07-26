'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useUserSession } from '@/lib/store';
import { mockData, Subject, Chapter } from '@/lib/mockData';
import { createClient, CURRENT_USER_ID } from '@/lib/supabase/client';

export default function LessonModulePlaceholderPage() {
  const router = useRouter();
  const params = useParams();
  const { role, isLoaded, completedQuizTopics } = useUserSession();

  const subjectId = (params?.subjectId as string) || 'math';
  const chapterId = (params?.chapterId as string) || 'chap_01';
  const topicId = (params?.topicId as string) || 'top_beg_01';

  const [supabaseIsCompleted, setSupabaseIsCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoaded && role !== 'STUDENT') {
      router.push('/');
    }
  }, [isLoaded, role, router]);

  // Query topic_progress table in Supabase for CURRENT_USER_ID and topicId
  useEffect(() => {
    async function fetchTopicProgress() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('topic_progress')
          .select('is_completed')
          .eq('user_id', CURRENT_USER_ID)
          .eq('topic_id', topicId)
          .maybeSingle();

        if (data && typeof data.is_completed === 'boolean') {
          setSupabaseIsCompleted(data.is_completed);
        }
      } catch (e) {
        console.warn('Supabase topic_progress notice: falling back to local session state');
      }
    }
    fetchTopicProgress();
  }, [topicId]);

  if (!isLoaded || role !== 'STUDENT') {
    return null;
  }

  // Calculate next topic in chapter for dynamic routing
  const currentSubject: Subject =
    mockData.subjects.find((s) => s.subject_id === subjectId) ||
    mockData.subjects[0];

  const currentChapter: Chapter =
    currentSubject.chapters.find((c) => c.chapter_id === chapterId) ||
    currentSubject.chapters[0];

  const allTopicsInChapter = [
    ...(currentChapter.beginnerTopics || []),
    ...(currentChapter.intermediateTopics || []),
    ...(currentChapter.advancedTopics || []),
  ];

  const currentTopicIndex = allTopicsInChapter.findIndex((t) => t.topic_id === topicId);
  const nextTopic =
    currentTopicIndex !== -1 && currentTopicIndex < allTopicsInChapter.length - 1
      ? allTopicsInChapter[currentTopicIndex + 1]
      : null;

  const nextTopicUrl = nextTopic
    ? `/learning/${subjectId}/${chapterId}/${nextTopic.topic_id}/module`
    : `/learning/${subjectId}/${chapterId}`;

  // Check completion status from Supabase primary, LocalStorage session fallback
  const isCompleted =
    typeof supabaseIsCompleted === 'boolean'
      ? supabaseIsCompleted
      : Boolean(completedQuizTopics?.[topicId]);

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl">
        <Card variant="white" className="p-8 text-center flex flex-col items-center gap-6">
          <div className="text-6xl animate-bounce">🚧</div>

          <div>
            <Badge variant={isCompleted ? 'green' : 'yellow'} className="mb-3">
              {isCompleted ? '✓ Topic Completed' : 'Module Placeholder'}
            </Badge>
            <h1 className="text-3xl font-extrabold color-primary mb-2">
              Lesson Module Content (Under Construction)
            </h1>
            <p className="text-sm opacity-80 max-w-md mx-auto">
              Topic: <span className="font-bold">{topicId}</span> in Chapter <span className="font-bold">{chapterId}</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center pt-2">
            <Link href={`/learning/${subjectId}/${chapterId}`} className="no-underline w-full sm:w-auto flex-1">
              <Button variant="white" size="lg" className="w-full flex justify-center">
                Return to Chapter 👈
              </Button>
            </Link>

            {/* STEP 1: If completed is true, render Proceed to Next Topic. Otherwise, render Proceed to Quiz */}
            {!isCompleted ? (
              <Link href={`/learning/${subjectId}/${chapterId}/${topicId}/quiz`} className="no-underline w-full sm:w-auto flex-1">
                <Button variant="secondary" size="lg" className="w-full flex justify-center">
                  Proceed to Quiz 🎯
                </Button>
              </Link>
            ) : (
              <Link href={nextTopicUrl} className="no-underline w-full sm:w-auto flex-1">
                <Button variant="secondary" size="lg" className="w-full flex justify-center">
                  Proceed to Next Topic 🚀
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
