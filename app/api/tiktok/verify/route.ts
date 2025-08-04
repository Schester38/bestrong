import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Retourner le code de vérification TikTok actuel
    return new NextResponse('MrrkyxAZOWBAYx6Rla9ONr7vhx2zqXzY', {
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