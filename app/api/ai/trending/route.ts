import { NextRequest, NextResponse } from 'next/server';
import { beStrongAI } from '@/app/utils/ai-features';

export async function GET(request: NextRequest) {
  try {
    const trendingAnalysis = await beStrongAI.getTrendingAnalysis();
    
    return NextResponse.json({
      success: true,
      data: trendingAnalysis
    });
  } catch (error) {
    console.error('❌ Erreur analyse tendances:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'analyse des tendances' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category } = body;
    
    const trendingAnalysis = await beStrongAI.getTrendingAnalysis();
    
    return NextResponse.json({
      success: true,
      data: trendingAnalysis
    });
  } catch (error) {
    console.error('❌ Erreur analyse tendances:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'analyse des tendances' },
      { status: 500 }
    );
  }
} 