import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Supprimer les cookies TikTok
    const response = NextResponse.json({ 
      success: true, 
      message: 'Déconnexion TikTok réussie' 
    });

    response.cookies.delete('tiktok_access_token');
    response.cookies.delete('tiktok_refresh_token');

    return response;

  } catch (error) {
    console.error('Erreur lors de la déconnexion TikTok:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
} 