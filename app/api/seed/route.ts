import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const INSTITUTE_ID = 'DEMO-SCH-01';
const DEFAULT_PASSWORD = 'BrainBee2026!';

const MOCK_TEACHERS = [
  { id: 'TCH-001', name: 'Ms. Clara Teacher', role: 'TEACHER' },
  { id: 'TCH-002', name: 'Mr. Robert Evans', role: 'TEACHER' },
];

const MOCK_STUDENTS = [
  { id: 'STU-001', name: 'Alex Student', section: '15-A', tier: 'ADVANCED' },
  { id: 'STU-002', name: 'Priya Sharma', section: '15-A', tier: 'INTERMEDIATE' },
  { id: 'STU-003', name: 'Marcus Chen', section: '15-B', tier: 'BEGINNER' },
  { id: 'STU-004', name: 'Sarah Miller', section: '15-A', tier: 'BEGINNER' },
  { id: 'STU-005', name: 'David Kim', section: '15-B', tier: 'INTERMEDIATE' },
  { id: 'STU-006', name: 'Emma Watson', section: '15-A', tier: 'ADVANCED' },
  { id: 'STU-007', name: 'Liam Patel', section: '15-B', tier: 'BEGINNER' },
  { id: 'STU-008', name: 'Sophia Garcia', section: '15-A', tier: 'INTERMEDIATE' },
  { id: 'STU-009', name: 'Noah Davis', section: '15-B', tier: 'ADVANCED' },
  { id: 'STU-010', name: 'Olivia Taylor', section: '15-A', tier: 'BEGINNER' },
];

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

  if (!url || !key) {
    return NextResponse.json({ error: 'Supabase URL or Key missing in env' }, { status: 500 });
  }

  const supabase = createClient(url, key);
  const createdProfiles: any[] = [];
  const errors: any[] = [];

  // STEP 3: GENERATE TEACHER ACCOUNTS
  for (const tch of MOCK_TEACHERS) {
    const email = `${tch.id}@${INSTITUTE_ID}.brainbee.edu`.toLowerCase();
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: DEFAULT_PASSWORD,
        options: {
          data: {
            full_name: tch.name,
            role: tch.role,
            institute_id: INSTITUTE_ID,
            user_id: tch.id,
          },
        },
      });

      if (error && !error.message.includes('already registered')) {
        errors.push({ email, error: error.message });
      }

      const uid = data?.user?.id;
      if (uid) {
        await supabase.from('profiles').upsert({
          id: uid,
          email,
          full_name: tch.name,
          role: 'TEACHER',
          updated_at: new Date().toISOString(),
        });
        createdProfiles.push({ id: tch.id, email, role: 'TEACHER' });
      }
    } catch (e: any) {
      errors.push({ email, error: e?.message });
    }
  }

  // STEP 4: GENERATE STUDENT ACCOUNTS
  for (const stu of MOCK_STUDENTS) {
    const email = `${stu.id}@${INSTITUTE_ID}.brainbee.edu`.toLowerCase();
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: DEFAULT_PASSWORD,
        options: {
          data: {
            full_name: stu.name,
            role: 'STUDENT',
            institute_id: INSTITUTE_ID,
            student_id: stu.id,
            section: stu.section,
          },
        },
      });

      if (error && !error.message.includes('already registered')) {
        errors.push({ email, error: error.message });
      }

      const uid = data?.user?.id;
      if (uid) {
        await supabase.from('profiles').upsert({
          id: uid,
          email,
          full_name: stu.name,
          role: 'STUDENT',
          updated_at: new Date().toISOString(),
        });

        // Insert initial baseline tier
        await supabase.from('chapter_tiers').upsert({
          user_id: uid,
          subject_id: 'math',
          chapter_id: 'chap_01',
          assigned_tier: stu.tier,
          updated_at: new Date().toISOString(),
        });

        createdProfiles.push({ id: stu.id, email, role: 'STUDENT', tier: stu.tier });
      }
    } catch (e: any) {
      errors.push({ email, error: e?.message });
    }
  }

  return NextResponse.json({
    status: 'Bulk Mock User Seeding Completed',
    school: INSTITUTE_ID,
    defaultPassword: DEFAULT_PASSWORD,
    createdCount: createdProfiles.length,
    profiles: createdProfiles,
    errors,
  });
}
