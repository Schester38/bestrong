import { NextRequest, NextResponse } from 'next/server';
import { beStrongAI } from '@/app/utils/ai-features';

export async function GET(request: NextRequest) {
  try {
    const weeklySchedule = await beStrongAI.getWeeklySchedule();
    
    return NextResponse.json({
      success: true,
      data: weeklySchedule
    });
  } catch (error) {
    console.error('❌ Erreur planning hebdomadaire:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du planning' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    const weeklySchedule = await beStrongAI.getWeeklySchedule();
    
    return NextResponse.json({
      success: true,
      data: weeklySchedule
    });
  } catch (error) {
    console.error('❌ Erreur planning hebdomadaire:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du planning' },
      { status: 500 }
    );
  }
} 