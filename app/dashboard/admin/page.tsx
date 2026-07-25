'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useUserSession } from '@/lib/store';

export default function AdminDashboard() {
  const router = useRouter();
  const { session, role, isLoaded, logout } = useUserSession();

  useEffect(() => {
    if (isLoaded && role !== 'ADMIN') {
      router.push('/');
    }
  }, [isLoaded, role, router]);

  if (!isLoaded || role !== 'ADMIN') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto flex flex-col justify-center">
      <Card variant="white" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <Badge variant="orange">Admin Control</Badge>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <h1 className="text-3xl font-bold color-primary mb-2">
          Welcome, {session?.name}!
        </h1>
        <p className="text-base mb-6">
          You are signed in as an Institutional Administrator. Manage user credentials, curriculum hierarchy, and platform configuration.
        </p>

        <div className="flex gap-4">
          <Button variant="orange" size="md">
            ⚙️ Institutional Settings
          </Button>
        </div>
      </Card>
    </main>
  );
}
