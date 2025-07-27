import { NextRequest, NextResponse } from 'next/server';
import { BEStrongAI } from '@/app/utils/ai-features';

const beStrongAI = new BEStrongAI();

export async function POST(request: NextRequest) {
  try {
    const { content, category } = await request.json();

    if (!content) {
      return NextResponse.json({ 
        success: false, 
        error: 'Contenu requis' 
      }, { status: 400 });
    }

    const optimizedContent = await beStrongAI.optimizeContent(content, category);

    return NextResponse.json({
      success: true,
      data: optimizedContent
    });

  } catch (error) {
    console.error('Erreur optimisation contenu:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de l\'optimisation' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: false, 
    error: 'Méthode GET non supportée' 
  }, { status: 405 });
} 