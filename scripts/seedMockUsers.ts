import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kzpjysbpumrkcasjjtqy.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ac6YjFQ39QtQFILV48S9ug_VddsfAhH';

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

export async function seedMockUsers() {
  console.log(`🚀 Starting Bulk User Seeding for Institute: ${INSTITUTE_ID}`);
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // 1. Seed Teachers
  for (const tch of MOCK_TEACHERS) {
    const email = `${tch.id}@${INSTITUTE_ID}.brainbee.edu`.toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: DEFAULT_PASSWORD,
      options: { data: { full_name: tch.name, role: 'TEACHER', institute_id: INSTITUTE_ID } }
    });

    if (error && !error.message.includes('already registered')) {
      console.error(`❌ Error creating ${email}:`, error.message);
    } else {
      console.log(`✅ Teacher Account Ready: ${email}`);
    }

    if (data?.user?.id) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: tch.name,
        role: 'TEACHER',
        updated_at: new Date().toISOString(),
      });
    }
  }

  // 2. Seed Students
  for (const stu of MOCK_STUDENTS) {
    const email = `${stu.id}@${INSTITUTE_ID}.brainbee.edu`.toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: DEFAULT_PASSWORD,
      options: { data: { full_name: stu.name, role: 'STUDENT', institute_id: INSTITUTE_ID } }
    });

    if (error && !error.message.includes('already registered')) {
      console.error(`❌ Error creating ${email}:`, error.message);
    } else {
      console.log(`✅ Student Account Ready: ${email}`);
    }

    if (data?.user?.id) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: stu.name,
        role: 'STUDENT',
        updated_at: new Date().toISOString(),
      });

      await supabase.from('chapter_tiers').upsert({
        user_id: data.user.id,
        subject_id: 'math',
        chapter_id: 'chap_01',
        assigned_tier: stu.tier,
        updated_at: new Date().toISOString(),
      });
    }
  }

  console.log('✨ Bulk Seeding Completed Successfully!');
}

seedMockUsers().catch(console.error);
