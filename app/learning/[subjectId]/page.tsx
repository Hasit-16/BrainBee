'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useUserSession } from '@/lib/store';
import { mockData, Subject } from '@/lib/mockData';

export default function SubjectPage() {
  const router = useRouter();
  const params = useParams();
  const { role, isLoaded, chapterTiers } = useUserSession();

  const subjectId = (params?.subjectId as string) || 'math';

  useEffect(() => {
    if (isLoaded && role !== 'STUDENT') {
      router.push('/');
    }
  }, [isLoaded, role, router]);

  if (!isLoaded || role !== 'STUDENT') {
    return null;
  }

  const currentSubject: Subject =
    mockData.subjects.find((s) => s.subject_id === subjectId) ||
    mockData.subjects[0];

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto flex flex-col gap-8">
      {/* Header Bar */}
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

      {/* Subject Overview Card */}
      <Card variant="white" className="p-6">
        <h2 className="text-3xl font-bold color-primary mb-2">
          {currentSubject.subject_name} Curriculum
        </h2>
        <p className="text-base text-gray-600">
          Select a chapter below to view its adaptive learning modules, diagnostic assessment, and difficulty tiers.
        </p>
      </Card>

      {/* Clean List of Chapter Cards */}
      <section className="flex flex-col gap-6">
        <h3 className="text-2xl font-bold color-primary">Chapters</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentSubject.chapters.map((chapter, idx) => {
            const chapterTierState = chapterTiers[chapter.chapter_id];
            const isCompleted = chapterTierState === 'COMPLETED';

            const totalTopicsCount =
              chapter.beginnerTopics.length +
              chapter.intermediateTopics.length +
              chapter.advancedTopics.length;

            return (
              <Link
                key={chapter.chapter_id}
                href={`/learning/${currentSubject.subject_id}/${chapter.chapter_id}`}
                className="no-underline"
              >
                <Card
                  variant="white"
                  interactive
                  className="h-full flex flex-col justify-between p-6 gap-6"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="blue">Chapter {idx + 1}</Badge>
                      <Badge variant={isCompleted ? 'green' : chapterTierState ? 'purple' : 'yellow'}>
                        {isCompleted ? '🏆 Mastered' : chapterTierState ? `${chapterTierState} ACTIVE` : 'Diagnostic Ready'}
                      </Badge>
                    </div>

                    <h4 className="text-2xl font-extrabold text-[var(--text-dark)] mb-2">
                      {chapter.chapter_name}
                    </h4>

                    <p className="text-sm opacity-80 mb-4">
                      {totalTopicsCount} topics across Beginner, Intermediate, and Advanced tiers.
                    </p>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    <span className="font-bold text-sm color-primary flex items-center gap-1">
                      Enter Chapter Landing Page →
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
