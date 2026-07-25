'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useUserSession } from '@/lib/store';

export default function LessonModulePlaceholderPage() {
  const router = useRouter();
  const params = useParams();
  const { role, isLoaded } = useUserSession();

  const subjectId = (params?.subjectId as string) || 'math';
  const chapterId = (params?.chapterId as string) || 'chap_01';
  const topicId = (params?.topicId as string) || 'top_beg_01';

  useEffect(() => {
    if (isLoaded && role !== 'STUDENT') {
      router.push('/');
    }
  }, [isLoaded, role, router]);

  if (!isLoaded || role !== 'STUDENT') {
    return null;
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl">
        <Card variant="white" className="p-8 text-center flex flex-col items-center gap-6">
          <div className="text-6xl animate-bounce">🚧</div>

          <div>
            <Badge variant="yellow" className="mb-3">
              Module Placeholder
            </Badge>
            <h1 className="text-3xl font-extrabold color-primary mb-2">
              Lesson Module Content (Under Construction)
            </h1>
            <p className="text-sm opacity-80 max-w-md mx-auto">
              Topic: <span className="font-bold">{topicId}</span> in Chapter <span className="font-bold">{chapterId}</span>.
            </p>
          </div>

          <Link href={`/learning/${subjectId}/${chapterId}`} className="no-underline w-full max-w-xs">
            <Button variant="secondary" size="lg" className="w-full flex justify-center">
              Return to Chapter 👈
            </Button>
          </Link>
        </Card>
      </div>
    </main>
  );
}
