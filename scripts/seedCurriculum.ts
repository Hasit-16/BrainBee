import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kzpjysbpumrkcasjjtqy.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6cGp5c2JwdW1ya2Nhc2pqdHF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODI5MzAsImV4cCI6MjEwMDY1ODkzMH0.vuxFZqjZmrQdvHaDO_fisk1ACr1B1Rzkzw3YM1vwuus';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface ChapterItem {
  subject: string;
  chapter_number: number;
  title: string;
}

export async function seedCurriculum() {
  console.log('🌱 Starting Curriculum Master Data Seeding...');

  // 1. Read JSON file
  const jsonPath = path.join(process.cwd(), 'lib', 'subject_and_chapters.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Curriculum JSON file not found at ${jsonPath}`);
  }

  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const items: ChapterItem[] = JSON.parse(rawData);

  // 2. Extract distinct subject names
  const subjectNames = Array.from(new Set(items.map((item) => item.subject)));
  console.log(`📚 Found ${subjectNames.length} distinct subjects:`, subjectNames);

  // 3. Upsert subjects into `subjects` table
  const subjectMap: Record<string, string> = {};

  for (const name of subjectNames) {
    const { data, error } = await supabase
      .from('subjects')
      .upsert({ name }, { onConflict: 'name' })
      .select('id, name')
      .single();

    if (error) {
      console.warn(`⚠️ Warning upserting subject ${name}: ${error.message}. Attempting direct query...`);
      const { data: existing, error: findError } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('name', name)
        .single();
      
      if (existing) {
        subjectMap[name] = existing.id;
        console.log(`✅ Found existing Subject "${name}" -> UUID: ${existing.id}`);
      } else {
        console.error(`❌ Failed to resolve Subject "${name}":`, findError?.message);
      }
    } else if (data) {
      subjectMap[name] = data.id;
      console.log(`✅ Upserted Subject "${name}" -> UUID: ${data.id}`);
    }
  }

  // 4. Map JSON array to `chapters` insert payload
  const chaptersPayload = items.map((item) => ({
    subject_id: subjectMap[item.subject],
    chapter_number: item.chapter_number,
    title: item.title,
  }));

  console.log(`📖 Upserting ${chaptersPayload.length} chapters into "chapters" table...`);

  // 5. Bulk upsert chapters
  const { data: insertedChapters, error: chapError } = await supabase
    .from('chapters')
    .upsert(chaptersPayload, { onConflict: 'subject_id,chapter_number' })
    .select();

  if (chapError) {
    console.error('❌ Error inserting chapters:', chapError.message);
    throw chapError;
  }

  console.log(`🎉 Successfully seeded ${insertedChapters?.length || chaptersPayload.length} chapters into Supabase!`);
  return {
    subjectsSeeded: Object.keys(subjectMap).length,
    chaptersSeeded: insertedChapters?.length || chaptersPayload.length,
    subjects: subjectMap
  };
}

// Allow direct CLI execution with ts-node
if (require.main === module) {
  seedCurriculum()
    .then((res) => {
      console.log('✅ Seeding Complete:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seeding Failed:', err);
      process.exit(1);
    });
}
