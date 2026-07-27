'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      if (mode === 'LOGIN') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.toLowerCase().includes('invalid')) {
            setErrorMessage('Invalid login credentials. Please check your email and password.');
          } else {
            setErrorMessage(error.message);
          }
          setLoading(false);
          return;
        }

        if (data.user) {
          setSuccessMessage('Login successful! Redirecting to dashboard...');
          setTimeout(() => {
            router.push('/learning/dashboard');
          }, 600);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name || 'Student',
              role: 'STUDENT',
            },
          },
        });

        if (error) {
          if (error.message.toLowerCase().includes('already registered')) {
            setErrorMessage('User already exists. Please sign in instead.');
          } else {
            setErrorMessage(error.message);
          }
          setLoading(false);
          return;
        }

        if (data.user) {
          setSuccessMessage('Registration successful! Redirecting to dashboard...');
          setTimeout(() => {
            router.push('/learning/dashboard');
          }, 600);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-[var(--bg-light)]">
      <div className="w-full max-w-md">
        <Card variant="white" className="p-8 flex flex-col gap-6">
          <div className="text-center flex flex-col items-center gap-2">
            <span className="text-5xl animate-bounce">🐝</span>
            <Badge variant="purple">BrainBee Auth Portal</Badge>
            <h1 className="text-3xl font-extrabold color-primary">
              {mode === 'LOGIN' ? 'Welcome Back!' : 'Create Account'}
            </h1>
            <p className="text-sm opacity-75">
              {mode === 'LOGIN'
                ? 'Sign in to access your adaptive learning dashboard'
                : 'Register to unlock your personalized K-12 learning ladder'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-gray-100 p-1.5 rounded-2xl">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
                mode === 'LOGIN' ? 'bg-white shadow text-[var(--color-primary)]' : 'text-gray-600'
              }`}
              onClick={() => {
                setMode('LOGIN');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
                mode === 'REGISTER' ? 'bg-white shadow text-[var(--color-primary)]' : 'text-gray-600'
              }`}
              onClick={() => {
                setMode('REGISTER');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
            >
              Register
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-sm font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-green-50 border-2 border-green-200 text-green-700 text-sm font-bold flex items-center gap-2">
              <span>✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Alex Student"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="student@brainbee.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full flex justify-center mt-2 cursor-pointer"
              disabled={loading}
            >
              {loading
                ? 'Authenticating...'
                : mode === 'LOGIN'
                ? 'Sign In 🚀'
                : 'Create Account ✨'}
            </Button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs font-bold color-primary hover:underline">
              ← Return to Role Selection Landing Page
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
