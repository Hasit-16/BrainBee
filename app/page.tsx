import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { mockData } from '@/lib/mockData';

export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="logo-text" style={{ fontSize: '2rem', fontWeight: 700 }}>
            <span>B</span><span>r</span><span>a</span><span>i</span><span>n</span><span>B</span><span>e</span><span>e</span>
          </div>
          <Badge variant="blue">Adaptive LMS</Badge>
        </div>
        <Badge variant="yellow">⭐ {mockData.student.xp} XP</Badge>
      </div>

      {/* Main Welcome Card */}
      <Card variant="white" style={{ marginBottom: '2rem' }}>
        <Badge variant="yellow" style={{ marginBottom: '1rem', fontWeight: 700 }}>
          🚀 Grade 5 Mathematics
        </Badge>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--clay-blue)' }}>
          Welcome to BrainBee!
        </h1>
        <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          Your personalized, adaptive learning journey starts here. Explore 10-minute micro-lessons tailored to your cognitive tier.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button variant="secondary" size="lg">
            Start Learning
          </Button>
          <Button variant="white" size="lg">
            Diagnostic Test
          </Button>
        </div>
      </Card>

      {/* Curriculum Grid Preview */}
      <h2 style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>Current Curriculum Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {mockData.curriculum.chapters.map((chap) => (
          <Card key={chap.chapter_id} variant="blue" interactive>
            <Badge variant="yellow" style={{ marginBottom: '0.75rem' }}>
              {mockData.curriculum.subject}
            </Badge>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{chap.chapter_name}</h3>
            <p style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
              {chap.topics.length} Adaptive Topics Available
            </p>
            <ProgressBar progressPercentage={0} label="Chapter Progress" />
          </Card>
        ))}
      </div>
    </main>
  );
}
