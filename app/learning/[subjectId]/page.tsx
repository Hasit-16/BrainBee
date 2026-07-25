'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useUserSession } from '@/lib/store';
import { mockData, Subject } from '@/lib/mockData';

export default function SubjectViewPage() {
  const router = useRouter();
  const params = useParams();
  const { role, isLoaded } = useUserSession();

  const subjectId = (params?.subjectId as string) || 'math';

  useEffect(() => {
    if (isLoaded && role !== 'STUDENT') {
      router.push('/');
    }
  }, [isLoaded, role, router]);

  if (!isLoaded || role !== 'STUDENT') {
    return null;
  }

  // Find subject matching params or fallback to first subject
  const currentSubject: Subject =
    mockData.subjects.find((s) => s.subject_id === subjectId) ||
    mockData.subjects[0];

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header Bar with Doubt Scan & Profile Icon */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-white/70 backdrop-blur border border-white/80">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/student">
            <Button variant="white" size="sm">
              ← Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{currentSubject.icon}</span>
            <h1 className="text-2xl font-bold color-primary">
              {currentSubject.subject_name}
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

      {/* Chapters & Horizontal Topic Cards Layout */}
      <div className="flex flex-col gap-8">
        {currentSubject.chapters.map((chapter, chapIdx) => (
          <section key={chapter.chapter_id} className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2">
                <Badge variant="blue">Chapter {chapIdx + 1}</Badge>
                <h2 className="text-2xl font-bold">{chapter.chapter_name}</h2>
              </div>
              <Badge variant="yellow">{chapter.topics.length} Topics</Badge>
            </div>

            {/* Horizontal Row of Topic Cards */}
            <div className="flex gap-6 overflow-x-auto pb-4 pt-2 snap-x">
              {chapter.topics.map((topic, topIdx) => (
                <Card
                  key={topic.topic_id}
                  variant="white"
                  interactive
                  className="min-w-[280px] max-w-[320px] shrink-0 flex flex-col justify-between p-6 snap-start"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="purple">Topic {topIdx + 1}</Badge>
                      <Badge variant={topic.is_completed ? 'green' : 'orange'}>
                        {topic.is_completed ? '✓ Completed' : 'Diagnostic Pending'}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{topic.topic_name}</h3>
                    <p className="text-sm opacity-80 mb-4">
                      {topic.is_completed
                        ? 'Mastered topic! Review diagnostic or lesson.'
                        : '5-question baseline assessment ready.'}
                    </p>
                  </div>

                  <Link
                    href={`/learning/${currentSubject.subject_id}/${chapter.chapter_id}/${topic.topic_id}/diagnostic`}
                    className="no-underline w-full"
                  >
                    <Button
                      variant={topic.is_completed ? 'white' : 'secondary'}
                      size="md"
                      className="w-full flex items-center justify-center"
                    >
                      🚀 Take Diagnostic Test
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
