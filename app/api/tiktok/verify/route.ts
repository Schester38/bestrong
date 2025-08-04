import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Retourner le nouveau code de vérification TikTok
    return new NextResponse('b4fjPkzoqcE6s55G6NaONtbtgBHuULzy', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la vérification TikTok:', error);
    return NextResponse.json({ error: 'Erreur de vérification' }, { status: 500 });
  }
} 