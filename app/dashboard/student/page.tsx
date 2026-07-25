'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useUserSession } from '@/lib/store';
import { mockData } from '@/lib/mockData';

export default function StudentDashboard() {
  const router = useRouter();
  const { session, role, isLoaded, logout } = useUserSession();

  useEffect(() => {
    if (isLoaded && role !== 'STUDENT') {
      router.push('/');
    }
  }, [isLoaded, role, router]);

  if (!isLoaded || role !== 'STUDENT') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const { curriculum, student } = mockData;

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Top Navigation & Profile Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold color-primary">BrainBee</h1>
          <Badge variant="blue">Student Dashboard</Badge>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="yellow">⭐ {student.xp} XP</Badge>
          <Badge variant="purple">Tier: {student.tier}</Badge>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Prominent Subject & Standard Header Banner */}
      <Card variant="white" className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="yellow">{curriculum.standard}</Badge>
              <Badge variant="green">Active Curriculum</Badge>
            </div>
            <h2 className="text-4xl font-extrabold color-primary mb-1">
              {curriculum.subject}
            </h2>
            <p className="text-base">
              Welcome back, <span className="font-bold">{session?.name}</span>! Select a topic below to begin your adaptive learning journey.
            </p>
          </div>
          <Button variant="secondary" size="lg" className="self-start md:self-auto flex items-center justify-center">
            🚀 Resume Learning
          </Button>
        </div>
      </Card>

      {/* Chapters Grid */}
      <section>
        <h3 className="text-2xl font-bold mb-4 color-primary">
          Chapters & Topics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {curriculum.chapters.map((chapter) => (
            <Card key={chapter.chapter_id} variant="white" className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <Badge variant="blue" className="mb-1">
                    {chapter.chapter_id}
                  </Badge>
                  <h4 className="text-2xl font-bold">
                    {chapter.chapter_name}
                  </h4>
                </div>
                <Badge variant="yellow">
                  {chapter.topics.length} Topics
                </Badge>
              </div>

              {/* Topics List */}
              <div className="flex flex-col gap-3">
                {chapter.topics.map((topic) => (
                  <div
                    key={topic.topic_id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📚</span>
                      <div>
                        <p className="font-bold text-base">
                          {topic.topic_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={topic.is_completed ? 'green' : 'orange'}>
                        {topic.is_completed ? '✓ Completed' : 'Pending'}
                      </Badge>
                      <Button
                        variant={topic.is_completed ? 'white' : 'primary'}
                        size="sm"
                      >
                        {topic.is_completed ? 'Review' : 'Start'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
