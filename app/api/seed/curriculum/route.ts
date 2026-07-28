import { NextResponse } from 'next/server';
import { seedCurriculum } from '@/scripts/seedCurriculum';

export async function GET() {
  try {
    const result = await seedCurriculum();
    return NextResponse.json({
      success: true,
      message: 'Curriculum seeded successfully!',
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to seed curriculum' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
