'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useUserSession, Role } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { role, isLoaded, login } = useUserSession();

  useEffect(() => {
    if (isLoaded && role) {
      router.push(`/dashboard/${role.toLowerCase()}`);
    }
  }, [isLoaded, role, router]);

  const handleRoleLogin = (selectedRole: Role) => {
    login(selectedRole);
    router.push(`/dashboard/${selectedRole.toLowerCase()}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <h1 className="text-4xl font-bold color-primary">
              BrainBee
            </h1>
            <Badge variant="yellow">PWA</Badge>
          </div>
          <p className="text-lg">
            Adaptive Learning Management System
          </p>
        </div>

        <Card variant="white">
          <div className="text-center mb-6">
            <Badge variant="blue" className="mb-3">
              Portal Access
            </Badge>
            <h2 className="text-2xl font-bold mb-2">
              Select Your Role to Login
            </h2>
            <p className="text-sm">
              Click any of the options below to initiate your active session.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              variant="secondary"
              size="lg"
              className="w-full flex items-center justify-center"
              onClick={() => handleRoleLogin('STUDENT')}
            >
              🎓 Login as Student
            </Button>

            <Button
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center"
              onClick={() => handleRoleLogin('TEACHER')}
            >
              👩‍🏫 Login as Teacher
            </Button>

            <Button
              variant="orange"
              size="lg"
              className="w-full flex items-center justify-center"
              onClick={() => handleRoleLogin('ADMIN')}
            >
              ⚙️ Login as Admin
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
