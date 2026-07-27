'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useUserSession } from '@/lib/store';
import { mockData } from '@/lib/mockData';

export default function StudentDashboardHub() {
  const router = useRouter();
  const { session, role, isLoaded, logout, tier } = useUserSession();

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

  const { student, subjects } = mockData;

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-white/70 backdrop-blur border border-white/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-bold text-xl">
            👤
          </div>
          <div>
            <h1 className="text-2xl font-bold color-primary">
              Welcome back, {session?.name || student.name}!
            </h1>
            <p className="text-sm font-medium">
              Grade 5 • Tier: <span className="font-bold">{tier || student.tier}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="warning" size="md" className="flex items-center gap-2">
            🔍 Doubt Scan
          </Button>
          <Badge variant="yellow">⭐ {student.xp} XP</Badge>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Section 1: Subjects Cards Row/Grid */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold color-primary">Explore Subjects</h2>
          <Badge variant="blue">Select to Start Learning</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <Link key={sub.subject_id} href={`/learning/${sub.subject_id}`} className="no-underline">
              <Card variant={sub.color} interactive className="h-full flex flex-col justify-between p-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{sub.icon}</span>
                    <Badge variant="yellow">{sub.standard}</Badge>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{sub.subject_name}</h3>
                  <p className="text-sm opacity-90 mb-4">
                    {sub.chapters.length} Chapters Available
                  </p>
                </div>
                <div className="pt-2">
                  <ProgressBar progressPercentage={sub.progress} />
                  <div className="mt-3 flex justify-end">
                    <span className="font-bold text-sm underline">Enter Subject →</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 2: Progress Bars Panel */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold color-primary">Learning Progress</h2>
        <Card variant="white" className="flex flex-col gap-6 p-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-base">Overall Platform Progress</span>
              <span className="font-bold text-sm color-primary">{student.overallProgress}%</span>
            </div>
            <ProgressBar progressPercentage={student.overallProgress} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            {subjects.map((sub) => (
              <div key={sub.subject_id} className="flex flex-col gap-2 p-3 rounded-2xl bg-gray-50">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>{sub.icon} {sub.subject_name}</span>
                  <span>{sub.progress}%</span>
                </div>
                <ProgressBar progressPercentage={sub.progress} />
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Section 3: Diagnostic Report Summary */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold color-primary">Diagnostic Report Summary</h2>
        <Card variant="white" className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">📊</div>
            <div>
              <h3 className="text-xl font-bold mb-1">
                Initial Assessment Status
              </h3>
              <p className="text-base leading-relaxed opacity-90 max-w-xl">
                Your 5-question baseline diagnostic evaluates your knowledge to assign your personalized learning tier ({tier || 'UNASSIGNED'}).
              </p>
            </div>
          </div>
          <Link href="/learning/math/chap_01/diagnostic" className="no-underline shrink-0">
            <Button variant="secondary" size="lg" className="flex items-center justify-center">
              🚀 Start Diagnostic Test
            </Button>
          </Link>
        </Card>
      </section>
    </main>
  );
}
